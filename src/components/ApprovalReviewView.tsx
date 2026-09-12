import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Building2,
  Lock,
  Stamp,
  X,
  FileCheck,
  UserCheck,
  Calendar,
  Award,
  Hash,
  FileText
} from 'lucide-react';
import { AuthSession } from '../types.ts';
import { apiRequest } from '../services/api.ts';

interface ApprovalReviewViewProps {
  currentUser: AuthSession['user'];
}

export const ApprovalReviewView: React.FC<ApprovalReviewViewProps> = ({ currentUser }) => {
  const userRoles = currentUser?.roles || [];
  const isSchoolBoard = userRoles.includes('school_board') || userRoles.includes('admin');
  const isDepartmentHead = userRoles.includes('department_head');

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(isSchoolBoard ? 'all' : (currentUser?.department || 'all'));
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Review modal
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [actionTab, setActionTab] = useState<'review' | 'status' | 'recognition'>('review');

  // Review form state
  const [recRating, setRecRating] = useState('Hoàn thành tốt nhiệm vụ');
  const [recTitle, setRecTitle] = useState('Lao động tiên tiến');
  const [recAward, setRecAward] = useState('Giấy khen của Hiệu trưởng');
  const [recComment, setRecComment] = useState('');
  const [itemComments, setItemComments] = useState<{ [id: string]: string }>({});

  // Board status form state
  const [boardStatus, setBoardStatus] = useState('approved');
  const [boardReason, setBoardReason] = useState('');

  // Official recognition form state
  const [decisionNumber, setDecisionNumber] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('Hiệu trưởng Trường THPT Đắk Song');
  const [recognizedRating, setRecognizedRating] = useState('Hoàn thành tốt nhiệm vụ');
  const [recognizedTitle, setRecognizedTitle] = useState('Lao động tiên tiến');
  const [recognizedAward, setRecognizedAward] = useState('Giấy khen của Hiệu trưởng');
  const [isPublished, setIsPublished] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [selectedDept]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const url =
        selectedDept && selectedDept !== 'all'
          ? `/api/emulation/department/list?department=${encodeURIComponent(selectedDept)}`
          : '/api/emulation/department/list';
      const data = await apiRequest(url);
      setSubmissions(data);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Không thể tải danh sách xét thi đua' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (item: any) => {
    setActiveItem(item);
    setMessage(null);
    const reg = item.registration;
    if (reg) {
      // populate department recommendation defaults
      if (reg.departmentRecommendation) {
        setRecRating(reg.departmentRecommendation.recommendedRating || 'Hoàn thành tốt nhiệm vụ');
        setRecTitle(reg.departmentRecommendation.recommendedTitle || 'Lao động tiên tiến');
        setRecAward(reg.departmentRecommendation.recommendedAward || '');
        setRecComment(reg.departmentRecommendation.comment || '');
      } else {
        setRecRating(reg.registeredDutyTarget || 'Hoàn thành tốt nhiệm vụ');
        setRecTitle(reg.registeredTitle || 'Lao động tiên tiến');
        setRecAward(reg.registeredAward || '');
        setRecComment('');
      }

      // populate official recognition defaults if present
      if (reg.officialRecognition) {
        setDecisionNumber(reg.officialRecognition.decisionNumber || '');
        setDecisionDate(reg.officialRecognition.decisionDate || '');
        setIssuingAuthority(reg.officialRecognition.issuingAuthority || 'Hiệu trưởng Trường THPT Đắk Song');
        setRecognizedRating(reg.officialRecognition.recognizedDutyRating || 'Hoàn thành tốt nhiệm vụ');
        setRecognizedTitle(reg.officialRecognition.recognizedTitle || 'Lao động tiên tiến');
        setRecognizedAward(reg.officialRecognition.recognizedAward || '');
        setIsPublished(Boolean(reg.officialRecognition.isPublished));
      } else {
        setDecisionNumber(`QĐ-THPTDS-${reg.academicYear ? reg.academicYear.substring(0, 4) : '2026'}`);
        setDecisionDate(new Date().toISOString().split('T')[0]);
        setIssuingAuthority('Hiệu trưởng Trường THPT Đắk Song');
        setRecognizedRating(reg.registeredDutyTarget || 'Hoàn thành tốt nhiệm vụ');
        setRecognizedTitle(reg.registeredTitle || 'Lao động tiên tiến');
        setRecognizedAward(reg.registeredAward || '');
        setIsPublished(true);
      }

      // Item review comments
      const commentsMap: { [id: string]: string } = {};
      if (reg.items) {
        for (const it of reg.items) {
          commentsMap[it.id] = it.departmentReview?.comment || '';
        }
      }
      setItemComments(commentsMap);
    }
  };

  // 1. Submit Department Review
  const handleSubmitDeptReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem?.registration) return;

    setSubmitting(true);
    try {
      const itemsReviews = activeItem.registration.items.map((it: any) => ({
        itemId: it.id,
        comment: itemComments[it.id] || '',
        suggestedStatus: 'agree'
      }));

      await apiRequest('/api/emulation/department/review', {
        method: 'POST',
        body: JSON.stringify({
          registrationId: activeItem.registration.id,
          itemsReviews,
          departmentRecommendation: {
            recommendedRating: recRating,
            recommendedTitle: recTitle,
            recommendedAward: recAward,
            comment: recComment,
            status: 'recommended'
          }
        })
      });

      setMessage({ type: 'success', text: `Đã lưu đánh giá của Tổ chuyên môn cho ${activeItem.personnel.fullName}` });
      setActiveItem(null);
      loadSubmissions();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi khi lưu nhận xét' });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit Board Status Update
  const handleSubmitBoardStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem?.registration) return;

    setSubmitting(true);
    try {
      await apiRequest('/api/emulation/board/status-update', {
        method: 'POST',
        body: JSON.stringify({
          registrationId: activeItem.registration.id,
          newStatus: boardStatus,
          reason: boardReason
        })
      });

      setMessage({ type: 'success', text: `Ban Giám hiệu đã cập nhật trạng thái hồ sơ của ${activeItem.personnel.fullName} thành [${boardStatus}]` });
      setActiveItem(null);
      loadSubmissions();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi khi cập nhật trạng thái' });
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Submit Official Recognition
  const handleSubmitOfficialRecognition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem?.registration) return;

    setSubmitting(true);
    try {
      await apiRequest('/api/emulation/board/official-recognition', {
        method: 'POST',
        body: JSON.stringify({
          registrationId: activeItem.registration.id,
          officialRecognition: {
            decisionNumber,
            decisionDate,
            issuingAuthority,
            recognizedDutyRating: recognizedRating,
            recognizedTitle,
            recognizedAward,
            isPublished
          }
        })
      });

      setMessage({ type: 'success', text: `Đã lưu và ban hành công nhận thi đua chính thức cho ${activeItem.personnel.fullName}` });
      setActiveItem(null);
      loadSubmissions();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi khi lưu quyết định công nhận' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-700" />
            Duyệt hồ sơ và xét thi đua khen thưởng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dành cho Tổ trưởng chuyên môn thẩm định và Ban Giám hiệu phê duyệt, ban hành quyết định chính thức
          </p>
        </div>

        {/* Scope selector for BGH / Admin */}
        {isSchoolBoard && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phạm vi:</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="p-2 bg-indigo-50/20 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 cursor-pointer transition-all"
            >
              <option value="all">Toàn trường THPT Đắk Song</option>
              <option value="Toán - Tin">Tổ Toán - Tin</option>
              <option value="Ngữ văn - Anh">Tổ Ngữ văn - Anh</option>
              <option value="GDTC - QPAN - KTPL">Tổ GDTC - QPAN - KTPL</option>
              <option value="Sử - Địa">Tổ Sử - Địa</option>
              <option value="Khoa học Tự nhiên">Tổ Khoa học Tự nhiên</option>
              <option value="Văn phòng">Tổ Văn phòng</option>
            </select>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Submissions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách hồ sơ thuộc thẩm quyền xét ({submissions.length} nhân sự)
          </span>
          <span className="text-[11px] text-slate-500">
            {isSchoolBoard ? 'Thẩm quyền: Ban Giám hiệu' : `Thẩm quyền: Tổ trưởng (${currentUser.department})`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Đang tải danh sách...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">Chưa có hồ sơ nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Tổ / Chức vụ</th>
                  <th className="py-3 px-4">Đăng ký đầu năm</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Tổ đề xuất</th>
                  <th className="py-3 px-4">BGH Công nhận</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const reg = sub.registration;
                  const p = sub.personnel;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-500 text-center">{p.stt}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.department} – {p.currentPosition}
                      </td>
                      <td className="py-3 px-4">
                        {reg ? (
                          <div className="font-semibold text-blue-900">
                            {reg.registeredTitle}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa đăng ký</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            reg?.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg?.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : reg?.status === 'revision_requested'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {reg?.status === 'approved'
                            ? 'Đã duyệt'
                            : reg?.status === 'submitted'
                            ? 'Đã nộp'
                            : reg?.status === 'revision_requested'
                            ? 'Bổ sung'
                            : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {reg?.departmentRecommendation ? (
                          <span className="font-semibold text-indigo-900">
                            {reg.departmentRecommendation.recommendedTitle}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa nhận xét</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {reg?.officialRecognition?.isPublished ? (
                          <span className="font-bold text-amber-700 flex items-center gap-1">
                            <Stamp className="w-3.5 h-3.5" />
                            {reg.officialRecognition.recognizedTitle}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa có QĐ</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenReview(sub)}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          Xử lý
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{activeItem.personnel.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {activeItem.personnel.department} – {activeItem.personnel.currentPosition}
                </p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Tabs: Review vs Board Status vs Official Recognition */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 text-xs font-bold gap-2">
              <button
                onClick={() => setActionTab('review')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  actionTab === 'review'
                    ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Tổ chuyên môn thẩm định & đề xuất
              </button>

              {isSchoolBoard && (
                <>
                  <button
                    onClick={() => setActionTab('status')}
                    className={`py-2 px-3 border-b-2 transition-colors ${
                      actionTab === 'status'
                        ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2. BGH Phê duyệt / Yêu cầu bổ sung
                  </button>
                  <button
                    onClick={() => setActionTab('recognition')}
                    className={`py-2 px-3 border-b-2 transition-colors ${
                      actionTab === 'recognition'
                        ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    3. BGH Ban hành Quyết định chính thức
                  </button>
                </>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {actionTab === 'review' && (
                <form onSubmit={handleSubmitDeptReview} className="space-y-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="font-bold text-indigo-950 block mb-1">
                      Chỉ tiêu đăng ký của cá nhân:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-indigo-900">
                      <div>
                        Danh hiệu: <strong>{activeItem.registration?.registeredTitle}</strong>
                      </div>
                      <div>
                        Xếp loại: <strong>{activeItem.registration?.registeredDutyTarget}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tổ đề xuất xếp loại</span>
                      </label>
                      <select
                        value={recRating}
                        onChange={(e) => setRecRating(e.target.value)}
                        className="w-full p-2 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        <option value="Hoàn thành xuất sắc nhiệm vụ">⭐ Hoàn thành xuất sắc nhiệm vụ</option>
                        <option value="Hoàn thành tốt nhiệm vụ">✅ Hoàn thành tốt nhiệm vụ</option>
                        <option value="Hoàn thành nhiệm vụ">🔹 Hoàn thành nhiệm vụ</option>
                        <option value="Không hoàn thành nhiệm vụ">❌ Không hoàn thành nhiệm vụ</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tổ đề xuất danh hiệu</span>
                      </label>
                      <select
                        value={recTitle}
                        onChange={(e) => setRecTitle(e.target.value)}
                        className="w-full p-2 bg-amber-50/20 border-2 border-amber-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 transition-all cursor-pointer"
                      >
                        <option value="Lao động tiên tiến">🥇 Lao động tiên tiến</option>
                        <option value="Chiến sĩ thi đua cơ sở">🏅 Chiến sĩ thi đua cơ sở</option>
                        <option value="Chiến sĩ thi đua cấp Tỉnh">🎖️ Chiến sĩ thi đua cấp Tỉnh</option>
                        <option value="Không đề nghị">⚪ Không đề nghị danh hiệu</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px]">
                        <Stamp className="w-3.5 h-3.5 text-purple-600" />
                        <span>Tổ đề xuất khen thưởng</span>
                      </label>
                      <select
                        value={recAward}
                        onChange={(e) => setRecAward(e.target.value)}
                        className="w-full p-2 bg-purple-50/20 border-2 border-purple-200 hover:border-purple-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer"
                      >
                        <option value="Giấy khen của Hiệu trưởng">📜 Giấy khen của Hiệu trưởng</option>
                        <option value="Giấy khen của Giám đốc Sở GD&ĐT">📜 Giấy khen của Giám đốc Sở GD&ĐT</option>
                        <option value="Bằng khen của Chủ tịch UBND Tỉnh">📜 Bằng khen của Chủ tịch UBND Tỉnh</option>
                        <option value="">⚪ Không đề nghị</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Nhận xét, đánh giá của Tổ chuyên môn:</span>
                    </label>
                    <textarea
                      value={recComment}
                      onChange={(e) => setRecComment(e.target.value)}
                      rows={3}
                      placeholder="Ghi rõ ý kiến thống nhất hoặc đề xuất điều chỉnh chỉ tiêu..."
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <Send className="w-4 h-4 text-indigo-200" />
                      <span>{submitting ? 'Đang lưu...' : 'Lưu thẩm định của Tổ'}</span>
                    </button>
                  </div>
                </form>
              )}

              {actionTab === 'status' && isSchoolBoard && (
                <form onSubmit={handleSubmitBoardStatus} className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                    <strong>Thẩm quyền Ban Giám hiệu:</strong> Phê duyệt chính thức để chuyển sang giai đoạn theo dõi thực hiện, hoặc yêu cầu viên chức bổ sung nếu hồ sơ chưa đạt chuẩn.
                  </div>

                  <div className="space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cập nhật trạng thái hồ sơ:</span>
                    </label>
                    <select
                      value={boardStatus}
                      onChange={(e) => setBoardStatus(e.target.value)}
                      className="w-full p-2.5 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                    >
                      <option value="approved">✅ Phê duyệt hồ sơ (Approved)</option>
                      <option value="revision_requested">⚠️ Yêu cầu bổ sung / điều chỉnh (Revision Requested)</option>
                      <option value="locked">🔒 Khóa hồ sơ (Locked)</option>
                      <option value="draft">📝 Trả về bản nháp (Draft)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lý do / Hướng dẫn chỉ đạo của Ban Giám hiệu:</span>
                    </label>
                    <textarea
                      value={boardReason}
                      onChange={(e) => setBoardReason(e.target.value)}
                      rows={3}
                      placeholder="Ghi rõ lý do phê duyệt hoặc nội dung yêu cầu điều chỉnh..."
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-900"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-200" />
                      <span>{submitting ? 'Đang cập nhật...' : 'Cập nhật trạng thái BGH'}</span>
                    </button>
                  </div>
                </form>
              )}

              {actionTab === 'recognition' && isSchoolBoard && (
                <form onSubmit={handleSubmitOfficialRecognition} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                    <strong>Công nhận chính thức:</strong> Khi công bố, hệ thống bắt buộc phải có Số quyết định, Ngày quyết định và Cơ quan ban hành theo chuẩn pháp lý.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                        <Hash className="w-3.5 h-3.5 text-amber-600" />
                        <span>Số quyết định:</span>
                      </label>
                      <input
                        type="text"
                        value={decisionNumber}
                        onChange={(e) => setDecisionNumber(e.target.value)}
                        placeholder="VD: 120/QĐ-THPTDS"
                        className="w-full p-2 bg-amber-50/20 border-2 border-amber-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ngày ban hành:</span>
                      </label>
                      <input
                        type="date"
                        value={decisionDate}
                        onChange={(e) => setDecisionDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Cơ quan ban hành:</span>
                      </label>
                      <select
                        value={issuingAuthority}
                        onChange={(e) => setIssuingAuthority(e.target.value)}
                        className="w-full p-2 bg-indigo-50/20 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer"
                      >
                        <option value="Hiệu trưởng Trường THPT Đắk Song">Hiệu trưởng THPT Đắk Song</option>
                        <option value="Giám đốc Sở GD&ĐT tỉnh Lâm Đồng">Giám đốc Sở GD&ĐT Lâm Đồng</option>
                        <option value="Chủ tịch UBND tỉnh Lâm Đồng">Chủ tịch UBND tỉnh Lâm Đồng</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Xếp loại chính thức:</span>
                      </label>
                      <select
                        value={recognizedRating}
                        onChange={(e) => setRecognizedRating(e.target.value)}
                        className="w-full p-2 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                      >
                        <option value="Hoàn thành xuất sắc nhiệm vụ">⭐ Hoàn thành xuất sắc nhiệm vụ</option>
                        <option value="Hoàn thành tốt nhiệm vụ">✅ Hoàn thành tốt nhiệm vụ</option>
                        <option value="Hoàn thành nhiệm vụ">🔹 Hoàn thành nhiệm vụ</option>
                        <option value="Không hoàn thành nhiệm vụ">❌ Không hoàn thành nhiệm vụ</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Danh hiệu chính thức:</span>
                      </label>
                      <select
                        value={recognizedTitle}
                        onChange={(e) => setRecognizedTitle(e.target.value)}
                        className="w-full p-2 bg-amber-50/20 border-2 border-amber-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 transition-all cursor-pointer"
                      >
                        <option value="Lao động tiên tiến">🥇 Lao động tiên tiến</option>
                        <option value="Chiến sĩ thi đua cơ sở">🏅 Chiến sĩ thi đua cơ sở</option>
                        <option value="Chiến sĩ thi đua cấp Tỉnh">🎖️ Chiến sĩ thi đua cấp Tỉnh</option>
                        <option value="Không đạt danh hiệu">⚪ Không đạt danh hiệu</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px]">
                        <Stamp className="w-3.5 h-3.5 text-purple-600" />
                        <span>Hình thức khen thưởng:</span>
                      </label>
                      <select
                        value={recognizedAward}
                        onChange={(e) => setRecognizedAward(e.target.value)}
                        className="w-full p-2 bg-purple-50/20 border-2 border-purple-200 hover:border-purple-400 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer"
                      >
                        <option value="Giấy khen của Hiệu trưởng">📜 Giấy khen của Hiệu trưởng</option>
                        <option value="Giấy khen của Giám đốc Sở GD&ĐT">📜 Giấy khen của Giám đốc Sở GD&ĐT</option>
                        <option value="Bằng khen của Chủ tịch UBND Tỉnh">📜 Bằng khen của Chủ tịch UBND Tỉnh</option>
                        <option value="">⚪ Không có</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="publish-toggle"
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <label htmlFor="publish-toggle" className="font-bold text-slate-800 select-none">
                      Công bố chính thức kết quả khen thưởng trên hệ thống toàn trường
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Stamp className="w-4 h-4" />
                      <span>{submitting ? 'Đang lưu...' : 'Ban hành Quyết định khen thưởng'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
