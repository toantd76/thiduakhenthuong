import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Personnel,
  EmulationRegistration,
  SchoolYearConfig,
  LegalCitation,
  EmulationTitleConfig,
  CriterionTemplate,
  AuditLog,
  EmulationItem,
  RoleType
} from '../src/types.ts';
import { RAW_PERSONNEL_DATA } from './data/rawPersonnel.ts';
import {
  DEFAULT_SCHOOL_YEAR,
  DEFAULT_LEGAL_CITATIONS,
  DEFAULT_TITLE_CONFIGS,
  DEFAULT_CRITERIA_TEMPLATES
} from './data/catalog.ts';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  personnel: (Personnel & { passwordHash: string; salt: string; isLocked: boolean })[];
  schoolYear: SchoolYearConfig;
  legalCitations: LegalCitation[];
  titleConfigs: EmulationTitleConfig[];
  criteriaTemplates: CriterionTemplate[];
  registrations: EmulationRegistration[];
  auditLogs: AuditLog[];
  sessions: { [token: string]: { userId: string; createdAt: string; expiresAt: string } };
}

const PASSWORD_SALT = 'THPT_DAK_SONG_2026_SALT_KEY';

export function hashPassword(password: string, salt: string = PASSWORD_SALT): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.data = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error loading db.json, re-initializing:', e);
      }
    }
    return this.initDatabase();
  }

  private save(): void {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  private initDatabase(): DatabaseSchema {
    const staffHash = hashPassword('Ds@123', PASSWORD_SALT);
    const adminHash = hashPassword('Admin@12345', PASSWORD_SALT);

    // Build personnel list from RAW_PERSONNEL_DATA
    const personnelList: DatabaseSchema['personnel'] = [];

    // First, add System Admin
    personnelList.push({
      id: 'ADMIN01',
      stt: 0,
      fullName: 'Quản trị viên Hệ thống',
      birthDate: '01/01/1980',
      gender: 'Nam',
      specialty: 'Công nghệ thông tin',
      currentPosition: 'Quản trị hệ thống',
      department: 'Văn phòng',
      cccd: 'Admin', // Admin can log in with username "Admin"
      roles: ['admin'],
      accountStatus: 'activated',
      needsPasswordChange: false,
      failedLoginAttempts: 0,
      isLocked: false,
      notes: 'Tài khoản quản trị kỹ thuật hệ thống',
      passwordHash: adminHash,
      salt: PASSWORD_SALT
    });

    // Count duplicate CCCDs to identify anomalies
    const cccdCounts: { [cccd: string]: number } = {};
    for (const p of RAW_PERSONNEL_DATA) {
      cccdCounts[p.cccd] = (cccdCounts[p.cccd] || 0) + 1;
    }

    for (const raw of RAW_PERSONNEL_DATA) {
      const id = `NV${String(raw.stt).padStart(2, '0')}`;
      const roles: RoleType[] = ['personal'];

      // Assign role based on position
      const pos = raw.currentPosition.toLowerCase();
      if (pos.includes('hiệu trưởng') || pos.includes('phó hiệu trưởng')) {
        roles.push('school_board');
      } else if (pos.includes('tổ trưởng') || pos.includes('tổ phó') || pos.includes('ttvp') || pos.includes('tpvp')) {
        roles.push('department_head');
      }

      // Check if duplicate CCCD or anomaly
      const isDuplicateCCCD = cccdCounts[raw.cccd] > 1;
      let accountStatus: 'pending_verification' | 'activated' = 'activated';
      let notes = '';

      if (isDuplicateCCCD) {
        accountStatus = 'pending_verification';
        notes = `Tạm khóa chưa kích hoạt: Phát hiện trùng CCCD (${raw.cccd}) với hồ sơ khác trong danh sách (STT 57 và 58). Cần Quản trị viên cập nhật CCCD hợp lệ.`;
      }

      personnelList.push({
        id,
        stt: raw.stt,
        fullName: raw.fullName,
        birthDate: raw.birthDate,
        gender: raw.gender,
        specialty: raw.specialty,
        currentPosition: raw.currentPosition,
        department: raw.department,
        cccd: raw.cccd, // String with preserved leading zero
        roles,
        accountStatus,
        needsPasswordChange: true, // First login must change password
        failedLoginAttempts: 0,
        isLocked: false,
        notes,
        passwordHash: staffHash,
        salt: PASSWORD_SALT
      });
    }

    // Initialize initial registrations for personnel
    const registrations: EmulationRegistration[] = [];
    const year = DEFAULT_SCHOOL_YEAR.year;

    for (const person of personnelList) {
      if (person.id === 'ADMIN01') continue;

      const items: EmulationItem[] = [];

      // Determine categories applicable
      const isManager = person.roles.includes('school_board');
      const isTeacher = person.department !== 'Văn phòng' && !person.currentPosition.includes('Thiết bị') && !person.currentPosition.includes('Y tế') && !person.currentPosition.includes('Thư viện');
      const isStaff = person.department === 'Văn phòng' || person.currentPosition.includes('Thiết bị') || person.currentPosition.includes('Y tế') || person.currentPosition.includes('Thư viện');

      // General criteria for all
      for (const t of DEFAULT_CRITERIA_TEMPLATES.filter((c) => c.category === 'chung')) {
        items.push({
          id: `ITEM_${person.id}_${t.id}`,
          criterionId: t.id,
          category: t.category,
          title: t.title,
          targetDescription: t.description,
          unitAndMethod: t.unitAndMethod,
          targetType: t.targetType,
          targetDirection: t.targetDirection,
          targetValue: t.defaultTargetValue,
          deadline: '2027-05-20',
          expectedProof: t.expectedProofSuggestion,
          actualResult: '',
          actualValue: '',
          actualProofDescription: '',
          proofUrl: '',
          proofConfidential: false,
          completionRate: null,
          completionLevel: 'not_updated',
          selfAssessmentNote: ''
        });
      }

      // Teachers criteria
      if (isTeacher) {
        for (const t of DEFAULT_CRITERIA_TEMPLATES.filter((c) => c.category === 'giao_vien')) {
          items.push({
            id: `ITEM_${person.id}_${t.id}`,
            criterionId: t.id,
            category: t.category,
            title: t.title,
            targetDescription: t.description,
            unitAndMethod: t.unitAndMethod,
            targetType: t.targetType,
            targetDirection: t.targetDirection,
            targetValue: t.defaultTargetValue,
            deadline: '2027-05-20',
            expectedProof: t.expectedProofSuggestion,
            actualResult: '',
            actualValue: '',
            actualProofDescription: '',
            proofUrl: '',
            proofConfidential: false,
            completionRate: null,
            completionLevel: 'not_updated',
            selfAssessmentNote: ''
          });
        }
      }

      // Managers criteria
      if (isManager) {
        for (const t of DEFAULT_CRITERIA_TEMPLATES.filter((c) => c.category === 'can_bo_quan_ly')) {
          items.push({
            id: `ITEM_${person.id}_${t.id}`,
            criterionId: t.id,
            category: t.category,
            title: t.title,
            targetDescription: t.description,
            unitAndMethod: t.unitAndMethod,
            targetType: t.targetType,
            targetDirection: t.targetDirection,
            targetValue: t.defaultTargetValue,
            deadline: '2027-05-20',
            expectedProof: t.expectedProofSuggestion,
            actualResult: '',
            actualValue: '',
            actualProofDescription: '',
            proofUrl: '',
            proofConfidential: false,
            completionRate: null,
            completionLevel: 'not_updated',
            selfAssessmentNote: ''
          });
        }
      }

      // Staff criteria
      if (isStaff) {
        for (const t of DEFAULT_CRITERIA_TEMPLATES.filter((c) => c.category === 'nhan_vien')) {
          items.push({
            id: `ITEM_${person.id}_${t.id}`,
            criterionId: t.id,
            category: t.category,
            title: t.title,
            targetDescription: t.description,
            unitAndMethod: t.unitAndMethod,
            targetType: t.targetType,
            targetDirection: t.targetDirection,
            targetValue: t.defaultTargetValue,
            deadline: '2027-05-20',
            expectedProof: t.expectedProofSuggestion,
            actualResult: '',
            actualValue: '',
            actualProofDescription: '',
            proofUrl: '',
            proofConfidential: false,
            completionRate: null,
            completionLevel: 'not_updated',
            selfAssessmentNote: ''
          });
        }
      }

      registrations.push({
        id: `REG_${year.replace('-', '_')}_${person.id}`,
        personnelId: person.id,
        academicYear: year,
        status: 'draft',
        registeredTitle: 'Lao động tiên tiến',
        registeredAward: 'Giấy khen của Hiệu trưởng',
        registeredDutyTarget: 'Hoàn thành tốt nhiệm vụ',
        items,
        reopenHistory: [],
        versionsCount: 1,
        updatedAt: new Date().toISOString()
      });
    }

    const initialLogs: AuditLog[] = [
      {
        id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'ADMIN01',
        userName: 'Hệ thống',
        action: 'INITIALIZE_SYSTEM',
        details: `Khởi tạo hệ thống thành công với 64 hồ sơ nhân sự từ DS GV.pdf, phát hiện 02 hồ sơ trùng CCCD tại STT 57 và 58 (tạm khóa chờ xác minh).`
      }
    ];

    const db: DatabaseSchema = {
      personnel: personnelList,
      schoolYear: DEFAULT_SCHOOL_YEAR,
      legalCitations: DEFAULT_LEGAL_CITATIONS,
      titleConfigs: DEFAULT_TITLE_CONFIGS,
      criteriaTemplates: DEFAULT_CRITERIA_TEMPLATES,
      registrations,
      auditLogs: initialLogs,
      sessions: {}
    };

    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);

    return db;
  }

  // --- Data Access & Operations ---

  public getPersonnelList(): DatabaseSchema['personnel'] {
    return this.data.personnel;
  }

  public getPersonnelById(id: string) {
    return this.data.personnel.find((p) => p.id === id);
  }

  public getPersonnelByCCCDOrUsername(loginKey: string) {
    const clean = loginKey.trim();
    return this.data.personnel.find(
      (p) =>
        p.cccd === clean ||
        (p.roles.includes('admin') &&
          (clean.toLowerCase() === 'admin' || clean === '000000000001' || p.cccd.toLowerCase() === clean.toLowerCase()))
    );
  }

  public updatePersonnel(id: string, update: Partial<DatabaseSchema['personnel'][0]>): boolean {
    const idx = this.data.personnel.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.personnel[idx] = { ...this.data.personnel[idx], ...update };
    this.save();
    return true;
  }

  public getSchoolYear(): SchoolYearConfig {
    return this.data.schoolYear;
  }

  public updateSchoolYear(update: Partial<SchoolYearConfig>): void {
    this.data.schoolYear = { ...this.data.schoolYear, ...update };
    this.save();
  }

  public getLegalCitations(): LegalCitation[] {
    return this.data.legalCitations;
  }

  public updateLegalCitation(citation: LegalCitation): void {
    const idx = this.data.legalCitations.findIndex((c) => c.id === citation.id);
    if (idx >= 0) {
      this.data.legalCitations[idx] = citation;
    } else {
      this.data.legalCitations.push(citation);
    }
    this.save();
  }

  public getTitleConfigs(): EmulationTitleConfig[] {
    return this.data.titleConfigs;
  }

  public updateTitleConfig(config: EmulationTitleConfig): void {
    const idx = this.data.titleConfigs.findIndex((t) => t.id === config.id);
    if (idx >= 0) {
      this.data.titleConfigs[idx] = config;
    } else {
      this.data.titleConfigs.push(config);
    }
    this.save();
  }

  public getCriteriaTemplates(): CriterionTemplate[] {
    return this.data.criteriaTemplates;
  }

  public updateCriteriaTemplate(template: CriterionTemplate): void {
    const idx = this.data.criteriaTemplates.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      this.data.criteriaTemplates[idx] = template;
    } else {
      this.data.criteriaTemplates.push(template);
    }
    this.save();
  }

  public getRegistrationByPersonnelId(personnelId: string, year?: string): EmulationRegistration | undefined {
    const targetYear = year || this.data.schoolYear.year;
    return this.data.registrations.find((r) => r.personnelId === personnelId && r.academicYear === targetYear);
  }

  public getAllRegistrations(year?: string): EmulationRegistration[] {
    const targetYear = year || this.data.schoolYear.year;
    return this.data.registrations.filter((r) => r.academicYear === targetYear);
  }

  public saveRegistration(reg: EmulationRegistration): void {
    const idx = this.data.registrations.findIndex((r) => r.id === reg.id);
    reg.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      this.data.registrations[idx] = reg;
    } else {
      this.data.registrations.push(reg);
    }
    this.save();
  }

  public createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
    this.data.sessions[token] = {
      userId,
      createdAt: now.toISOString(),
      expiresAt
    };
    this.save();
    return token;
  }

  public getSession(token: string): { userId: string } | null {
    if (!token) return null;
    const sess = this.data.sessions[token];
    if (!sess) return null;
    if (new Date(sess.expiresAt) < new Date()) {
      delete this.data.sessions[token];
      this.save();
      return null;
    }
    return { userId: sess.userId };
  }

  public removeSession(token: string): void {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  public logAction(userId: string, userName: string, action: string, details: string, ipAddress?: string): void {
    const log: AuditLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      details,
      ipAddress
    };
    this.data.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getBackup(): DatabaseSchema {
    return this.data;
  }

  public restoreBackup(schema: DatabaseSchema): void {
    this.data = schema;
    this.save();
  }
}

export const db = new Database();
