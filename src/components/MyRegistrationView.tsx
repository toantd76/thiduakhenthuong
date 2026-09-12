import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Send,
  RotateCcw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  Trophy,
  Award,
  Target,
  Compass,
  Paperclip,
  Calendar,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import {
  AuthSession,
  EmulationRegistration,
  EmulationItem,
  SchoolYearConfig,
  CriterionTemplate
} from '../types.ts';
import { apiRequest } from '../services/api.ts';

interface MyRegistrationViewProps {
  currentUser: AuthSession['user'];
  onOpenPrintModal: (registration: EmulationRegistration) => void;
}

export const MyRegistrationView: React.FC<MyRegistrationViewProps> = ({
  currentUser,
  onOpenPrintModal
}) => {
  const [registration, setRegistration] = useState<EmulationRegistration | null>(null);
  const [schoolYear, setSchoolYear] = useState<SchoolYearConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    chung: true,
    giao_vien: true,
    can_bo_quan_ly: true,
    nhan_vien: true
  });

  useEffect(() => {
    loadRegistration();
  }, []);

  const loadRegistration = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/emulation/my');
      setRegistration(data.registration);
      setSchoolYear(data.schoolYear);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Không thể tải hồ sơ đăng ký' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!registration) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiRequest('/api/emulation/my', {
        method: 'PUT',
        body: JSON.stringify({
          registeredTitle: registration.registeredTitle,
          registeredAward: registration.registeredAward,
          registeredDutyTarget: registration.registeredDutyTarget,
          items: registration.items
        })
      });
      setRegistration(res.registration);
      setMessage({ type: 'success', text: 'Đã lưu bản nháp thành công!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lưu thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!registration) return;
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn nộp hồ sơ đăng ký thi đua đầu năm cho Tổ chuyên môn và Ban Giám hiệu?'
      )
    ) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // First save current values
      await apiRequest('/api/emulation/my', {
        method: 'PUT',
        body: JSON.stringify({
          registeredTitle: registration.registeredTitle,
          registeredAward: registration.registeredAward,
          registeredDutyTarget: registration.registeredDutyTarget,
          items: registration.items
        })
      });

      // Then submit
      const res = await apiRequest('/api/emulation/my/submit', {
        method: 'POST'
      });
      setRegistration(res.registration);
      setMessage({ type: 'success', text: 'Hồ sơ đã được gửi thành công đến Tổ trưởng và Ban Giám hiệu!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Gửi thất bại' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setSaving(true);
    try {
      const res = await apiRequest('/api/emulation/my/request-reopen', {
        method: 'POST',
        body: JSON.stringify({ reason: reopenReason.trim() })
      });
      setRegistration(res.registration);
      setShowReopenDialog(false);
      setReopenReason('');
      setMessage({ type: 'success', text: 'Đã chuyển trạng thái sang Yêu cầu điều chỉnh/bổ sung. Bạn có thể cập nhật lại hồ sơ.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Không thể yêu cầu mở lại' });
    } finally {
      setSaving(false);
    }
  };

  const handleItemChange = (itemId: string, field: keyof EmulationItem, value: any) => {
    if (!registration) return;
    setRegistration({
      ...registration,
      items: registration.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it))
    });
  };

  const handleAddItem = (category: EmulationItem['category']) => {
    if (!registration) return;
    const newItem: EmulationItem = {
      id: `ITEM_CUSTOM_${Date.now()}`,
      criterionId: 'CRIT_CUSTOM',
      category,
      title: 'Tiêu chuẩn bổ sung theo đặc thù nhiệm vụ',
      targetDescription: '',
      unitAndMethod: '',
      targetType: 'qualitative',
      targetDirection: 'binary',
      targetValue: 'Đạt yêu cầu',
      deadline: '2027-05-20',
      expectedProof: '',
      actualResult: '',
      actualValue: '',
      actualProofDescription: '',
      proofUrl: '',
      proofConfidential: false,
      completionRate: null,
      completionLevel: 'not_updated',
      selfAssessmentNote: ''
    };
    setRegistration({
      ...registration,
      items: [...registration.items, newItem]
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!registration) return;
    setRegistration({
      ...registration,
      items: registration.items.filter((it) => it.id !== itemId)
    });
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Đang tải hồ sơ đăng ký thi đua...
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="p-8 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-sm">
        Không tìm thấy hồ sơ đăng ký thi đua.
      </div>
    );
  }

  const isEditable = registration.status === 'draft' || registration.status === 'revision_requested';

  const categoryNames: { [key: string]: string } = {
    chung: '1. Tiêu chuẩn chung (Nền nếp, Đạo đức, Chuyển đổi số & Chuẩn mực nhà giáo)',
    giao_vien: '2. Tiêu chuẩn dành cho Giáo viên (Dạy học, Nề nếp chuyên môn, Chất lượng, STEM)',
    can_bo_quan_ly: '3. Tiêu chuẩn dành cho Cán bộ Quản lý (Chỉ đạo điều hành, Kiểm tra, Cơ sở vật chất)',
    nhan_vien: '4. Tiêu chuẩn dành cho Nhân viên (Tiến độ hồ sơ, Chất lượng phục vụ, Quản lý tài sản)'
  };

  const itemsByCategory = {
    chung: registration.items.filter((it) => it.category === 'chung'),
    giao_vien: registration.items.filter((it) => it.category === 'giao_vien'),
    can_bo_quan_ly: registration.items.filter((it) => it.category === 'can_bo_quan_ly'),
    nhan_vien: registration.items.filter((it) => it.category === 'nhan_vien')
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-700" />
            <span>Đăng ký thi đua đầu năm học 2026–2027</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Xác định chỉ tiêu, danh hiệu và cam kết nề nếp chuyên môn tại Trường THPT Đắk Song
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenPrintModal(registration)}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In phiếu</span>
          </button>

          {isEditable ? (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Save className="w-4 h-4 text-slate-300" />
                <span>Lưu nháp</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Nộp đăng ký</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowReopenDialog(true)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yêu cầu mở lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert / Notification */}
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
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Lock Warning if not editable */}
      {!isEditable && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <span className="font-bold">Hồ sơ đã được gửi hoặc đã được phê duyệt chính thức:</span>
            <p className="mt-0.5">
              Theo quy chế thi đua, để bảo toàn tính minh bạch và thống nhất, các chỉ tiêu đăng ký đầu năm không được tự ý sửa đổi trực tiếp. Nếu có thay đổi về phân công chuyên môn hoặc lý do chính đáng, vui lòng bấm <strong>"Yêu cầu mở lại điều chỉnh"</strong> và nêu rõ lý do để Tổ trưởng/BGH xem xét.
            </p>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Yêu cầu mở lại hồ sơ đăng ký thi đua
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Vui lòng nêu rõ lý do điều chỉnh chỉ tiêu đăng ký để Tổ chuyên môn và Ban Giám hiệu ghi nhận vào nhật ký kiểm toán hệ thống.
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="VD: Thay đổi phân công chuyên môn học kỳ 1; bổ sung chỉ tiêu bồi dưỡng học sinh giỏi..."
              rows={3}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 mb-4"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReopenDialog(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRequestReopen}
                disabled={saving || !reopenReason.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-xl disabled:opacity-50"
              >
                Gửi yêu cầu mở lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Titles & Awards Selection */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Chỉ tiêu danh hiệu & hình thức khen thưởng đăng ký phấn đấu
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold tracking-wide">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Danh hiệu thi đua đăng ký:</span>
            </label>
            <div className="relative">
              <select
                disabled={!isEditable}
                value={registration.registeredTitle}
                onChange={(e) =>
                  setRegistration({ ...registration, registeredTitle: e.target.value })
                }
                className="w-full p-2.5 text-xs sm:text-sm bg-amber-50/20 border-2 border-amber-200 hover:border-amber-400 rounded-xl font-bold text-slate-900 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="Lao động tiên tiến">🥇 Lao động tiên tiến (Cấp trường)</option>
                <option value="Chiến sĩ thi đua cơ sở">🏅 Chiến sĩ thi đua cơ sở (Cấp Sở GD&ĐT)</option>
                <option value="Chiến sĩ thi đua cấp Tỉnh">🎖️ Chiến sĩ thi đua cấp Tỉnh (UBND Tỉnh)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold tracking-wide">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>2. Hình thức khen thưởng đề nghị:</span>
            </label>
            <div className="relative">
              <select
                disabled={!isEditable}
                value={registration.registeredAward}
                onChange={(e) =>
                  setRegistration({ ...registration, registeredAward: e.target.value })
                }
                className="w-full p-2.5 text-xs sm:text-sm bg-purple-50/20 border-2 border-purple-200 hover:border-purple-400 rounded-xl font-bold text-slate-900 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all cursor-pointer"
              >
                <option value="Giấy khen của Hiệu trưởng">📜 Giấy khen của Hiệu trưởng THPT Đắk Song</option>
                <option value="Giấy khen của Giám đốc Sở GD&ĐT">📜 Giấy khen của Giám đốc Sở GD&ĐT</option>
                <option value="Bằng khen của Chủ tịch UBND Tỉnh">📜 Bằng khen của Chủ tịch UBND Tỉnh</option>
                <option value="">⚪ Không đề nghị khen thưởng đột xuất/cấp trên</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold tracking-wide">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Xếp loại chất lượng viên chức:</span>
            </label>
            <div className="relative">
              <select
                disabled={!isEditable}
                value={registration.registeredDutyTarget}
                onChange={(e) =>
                  setRegistration({ ...registration, registeredDutyTarget: e.target.value })
                }
                className="w-full p-2.5 text-xs sm:text-sm bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl font-bold text-slate-900 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Hoàn thành xuất sắc nhiệm vụ">⭐ Hoàn thành xuất sắc nhiệm vụ</option>
                <option value="Hoàn thành tốt nhiệm vụ">✅ Hoàn thành tốt nhiệm vụ</option>
                <option value="Hoàn thành nhiệm vụ">🔹 Hoàn thành nhiệm vụ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Breakdown by Categories */}
      <div className="space-y-4">
        {Object.entries(itemsByCategory).map(([catKey, items]) => {
          if (items.length === 0) return null;
          const isExpanded = expandedCategories[catKey];

          return (
            <div
              key={catKey}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Category Accordion Header */}
              <div
                onClick={() => toggleCategory(catKey)}
                className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 select-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {categoryNames[catKey]}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {items.length} tiêu chuẩn
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {/* Category Content */}
              {isExpanded && (
                <div className="p-4 sm:p-6 space-y-4 divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <div key={item.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                              #{idx + 1}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.title}
                            </h4>
                          </div>
                          {item.targetDescription && (
                            <p className="text-xs text-slate-600 mt-1">
                              {item.targetDescription}
                            </p>
                          )}
                        </div>

                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Xóa tiêu chuẩn này"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Config Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
                            <Compass className="w-3.5 h-3.5 text-slate-500" />
                            <span>Loại chỉ tiêu & Hướng đích</span>
                          </label>
                          <div className="relative">
                            <select
                              disabled={!isEditable}
                              value={item.targetDirection}
                              onChange={(e) =>
                                handleItemChange(item.id, 'targetDirection', e.target.value)
                              }
                              className="w-full p-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-800 disabled:opacity-75 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-300 focus:border-slate-600 transition-all cursor-pointer"
                            >
                              <option value="binary">🎯 Định tính (Đạt / Không đạt)</option>
                              <option value="higher_better">📈 Định lượng (Càng cao càng tốt)</option>
                              <option value="lower_better">📉 Định lượng (Càng thấp càng tốt)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[11px]">
                            <Target className="w-3.5 h-3.5 text-blue-600" />
                            <span>Mục tiêu cam kết</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              disabled={!isEditable}
                              value={item.targetValue}
                              onChange={(e) =>
                                handleItemChange(item.id, 'targetValue', e.target.value)
                              }
                              placeholder="VD: ≥ 95% học sinh đạt"
                              className="w-full p-2 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold text-blue-900 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>Thời hạn hoàn thành</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              disabled={!isEditable}
                              value={item.deadline}
                              onChange={(e) =>
                                handleItemChange(item.id, 'deadline', e.target.value)
                              }
                              className="w-full p-2 bg-amber-50/20 border-2 border-amber-200 hover:border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Minh chứng dự kiến</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              disabled={!isEditable}
                              value={item.expectedProof}
                              onChange={(e) =>
                                handleItemChange(item.id, 'expectedProof', e.target.value)
                              }
                              placeholder="VD: Bảng điểm vnEdu, Biên bản dự giờ"
                              className="w-full p-2 bg-emerald-50/20 border-2 border-emerald-200 hover:border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-lg text-xs font-medium text-slate-800 focus:bg-white transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Department Head Feedback if present */}
                      {item.departmentReview && (
                        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950">
                          <span className="font-bold text-indigo-900">
                            Ý kiến Tổ trưởng ({item.departmentReview.reviewerName}):
                          </span>{' '}
                          {item.departmentReview.comment || 'Thống nhất chỉ tiêu đăng ký'} (Trạng thái: {item.departmentReview.suggestedStatus === 'agree' ? 'Đồng ý' : 'Đề nghị điều chỉnh'})
                        </div>
                      )}
                    </div>
                  ))}

                  {isEditable && (
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => handleAddItem(catKey as EmulationItem['category'])}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm chỉ tiêu trong nhóm này</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
