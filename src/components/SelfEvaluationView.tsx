import React, { useState, useEffect } from 'react';
import {
  Award,
  Send,
  Printer,
  CheckCircle2,
  FileText,
  AlertCircle,
  Building2,
  Stamp,
  Calendar
} from 'lucide-react';
import { AuthSession, EmulationRegistration } from '../types.ts';
import { apiRequest } from '../services/api.ts';

interface SelfEvaluationViewProps {
  currentUser: AuthSession['user'];
  onOpenPrintModal: (registration: EmulationRegistration) => void;
}

export const SelfEvaluationView: React.FC<SelfEvaluationViewProps> = ({
  currentUser,
  onOpenPrintModal
}) => {
  const [registration, setRegistration] = useState<EmulationRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [selfRating, setSelfRating] = useState('Hoàn thành tốt nhiệm vụ');
  const [selfTitle, setSelfTitle] = useState('Lao động tiên tiến');
  const [selfAward, setSelfAward] = useState('Giấy khen của Hiệu trưởng');
  const [selfReport, setSelfReport] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/emulation/my');
      const reg: EmulationRegistration = data.registration;
      setRegistration(reg);
      if (reg.selfEvaluation) {
        setSelfRating(reg.selfEvaluation.selfProposedRating || 'Hoàn thành tốt nhiệm vụ');
        setSelfTitle(reg.selfEvaluation.selfProposedTitle || 'Lao động tiên tiến');
        setSelfAward(reg.selfEvaluation.selfProposedAward || '');
        setSelfReport(reg.selfEvaluation.summarySelfReport || '');
      } else {
        setSelfRating(reg.registeredDutyTarget || 'Hoàn thành tốt nhiệm vụ');
        setSelfTitle(reg.registeredTitle || 'Lao động tiên tiến');
        setSelfAward(reg.registeredAward || '');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi tải dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSelfEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await apiRequest('/api/emulation/my/self-evaluation', {
        method: 'POST',
        body: JSON.stringify({
          selfProposedRating: selfRating,
          selfProposedTitle: selfTitle,
          selfProposedAward: selfAward,
          summarySelfReport: selfReport
        })
      });
      setRegistration(res.registration);
      setMessage({ type: 'success', text: 'Đã gửi bản tự đánh giá cuối năm thành công!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi gửi tự đánh giá' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Đang tải thông tin tự đánh giá...
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="p-8 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-sm">
        Chưa có hồ sơ thi đua.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            Tự đánh giá & đề xuất khen thưởng cuối năm
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng kết kết quả công tác năm học 2026–2027 và đề nghị Hội đồng Thi đua – Khen thưởng
          </p>
        </div>

        <button
          onClick={() => onOpenPrintModal(registration)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>In phiếu tự đánh giá</span>
        </button>
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
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Official Recognition Result Banner if published */}
      {registration.officialRecognition?.isPublished && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
              <Stamp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                  Quyết định chính thức
                </span>
                <span className="text-xs text-amber-800 font-semibold">
                  Số: {registration.officialRecognition.decisionNumber} ngày {registration.officialRecognition.decisionDate}
                </span>
              </div>
              <h3 className="text-base font-bold text-amber-950">
                {registration.officialRecognition.issuingAuthority} công nhận:
              </h3>
              <div className="text-xs sm:text-sm text-slate-800 space-y-0.5">
                <div>
                  • Xếp loại chất lượng viên chức: <strong>{registration.officialRecognition.recognizedDutyRating}</strong>
                </div>
                <div>
                  • Danh hiệu thi đua đạt được: <strong>{registration.officialRecognition.recognizedTitle}</strong>
                </div>
                {registration.officialRecognition.recognizedAward && (
                  <div>
                    • Hình thức khen thưởng: <strong>{registration.officialRecognition.recognizedAward}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Head Feedback Summary if exists */}
      {registration.departmentRecommendation && (
        <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            Ý kiến và đề xuất của Tổ chuyên môn ({registration.departmentRecommendation.reviewerName}):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Đề xuất xếp loại:</span>
              <strong className="text-indigo-950">{registration.departmentRecommendation.recommendedRating}</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Đề xuất danh hiệu:</span>
              <strong className="text-indigo-950">{registration.departmentRecommendation.recommendedTitle}</strong>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100">
              <span className="text-slate-400 block mb-0.5 font-medium">Khen thưởng:</span>
              <strong className="text-indigo-950">{registration.departmentRecommendation.recommendedAward || 'Không'}</strong>
            </div>
          </div>
          {registration.departmentRecommendation.comment && (
            <p className="text-xs text-indigo-900 mt-2 italic">
              " {registration.departmentRecommendation.comment} "
            </p>
          )}
        </div>
      )}

      {/* Main Self-Evaluation Form */}
      <form
        onSubmit={handleSubmitSelfEvaluation}
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Bản tự đánh giá của cá nhân viên chức
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Tự xếp loại chất lượng</span>
            </label>
            <div className="relative">
              <select
                value={selfRating}
                onChange={(e) => setSelfRating(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Hoàn thành xuất sắc nhiệm vụ">⭐ Hoàn thành xuất sắc nhiệm vụ</option>
                <option value="Hoàn thành tốt nhiệm vụ">✅ Hoàn thành tốt nhiệm vụ</option>
                <option value="Hoàn thành nhiệm vụ">🔹 Hoàn thành nhiệm vụ</option>
                <option value="Không hoàn thành nhiệm vụ">❌ Không hoàn thành nhiệm vụ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold tracking-wide">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Đề xuất danh hiệu</span>
            </label>
            <div className="relative">
              <select
                value={selfTitle}
                onChange={(e) => setSelfTitle(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-amber-50/20 border-2 border-amber-200 hover:border-amber-400 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="Lao động tiên tiến">🥇 Lao động tiên tiến</option>
                <option value="Chiến sĩ thi đua cơ sở">🏅 Chiến sĩ thi đua cơ sở</option>
                <option value="Chiến sĩ thi đua cấp Tỉnh">🎖️ Chiến sĩ thi đua cấp Tỉnh</option>
                <option value="Không đề nghị">⚪ Không đề nghị danh hiệu</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold tracking-wide">
              <Stamp className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Đề xuất khen thưởng</span>
            </label>
            <div className="relative">
              <select
                value={selfAward}
                onChange={(e) => setSelfAward(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-purple-50/20 border-2 border-purple-200 hover:border-purple-400 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all cursor-pointer"
              >
                <option value="Giấy khen của Hiệu trưởng">📜 Giấy khen của Hiệu trưởng</option>
                <option value="Giấy khen của Giám đốc Sở GD&ĐT">📜 Giấy khen của Giám đốc Sở GD&ĐT</option>
                <option value="Bằng khen của Chủ tịch UBND Tỉnh">📜 Bằng khen của Chủ tịch UBND Tỉnh</option>
                <option value="">⚪ Không đề nghị khen thưởng đột xuất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Báo cáo tóm tắt kết quả thực hiện nhiệm vụ:</span>
          </label>
          <textarea
            value={selfReport}
            onChange={(e) => setSelfReport(e.target.value)}
            rows={5}
            placeholder="Nêu tóm tắt kết quả nổi bật trong năm học: công tác dạy học, bồi dưỡng học sinh, nề nếp chuyên môn, các giải thưởng đạt được..."
            className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all leading-relaxed text-slate-900"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-amber-200" />
            <span>{saving ? 'Đang lưu...' : 'Gửi phiếu tự đánh giá'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
