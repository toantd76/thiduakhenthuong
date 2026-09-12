import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Save,
  Link as LinkIcon,
  ShieldCheck,
  Lock,
  Eye,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { AuthSession, EmulationRegistration, EmulationItem } from '../types.ts';
import { apiRequest } from '../services/api.ts';

interface ExecutionResultsViewProps {
  currentUser: AuthSession['user'];
}

export const ExecutionResultsView: React.FC<ExecutionResultsViewProps> = ({ currentUser }) => {
  const [registration, setRegistration] = useState<EmulationRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/emulation/my');
      setRegistration(data.registration);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Không thể tải dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  const handleItemResultChange = (itemId: string, field: keyof EmulationItem, value: any) => {
    if (!registration) return;
    setRegistration({
      ...registration,
      items: registration.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it))
    });
  };

  const handleSaveResults = async () => {
    if (!registration) return;
    setSaving(true);
    setMessage(null);

    const itemsResults = registration.items.map((it) => ({
      itemId: it.id,
      actualResult: it.actualResult,
      actualValue: it.actualValue,
      actualProofDescription: it.actualProofDescription,
      proofUrl: it.proofUrl,
      proofConfidential: it.proofConfidential,
      completionLevel: it.completionLevel,
      completionRate: it.completionRate,
      selfAssessmentNote: it.selfAssessmentNote
    }));

    try {
      const res = await apiRequest('/api/emulation/my/results', {
        method: 'PUT',
        body: JSON.stringify({ itemsResults })
      });
      setRegistration(res.registration);
      setMessage({ type: 'success', text: 'Đã lưu kết quả thực hiện và minh chứng thành công!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi khi lưu kết quả' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Đang tải kết quả và minh chứng...
      </div>
    );
  }

  if (!registration || registration.items.length === 0) {
    return (
      <div className="p-8 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-sm">
        Bạn chưa đăng ký các tiêu chuẩn thi đua đầu năm. Vui lòng vào mục <strong>"3. Đăng ký thi đua của tôi"</strong> để thiết lập chỉ tiêu trước.
      </div>
    );
  }

  // Calculate stats
  const totalItems = registration.items.length;
  const completedItems = registration.items.filter(
    (it) => it.completionLevel === 'completed' || it.completionLevel === 'exceeded'
  ).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Cập nhật kết quả thực hiện và minh chứng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Đối chiếu với chỉ tiêu đã đăng ký, cập nhật số liệu thực tế và đính kèm hồ sơ minh chứng
          </p>
        </div>

        <button
          onClick={handleSaveResults}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu kết quả & minh chứng'}</span>
        </button>
      </div>

      {/* Alert */}
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
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Overall Progress Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Tiến độ hoàn thành chỉ tiêu toàn diện
          </span>
          <span className="text-sm font-black text-blue-700">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>
            Đã hoàn thành: <strong>{completedItems}</strong> / {totalItems} tiêu chuẩn
          </span>
          <span>Năm học 2026–2027</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {registration.items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
          >
            {/* Title & Registered Target Contrast Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.targetDescription}</p>
                </div>
              </div>

              {/* Readonly Registered Goal Badge */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-right md:max-w-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Mục tiêu đã cam kết đầu năm (Bảo toàn)
                </span>
                <span className="text-xs font-bold text-blue-900">{item.targetValue}</span>
                {item.expectedProof && (
                  <span className="text-[11px] text-slate-500 block truncate">
                    MC dự kiến: {item.expectedProof}
                  </span>
                )}
              </div>
            </div>

            {/* Input fields for actual execution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Mức độ hoàn thành</span>
                </label>
                <select
                  value={item.completionLevel}
                  onChange={(e) =>
                    handleItemResultChange(
                      item.id,
                      'completionLevel',
                      e.target.value as EmulationItem['completionLevel']
                    )
                  }
                  className="w-full p-2 bg-emerald-50/20 border-2 border-emerald-200 hover:border-emerald-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  <option value="not_updated">⚪ Chưa cập nhật</option>
                  <option value="exceeded">⭐ Vượt chỉ tiêu</option>
                  <option value="completed">✅ Hoàn thành</option>
                  <option value="partially_completed">⚠️ Hoàn thành một phần</option>
                  <option value="not_completed">❌ Không hoàn thành</option>
                  <option value="not_applicable">⚪ Không áp dụng</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Kết quả thực tế đạt được</span>
                </label>
                <input
                  type="text"
                  value={item.actualValue}
                  onChange={(e) => handleItemResultChange(item.id, 'actualValue', e.target.value)}
                  placeholder="VD: 98.2% học sinh đạt; 0 vi phạm"
                  className="w-full p-2 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-300 rounded-lg text-xs font-bold text-blue-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[11px]">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Mô tả chi tiết kết quả thực hiện</span>
                </label>
                <input
                  type="text"
                  value={item.actualResult}
                  onChange={(e) => handleItemResultChange(item.id, 'actualResult', e.target.value)}
                  placeholder="VD: Giảng dạy 2 lớp 12, hoàn thành đúng tiến độ 100% ma trận đề..."
                  className="w-full p-2 bg-indigo-50/20 border-2 border-indigo-200 hover:border-indigo-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Proofs Section */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="md:col-span-2 space-y-1">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px]">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Mô tả hồ sơ / Quyết định minh chứng</span>
                </label>
                <input
                  type="text"
                  value={item.actualProofDescription}
                  onChange={(e) =>
                    handleItemResultChange(item.id, 'actualProofDescription', e.target.value)
                  }
                  placeholder="VD: QĐ số 45/QĐ-THPTDS; Sổ đầu bài điện tử tuần 1-35; Link Google Drive"
                  className="w-full p-2 bg-purple-50/20 border-2 border-purple-200 hover:border-purple-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-900 font-bold text-[11px]">
                  <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
                  <span>Đường dẫn trực tuyến (URL)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-teal-600">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={item.proofUrl}
                    onChange={(e) => handleItemResultChange(item.id, 'proofUrl', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-8 pr-2 py-2 bg-teal-50/20 border-2 border-teal-200 hover:border-teal-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sensitive Proof Toggle */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <input
                id={`confidential-${item.id}`}
                type="checkbox"
                checked={item.proofConfidential}
                onChange={(e) =>
                  handleItemResultChange(item.id, 'proofConfidential', e.target.checked)
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label
                htmlFor={`confidential-${item.id}`}
                className="cursor-pointer select-none flex items-center gap-1 text-slate-700 font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Minh chứng chứa thông tin học sinh hoặc dữ liệu bảo mật (Chỉ hiển thị với BGH và Tổ trưởng)
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
