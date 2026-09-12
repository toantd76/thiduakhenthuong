import { Router, Request, Response, NextFunction } from 'express';
import { db, hashPassword } from './db.ts';
import {
  RoleType,
  EmulationRegistration,
  EmulationItem,
  DepartmentReview,
  BoardEvaluation,
  OfficialRecognition,
  LegalCitation,
  EmulationTitleConfig,
  CriterionTemplate
} from '../src/types.ts';

export const apiRouter = Router();

// --- Authentication Middleware ---

export interface AuthenticatedRequest extends Request {
  user?: ReturnType<typeof db.getPersonnelById>;
  userRoles?: RoleType[];
  token?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Phiên làm việc không hợp lệ hoặc đã hết hạn' });
  }

  const user = db.getPersonnelById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Người dùng không tồn tại' });
  }

  if (user.isLocked) {
    return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.' });
  }

  req.user = user;
  req.userRoles = user.roles;
  req.token = token;
  next();
}

export function requireRole(...allowedRoles: RoleType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userRoles) {
      return res.status(401).json({ error: 'Yêu cầu đăng nhập' });
    }
    const hasRole = allowedRoles.some((r) => req.userRoles!.includes(r));
    if (!hasRole) {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện chức năng này' });
    }
    next();
  };
}

// Helper to mask CCCD: "040076003624" -> "040***3624"
export function maskCCCD(cccd: string): string {
  if (!cccd || cccd.length < 6) return '***';
  return `${cccd.substring(0, 3)}***${cccd.substring(cccd.length - 4)}`;
}

// --- Auth Routes ---

apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập (CCCD) và mật khẩu' });
  }

  const user = db.getPersonnelByCCCDOrUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác' });
  }

  // Check if account is pending verification (e.g. duplicate CCCD)
  if (user.accountStatus === 'pending_verification') {
    return res.status(403).json({
      error: 'Tài khoản đang tạm khóa chờ xác minh CCCD do phát hiện trùng số căn cước với nhân sự khác trong danh sách (STT 57 và 58). Vui lòng liên hệ Quản trị viên để cập nhật CCCD chính xác trước khi kích hoạt đăng nhập.'
    });
  }

  if (user.isLocked) {
    return res.status(403).json({
      error: 'Tài khoản đã bị tạm khóa do nhập sai mật khẩu quá 5 lần. Vui lòng liên hệ Quản trị viên để mở khóa.'
    });
  }

  const inputHash = hashPassword(password, user.salt);
  if (inputHash !== user.passwordHash) {
    const attempts = user.failedLoginAttempts + 1;
    const isLocked = attempts >= 5;
    db.updatePersonnel(user.id, {
      failedLoginAttempts: attempts,
      isLocked
    });

    db.logAction(user.id, user.fullName, 'LOGIN_FAILED', `Đăng nhập thất bại lần ${attempts}${isLocked ? ' (Tài khoản bị khóa)' : ''}`, req.ip);

    if (isLocked) {
      return res.status(403).json({
        error: 'Bạn đã nhập sai mật khẩu 5 lần. Tài khoản đã bị tạm khóa vì lý do an toàn. Vui lòng liên hệ Quản trị viên.'
      });
    }
    return res.status(401).json({
      error: `Mật khẩu không chính xác. Bạn còn ${5 - attempts} lần thử.`
    });
  }

  // Reset failed attempts on success
  db.updatePersonnel(user.id, { failedLoginAttempts: 0 });

  const token = db.createSession(user.id);
  db.logAction(user.id, user.fullName, 'LOGIN_SUCCESS', 'Đăng nhập thành công vào hệ thống', req.ip);

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      department: user.department,
      currentPosition: user.currentPosition,
      specialty: user.specialty,
      roles: user.roles,
      cccd: user.roles.includes('admin') ? 'Admin' : maskCCCD(user.cccd),
      fullCCCD: user.cccd,
      birthDate: user.birthDate,
      gender: user.gender,
      needsPasswordChange: user.needsPasswordChange,
      accountStatus: user.accountStatus
    }
  });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      department: user.department,
      currentPosition: user.currentPosition,
      specialty: user.specialty,
      roles: user.roles,
      cccd: maskCCCD(user.cccd),
      fullCCCD: user.cccd,
      birthDate: user.birthDate,
      gender: user.gender,
      needsPasswordChange: user.needsPasswordChange,
      accountStatus: user.accountStatus
    }
  });
});

apiRouter.post('/auth/change-password', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
  }

  if (newPassword === 'Ds@123') {
    return res.status(400).json({ error: 'Mật khẩu mới không được trùng với mật khẩu mặc định khởi tạo ban đầu' });
  }

  // Verify current password if provided
  if (currentPassword) {
    const currentHash = hashPassword(currentPassword, user.salt);
    if (currentHash !== user.passwordHash) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    }
  }

  const newHash = hashPassword(newPassword, user.salt);
  db.updatePersonnel(user.id, {
    passwordHash: newHash,
    needsPasswordChange: false
  });

  db.logAction(user.id, user.fullName, 'CHANGE_PASSWORD', 'Người dùng đã đổi mật khẩu thành công', req.ip);

  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

apiRouter.post('/auth/logout', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (req.token) {
    db.removeSession(req.token);
  }
  if (req.user) {
    db.logAction(req.user.id, req.user.fullName, 'LOGOUT', 'Đăng xuất khỏi hệ thống', req.ip);
  }
  res.json({ success: true });
});

// --- Personnel Public / School Directory ---

apiRouter.get('/personnel', authMiddleware, (req: AuthenticatedRequest, res) => {
  const all = db.getPersonnelList();
  const isAdmin = req.userRoles?.includes('admin');

  const sanitized = all
    .filter((p) => p.id !== 'ADMIN01')
    .map((p) => ({
      id: p.id,
      stt: p.stt,
      fullName: p.fullName,
      gender: p.gender,
      specialty: p.specialty,
      currentPosition: p.currentPosition,
      department: p.department,
      accountStatus: p.accountStatus,
      roles: p.roles,
      // CCCD is only full for admin; for others it's masked or hidden
      cccd: isAdmin ? p.cccd : maskCCCD(p.cccd),
      notes: isAdmin ? p.notes : undefined
    }));

  res.json(sanitized);
});

// --- Emulation: My Registration ---

apiRouter.get('/emulation/my', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const year = db.getSchoolYear();
  let reg = db.getRegistrationByPersonnelId(user.id, year.year);

  if (!reg) {
    // If not yet registered, create a draft structure
    reg = {
      id: `REG_${year.year.replace('-', '_')}_${user.id}`,
      personnelId: user.id,
      academicYear: year.year,
      status: 'draft',
      registeredTitle: 'Lao động tiên tiến',
      registeredAward: 'Giấy khen của Hiệu trưởng',
      registeredDutyTarget: 'Hoàn thành tốt nhiệm vụ',
      items: [],
      reopenHistory: [],
      versionsCount: 1,
      updatedAt: new Date().toISOString()
    };
    db.saveRegistration(reg);
  }

  res.json({ registration: reg, schoolYear: year });
});

apiRouter.put('/emulation/my', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const year = db.getSchoolYear();
  const existing = db.getRegistrationByPersonnelId(user.id, year.year);

  if (!existing) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ đăng ký' });
  }

  // Rule: Cannot edit directly if already approved or locked
  if (existing.status === 'approved' || existing.status === 'locked') {
    return res.status(400).json({
      error: 'Hồ sơ đã được phê duyệt hoặc đã khóa. Không được chỉnh sửa trực tiếp. Vui lòng gửi yêu cầu mở lại hồ sơ nếu cần điều chỉnh.'
    });
  }

  const { registeredTitle, registeredAward, registeredDutyTarget, items } = req.body;

  existing.registeredTitle = registeredTitle ?? existing.registeredTitle;
  existing.registeredAward = registeredAward ?? existing.registeredAward;
  existing.registeredDutyTarget = registeredDutyTarget ?? existing.registeredDutyTarget;
  if (Array.isArray(items)) {
    // Retain existing departmentReviews and boardEvaluations to prevent overwriting
    const updatedItems = items.map((newItem: EmulationItem) => {
      const oldItem = existing.items.find((it) => it.id === newItem.id);
      return {
        ...newItem,
        departmentReview: oldItem?.departmentReview,
        boardEvaluation: oldItem?.boardEvaluation
      };
    });
    existing.items = updatedItems;
  }

  db.saveRegistration(existing);
  db.logAction(user.id, user.fullName, 'UPDATE_REGISTRATION', 'Cập nhật nội dung đăng ký thi đua đầu năm', req.ip);

  res.json({ success: true, registration: existing });
});

apiRouter.post('/emulation/my/submit', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const year = db.getSchoolYear();
  const existing = db.getRegistrationByPersonnelId(user.id, year.year);

  if (!existing) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ đăng ký' });
  }

  if (existing.status === 'approved' || existing.status === 'locked') {
    return res.status(400).json({ error: 'Hồ sơ đã duyệt hoặc đã khóa' });
  }

  if (existing.items.length === 0) {
    return res.status(400).json({ error: 'Vui lòng đăng ký ít nhất một tiêu chuẩn thi đua trước khi gửi' });
  }

  existing.status = 'submitted';
  existing.submittedAt = new Date().toISOString();
  existing.versionsCount = (existing.versionsCount || 1) + 1;

  db.saveRegistration(existing);
  db.logAction(user.id, user.fullName, 'SUBMIT_REGISTRATION', `Nộp hồ sơ đăng ký thi đua năm học ${year.year} (Phiên bản ${existing.versionsCount})`, req.ip);

  res.json({ success: true, registration: existing, message: 'Đã gửi hồ sơ đăng ký thi đua thành công!' });
});

apiRouter.post('/emulation/my/request-reopen', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { reason } = req.body;
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Vui lòng nêu rõ lý do xin mở lại điều chỉnh hồ sơ' });
  }

  const year = db.getSchoolYear();
  const existing = db.getRegistrationByPersonnelId(user.id, year.year);
  if (!existing) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  existing.reopenHistory.push({
    reopenedAt: new Date().toISOString(),
    reopenedBy: user.id,
    reopenedByName: user.fullName,
    reason: `Cá nhân yêu cầu điều chỉnh: ${reason.trim()}`
  });
  existing.status = 'revision_requested';

  db.saveRegistration(existing);
  db.logAction(user.id, user.fullName, 'REQUEST_REOPEN', `Yêu cầu mở lại điều chỉnh hồ sơ. Lý do: ${reason}`, req.ip);

  res.json({ success: true, message: 'Đã chuyển trạng thái sang Yêu cầu bổ sung/điều chỉnh', registration: existing });
});

// Update Actual Performance & Proofs (Does NOT change registered goals!)
apiRouter.put('/emulation/my/results', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const year = db.getSchoolYear();
  const existing = db.getRegistrationByPersonnelId(user.id, year.year);

  if (!existing) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ đăng ký' });
  }

  const { itemsResults } = req.body; // Array of { itemId, actualResult, actualValue, actualProofDescription, proofUrl, proofConfidential, completionLevel, completionRate, selfAssessmentNote }

  if (!Array.isArray(itemsResults)) {
    return res.status(400).json({ error: 'Dữ liệu kết quả không hợp lệ' });
  }

  for (const resItem of itemsResults) {
    const targetItem = existing.items.find((it) => it.id === resItem.itemId);
    if (targetItem) {
      targetItem.actualResult = resItem.actualResult ?? targetItem.actualResult;
      targetItem.actualValue = resItem.actualValue ?? targetItem.actualValue;
      targetItem.actualProofDescription = resItem.actualProofDescription ?? targetItem.actualProofDescription;
      targetItem.proofUrl = resItem.proofUrl ?? targetItem.proofUrl;
      targetItem.proofConfidential = Boolean(resItem.proofConfidential);
      targetItem.completionLevel = resItem.completionLevel ?? targetItem.completionLevel;
      targetItem.completionRate = resItem.completionRate !== undefined ? resItem.completionRate : targetItem.completionRate;
      targetItem.selfAssessmentNote = resItem.selfAssessmentNote ?? targetItem.selfAssessmentNote;
    }
  }

  db.saveRegistration(existing);
  db.logAction(user.id, user.fullName, 'UPDATE_RESULTS', 'Cập nhật tiến độ thực hiện nhiệm vụ và minh chứng', req.ip);

  res.json({ success: true, registration: existing, message: 'Đã lưu kết quả thực hiện và minh chứng' });
});

// Self-Evaluation at Year-End
apiRouter.post('/emulation/my/self-evaluation', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const year = db.getSchoolYear();
  const existing = db.getRegistrationByPersonnelId(user.id, year.year);

  if (!existing) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  const { selfProposedRating, selfProposedTitle, selfProposedAward, summarySelfReport } = req.body;

  if (!selfProposedRating || !selfProposedTitle) {
    return res.status(400).json({ error: 'Vui lòng chọn mức độ tự đánh giá và danh hiệu đề nghị' });
  }

  existing.selfEvaluation = {
    selfProposedRating,
    selfProposedTitle,
    selfProposedAward: selfProposedAward || '',
    summarySelfReport: summarySelfReport || '',
    submittedAt: new Date().toISOString()
  };

  db.saveRegistration(existing);
  db.logAction(user.id, user.fullName, 'SUBMIT_SELF_EVALUATION', `Gửi phiếu tự đánh giá cuối năm (Đề nghị: ${selfProposedTitle}, Xếp loại: ${selfProposedRating})`, req.ip);

  res.json({ success: true, registration: existing, message: 'Đã lưu và gửi bản tự đánh giá cuối năm' });
});

// --- Department Head Review Routes ---

apiRouter.get('/emulation/department/list', authMiddleware, requireRole('department_head', 'school_board', 'admin'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const isSchoolWide = req.userRoles?.includes('school_board') || req.userRoles?.includes('admin');
  const allPersonnel = db.getPersonnelList();
  const allRegs = db.getAllRegistrations();

  // If department head, only their department. If school board / admin, can view all
  const targetDepartment = isSchoolWide && req.query.department ? String(req.query.department) : isSchoolWide ? null : user.department;

  const filteredPersonnel = allPersonnel.filter((p) => {
    if (p.id === 'ADMIN01') return false;
    if (targetDepartment) return p.department === targetDepartment;
    return true;
  });

  const results = filteredPersonnel.map((p) => {
    const reg = allRegs.find((r) => r.personnelId === p.id);
    return {
      personnel: {
        id: p.id,
        stt: p.stt,
        fullName: p.fullName,
        gender: p.gender,
        specialty: p.specialty,
        currentPosition: p.currentPosition,
        department: p.department
      },
      registration: reg || null
    };
  });

  res.json(results);
});

apiRouter.post('/emulation/department/review', authMiddleware, requireRole('department_head', 'school_board', 'admin'), (req: AuthenticatedRequest, res) => {
  const reviewer = req.user!;
  const { registrationId, itemsReviews, departmentRecommendation } = req.body;

  const allRegs = db.getAllRegistrations();
  const reg = allRegs.find((r) => r.id === registrationId);

  if (!reg) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ đăng ký' });
  }

  const targetPerson = db.getPersonnelById(reg.personnelId);
  if (!targetPerson) {
    return res.status(404).json({ error: 'Không tìm thấy nhân sự của hồ sơ này' });
  }

  // Check department scope
  const isSchoolWide = req.userRoles?.includes('school_board') || req.userRoles?.includes('admin');
  if (!isSchoolWide && targetPerson.department !== reviewer.department) {
    return res.status(403).json({ error: 'Bạn chỉ có quyền nhận xét, thẩm định trong phạm vi tổ chuyên môn được phân công' });
  }

  // Save individual items review separately without overwriting user inputs
  if (Array.isArray(itemsReviews)) {
    for (const rev of itemsReviews) {
      const item = reg.items.find((it) => it.id === rev.itemId);
      if (item) {
        item.departmentReview = {
          reviewerId: reviewer.id,
          reviewerName: reviewer.fullName,
          reviewedAt: new Date().toISOString(),
          comment: rev.comment || '',
          suggestedStatus: rev.suggestedStatus || 'agree'
        };
      }
    }
  }

  // Save department recommendation
  if (departmentRecommendation) {
    reg.departmentRecommendation = {
      reviewerId: reviewer.id,
      reviewerName: reviewer.fullName,
      recommendedRating: departmentRecommendation.recommendedRating || '',
      recommendedTitle: departmentRecommendation.recommendedTitle || '',
      recommendedAward: departmentRecommendation.recommendedAward || '',
      comment: departmentRecommendation.comment || '',
      status: departmentRecommendation.status || 'recommended',
      updatedAt: new Date().toISOString()
    };
  }

  db.saveRegistration(reg);
  db.logAction(reviewer.id, reviewer.fullName, 'DEPARTMENT_REVIEW', `Tổ chuyên môn nhận xét hồ sơ của ${targetPerson.fullName}`, req.ip);

  res.json({ success: true, message: 'Đã lưu nhận xét và đề xuất của tổ chuyên môn', registration: reg });
});

// --- School Board (BGH) Approval & Official Recognition ---

apiRouter.post('/emulation/board/status-update', authMiddleware, requireRole('school_board', 'admin'), (req: AuthenticatedRequest, res) => {
  const evaluator = req.user!;
  const { registrationId, newStatus, reason } = req.body;

  const allRegs = db.getAllRegistrations();
  const reg = allRegs.find((r) => r.id === registrationId);

  if (!reg) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  const validStatuses = ['draft', 'submitted', 'revision_requested', 'approved', 'locked'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  const prevStatus = reg.status;
  reg.status = newStatus;

  if (newStatus === 'approved') {
    reg.approvedAt = new Date().toISOString();
  } else if (newStatus === 'locked') {
    reg.lockedAt = new Date().toISOString();
  }

  if (reason) {
    reg.reopenHistory.push({
      reopenedAt: new Date().toISOString(),
      reopenedBy: evaluator.id,
      reopenedByName: evaluator.fullName,
      reason: `Ban Giám hiệu chuyển trạng thái từ [${prevStatus}] sang [${newStatus}]: ${reason}`
    });
  }

  db.saveRegistration(reg);
  db.logAction(evaluator.id, evaluator.fullName, 'BOARD_STATUS_UPDATE', `Cập nhật trạng thái hồ sơ ${reg.id} sang [${newStatus}]. Lý do: ${reason || 'Không ghi chú'}`, req.ip);

  res.json({ success: true, registration: reg, message: `Đã cập nhật trạng thái sang: ${newStatus}` });
});

apiRouter.post('/emulation/board/official-recognition', authMiddleware, requireRole('school_board', 'admin'), (req: AuthenticatedRequest, res) => {
  const evaluator = req.user!;
  const { registrationId, officialRecognition } = req.body;

  const allRegs = db.getAllRegistrations();
  const reg = allRegs.find((r) => r.id === registrationId);

  if (!reg) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  }

  const targetPerson = db.getPersonnelById(reg.personnelId);

  // Validate required recognition parameters when published
  if (officialRecognition.isPublished) {
    if (!officialRecognition.decisionNumber || !officialRecognition.decisionDate || !officialRecognition.issuingAuthority) {
      return res.status(400).json({
        error: 'Kết quả công nhận chính thức khi công bố bắt buộc phải có Số quyết định, Ngày quyết định và Cơ quan ban hành theo quy định!'
      });
    }
  }

  reg.officialRecognition = {
    decisionNumber: officialRecognition.decisionNumber || '',
    decisionDate: officialRecognition.decisionDate || '',
    issuingAuthority: officialRecognition.issuingAuthority || '',
    recognizedDutyRating: officialRecognition.recognizedDutyRating || '',
    recognizedTitle: officialRecognition.recognizedTitle || '',
    recognizedAward: officialRecognition.recognizedAward || '',
    isPublished: Boolean(officialRecognition.isPublished),
    attachmentName: officialRecognition.attachmentName || '',
    publishedAt: officialRecognition.isPublished ? new Date().toISOString() : undefined,
    notes: officialRecognition.notes || ''
  };

  db.saveRegistration(reg);
  db.logAction(
    evaluator.id,
    evaluator.fullName,
    'OFFICIAL_RECOGNITION',
    `Ghi nhận kết quả công nhận thi đua cho ${targetPerson?.fullName || reg.personnelId} (QĐ số ${officialRecognition.decisionNumber}, Ngày: ${officialRecognition.decisionDate}, Đã công bố: ${officialRecognition.isPublished})`,
    req.ip
  );

  res.json({ success: true, registration: reg, message: 'Đã lưu kết quả công nhận thi đua khen thưởng chính thức' });
});

// --- School-Wide Lookup (Public inside school, strictly sanitized) ---

apiRouter.get('/emulation/school-lookup', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { keyword, department, status, title, year } = req.query;
  const targetYear = String(year || db.getSchoolYear().year);

  const allPersonnel = db.getPersonnelList().filter((p) => p.id !== 'ADMIN01');
  const allRegs = db.getAllRegistrations(targetYear);

  let filtered = allPersonnel;

  if (keyword) {
    const q = String(keyword).toLowerCase().trim();
    filtered = filtered.filter((p) => p.fullName.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q) || p.currentPosition.toLowerCase().includes(q));
  }

  if (department && department !== 'all') {
    filtered = filtered.filter((p) => p.department === department);
  }

  const lookupList = filtered.map((p) => {
    const reg = allRegs.find((r) => r.personnelId === p.id);

    // Calculate progress %
    let completedItems = 0;
    let totalItems = 0;
    if (reg && reg.items) {
      const applicableItems = reg.items.filter((it) => it.completionLevel !== 'not_applicable');
      totalItems = applicableItems.length;
      completedItems = applicableItems.filter((it) => it.completionLevel === 'completed' || it.completionLevel === 'exceeded').length;
    }

    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      personnelId: p.id,
      stt: p.stt,
      fullName: p.fullName,
      gender: p.gender,
      department: p.department,
      currentPosition: p.currentPosition,
      specialty: p.specialty,
      // Strictly NO CCCD, NO birthDate, NO private password info
      registrationStatus: reg ? reg.status : 'not_registered',
      registeredTitle: reg ? reg.registeredTitle : 'Chưa đăng ký',
      registeredAward: reg ? reg.registeredAward : '',
      registeredDutyTarget: reg ? reg.registeredDutyTarget : '',
      progressPercent,
      completedItems,
      totalItems,
      // Official published results only
      officialResult:
        reg?.officialRecognition && reg.officialRecognition.isPublished
          ? {
              decisionNumber: reg.officialRecognition.decisionNumber,
              decisionDate: reg.officialRecognition.decisionDate,
              issuingAuthority: reg.officialRecognition.issuingAuthority,
              recognizedTitle: reg.officialRecognition.recognizedTitle,
              recognizedDutyRating: reg.officialRecognition.recognizedDutyRating,
              recognizedAward: reg.officialRecognition.recognizedAward,
              publishedAt: reg.officialRecognition.publishedAt
            }
          : null
    };
  });

  // Filter by registration status if given
  let results = lookupList;
  if (status && status !== 'all') {
    results = results.filter((item) => item.registrationStatus === status);
  }
  if (title && title !== 'all') {
    results = results.filter((item) => item.registeredTitle === title);
  }

  res.json(results);
});

// View detail of a shared registration (Read-only, sanitized)
apiRouter.get('/emulation/school-lookup/:personnelId', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { personnelId } = req.params;
  const user = req.user!;
  const year = db.getSchoolYear();

  const person = db.getPersonnelById(personnelId);
  if (!person) {
    return res.status(404).json({ error: 'Không tìm thấy thông tin nhân sự' });
  }

  const reg = db.getRegistrationByPersonnelId(personnelId, year.year);
  const isOwner = user.id === personnelId;
  const isAuthority = req.userRoles?.includes('school_board') || req.userRoles?.includes('admin') || (req.userRoles?.includes('department_head') && user.department === person.department);

  if (!reg) {
    return res.json({
      personnel: {
        id: person.id,
        stt: person.stt,
        fullName: person.fullName,
        department: person.department,
        currentPosition: person.currentPosition,
        specialty: person.specialty
      },
      registration: null
    });
  }

  // If not owner or authority, and registration is draft, hide private draft
  if (!isOwner && !isAuthority && reg.status === 'draft') {
    return res.status(403).json({ error: 'Hồ sơ đang ở trạng thái Bản nháp nội bộ, chưa được chia sẻ trong trường' });
  }

  // Sanitize items: hide confidential proofs for non-authority / non-owner
  const sanitizedItems = reg.items.map((it) => {
    const isConfidential = it.proofConfidential && !isOwner && !isAuthority;
    return {
      id: it.id,
      category: it.category,
      title: it.title,
      targetDescription: it.targetDescription,
      unitAndMethod: it.unitAndMethod,
      targetType: it.targetType,
      targetDirection: it.targetDirection,
      targetValue: it.targetValue,
      deadline: it.deadline,
      expectedProof: it.expectedProof,
      actualResult: it.actualResult,
      actualValue: it.actualValue,
      actualProofDescription: isConfidential ? '[Minh chứng chứa thông tin bảo mật/học sinh - Giới hạn quyền xem]' : it.actualProofDescription,
      proofUrl: isConfidential ? '' : it.proofUrl,
      proofConfidential: it.proofConfidential,
      completionLevel: it.completionLevel,
      completionRate: it.completionRate,
      selfAssessmentNote: it.selfAssessmentNote,
      // Department reviews are only visible to owner and authorities, or if approved
      departmentReview: isOwner || isAuthority ? it.departmentReview : undefined
    };
  });

  res.json({
    personnel: {
      id: person.id,
      stt: person.stt,
      fullName: person.fullName,
      department: person.department,
      currentPosition: person.currentPosition,
      specialty: person.specialty
    },
    registration: {
      id: reg.id,
      status: reg.status,
      registeredTitle: reg.registeredTitle,
      registeredAward: reg.registeredAward,
      registeredDutyTarget: reg.registeredDutyTarget,
      items: sanitizedItems,
      submittedAt: reg.submittedAt,
      approvedAt: reg.approvedAt,
      selfEvaluation: isOwner || isAuthority ? reg.selfEvaluation : undefined,
      departmentRecommendation: isOwner || isAuthority ? reg.departmentRecommendation : undefined,
      officialRecognition: reg.officialRecognition && (reg.officialRecognition.isPublished || isAuthority || isOwner) ? reg.officialRecognition : null
    }
  });
});

// --- Reports & Statistics ---

apiRouter.get('/emulation/reports/summary', authMiddleware, (req: AuthenticatedRequest, res) => {
  const year = db.getSchoolYear();
  const allPersonnel = db.getPersonnelList().filter((p) => p.id !== 'ADMIN01');
  const allRegs = db.getAllRegistrations(year.year);

  const totalPersonnel = allPersonnel.length;
  const notRegisteredCount = allPersonnel.filter((p) => !allRegs.find((r) => r.personnelId === p.id) || allRegs.find((r) => r.personnelId === p.id)?.status === 'not_registered').length;
  const draftCount = allRegs.filter((r) => r.status === 'draft').length;
  const submittedCount = allRegs.filter((r) => r.status === 'submitted').length;
  const revisionCount = allRegs.filter((r) => r.status === 'revision_requested').length;
  const approvedCount = allRegs.filter((r) => r.status === 'approved' || r.status === 'locked').length;

  // Department statistics
  const departments = ['Toán - Tin', 'Ngữ văn - Anh', 'GDTC - QPAN - KTPL', 'Sử - Địa', 'Khoa học Tự nhiên', 'Văn phòng'];
  const departmentStats = departments.map((dept) => {
    const members = allPersonnel.filter((p) => p.department === dept);
    const memberRegs = allRegs.filter((r) => members.some((m) => m.id === r.personnelId));

    const submitted = memberRegs.filter((r) => r.status === 'submitted').length;
    const approved = memberRegs.filter((r) => r.status === 'approved' || r.status === 'locked').length;
    const drafts = memberRegs.filter((r) => r.status === 'draft').length;

    return {
      department: dept,
      totalMembers: members.length,
      submitted,
      approved,
      drafts,
      pendingRate: members.length > 0 ? Math.round(((submitted + approved) / members.length) * 100) : 0
    };
  });

  // Emulation Title breakdown
  const titleCounts: { [title: string]: number } = {};
  for (const reg of allRegs) {
    if (reg.status !== 'not_registered') {
      const t = reg.registeredTitle || 'Chưa chọn';
      titleCounts[t] = (titleCounts[t] || 0) + 1;
    }
  }

  // Official Results breakdown
  const publishedResults = allRegs.filter((r) => r.officialRecognition && r.officialRecognition.isPublished);

  res.json({
    schoolYear: year.year,
    totalPersonnel,
    registrationOverview: {
      notRegisteredCount,
      draftCount,
      submittedCount,
      revisionCount,
      approvedCount
    },
    departmentStats,
    titleCounts,
    publishedCount: publishedResults.length
  });
});

// --- Admin System Management ---

apiRouter.get('/admin/personnel-full', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const all = db.getPersonnelList().filter((p) => p.id !== 'ADMIN01');
  res.json(all);
});

apiRouter.post('/admin/personnel/update-cccd', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { personnelId, newCCCD, activateAccount } = req.body;
  const admin = req.user!;

  if (!personnelId || !newCCCD) {
    return res.status(400).json({ error: 'Vui lòng cung cấp mã hồ sơ và số CCCD mới' });
  }

  const cleanCCCD = String(newCCCD).trim();
  if (cleanCCCD.length !== 12) {
    return res.status(400).json({ error: 'Số CCCD phải có đúng 12 chữ số' });
  }

  const person = db.getPersonnelById(personnelId);
  if (!person) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ nhân sự' });
  }

  // Check if newCCCD conflicts with another existing record
  const conflict = db.getPersonnelList().find((p) => p.id !== personnelId && p.cccd === cleanCCCD);
  if (conflict) {
    return res.status(400).json({
      error: `Số CCCD ${cleanCCCD} đang trùng với nhân sự STT ${conflict.stt}: ${conflict.fullName}. Không thể cập nhật!`
    });
  }

  const oldCCCD = person.cccd;
  person.cccd = cleanCCCD;
  if (activateAccount) {
    person.accountStatus = 'activated';
    person.isLocked = false;
    person.failedLoginAttempts = 0;
    person.notes = `Đã Quản trị viên (${admin.fullName}) xác minh và cập nhật CCCD ngày ${new Date().toLocaleDateString('vi-VN')}`;
  }

  db.updatePersonnel(personnelId, {
    cccd: cleanCCCD,
    accountStatus: person.accountStatus,
    isLocked: person.isLocked,
    failedLoginAttempts: 0,
    notes: person.notes
  });

  db.logAction(
    admin.id,
    admin.fullName,
    'ADMIN_UPDATE_CCCD',
    `Quản trị viên cập nhật CCCD cho ${person.fullName} (STT ${person.stt}) từ [${oldCCCD}] sang [${cleanCCCD}], kích hoạt: ${activateAccount}`,
    req.ip
  );

  res.json({ success: true, message: `Đã cập nhật CCCD cho ${person.fullName} thành công!`, person });
});

apiRouter.post('/admin/personnel/reset-password', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { personnelId } = req.body;
  const admin = req.user!;

  const person = db.getPersonnelById(personnelId);
  if (!person) {
    return res.status(404).json({ error: 'Không tìm thấy nhân sự' });
  }

  const defaultHash = hashPassword('Ds@123', person.salt);
  db.updatePersonnel(personnelId, {
    passwordHash: defaultHash,
    needsPasswordChange: true,
    failedLoginAttempts: 0,
    isLocked: false
  });

  db.logAction(admin.id, admin.fullName, 'ADMIN_RESET_PASSWORD', `Đặt lại mật khẩu mặc định Ds@123 cho ${person.fullName}`, req.ip);

  res.json({ success: true, message: `Đã đặt lại mật khẩu của ${person.fullName} về mặc định (Ds@123)` });
});

apiRouter.post('/admin/personnel/update-roles', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const { personnelId, roles } = req.body;
  const admin = req.user!;

  const person = db.getPersonnelById(personnelId);
  if (!person) {
    return res.status(404).json({ error: 'Không tìm thấy nhân sự' });
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ error: 'Phải gán ít nhất một vai trò' });
  }

  db.updatePersonnel(personnelId, { roles });
  db.logAction(admin.id, admin.fullName, 'ADMIN_UPDATE_ROLES', `Cập nhật phân quyền cho ${person.fullName}: [${roles.join(', ')}]`, req.ip);

  res.json({ success: true, message: `Đã cập nhật phân quyền cho ${person.fullName}`, person });
});

apiRouter.get('/admin/config/school-year', authMiddleware, (req, res) => {
  res.json(db.getSchoolYear());
});

apiRouter.put('/admin/config/school-year', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const admin = req.user!;
  db.updateSchoolYear(req.body);
  db.logAction(admin.id, admin.fullName, 'UPDATE_SCHOOL_YEAR_CONFIG', 'Cập nhật cấu hình năm học và thời hạn thi đua', req.ip);
  res.json({ success: true, schoolYear: db.getSchoolYear() });
});

apiRouter.get('/admin/config/catalogs', authMiddleware, (req, res) => {
  res.json({
    legalCitations: db.getLegalCitations(),
    titleConfigs: db.getTitleConfigs(),
    criteriaTemplates: db.getCriteriaTemplates()
  });
});

apiRouter.put('/admin/config/legal-citation', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const admin = req.user!;
  const citation: LegalCitation = req.body;
  db.updateLegalCitation(citation);
  db.logAction(admin.id, admin.fullName, 'UPDATE_LEGAL_CITATION', `Cập nhật căn cứ pháp lý: ${citation.docNumber}`, req.ip);
  res.json({ success: true, citation });
});

apiRouter.put('/admin/config/title-config', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const admin = req.user!;
  const titleConfig: EmulationTitleConfig = req.body;
  db.updateTitleConfig(titleConfig);
  db.logAction(admin.id, admin.fullName, 'UPDATE_TITLE_CONFIG', `Cập nhật danh hiệu thi đua: ${titleConfig.name}`, req.ip);
  res.json({ success: true, titleConfig });
});

apiRouter.put('/admin/config/criteria-template', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const admin = req.user!;
  const template: CriterionTemplate = req.body;
  db.updateCriteriaTemplate(template);
  db.logAction(admin.id, admin.fullName, 'UPDATE_CRITERIA_TEMPLATE', `Cập nhật tiêu chuẩn mẫu: ${template.title}`, req.ip);
  res.json({ success: true, template });
});

apiRouter.get('/admin/audit-logs', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  res.json(db.getAuditLogs());
});

apiRouter.get('/admin/backup', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const backup = db.getBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="thpt_daksong_backup_${Date.now()}.json"`);
  res.json(backup);
});

apiRouter.post('/admin/restore', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  const admin = req.user!;
  const { data } = req.body;
  if (!data || !data.personnel || !data.registrations) {
    return res.status(400).json({ error: 'Tập tin sao lưu không đúng định dạng' });
  }

  db.restoreBackup(data);
  db.logAction(admin.id, admin.fullName, 'RESTORE_BACKUP', 'Phục hồi toàn bộ dữ liệu từ bản sao lưu', req.ip);
  res.json({ success: true, message: 'Phục hồi dữ liệu thành công' });
});
