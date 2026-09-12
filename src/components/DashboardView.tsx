import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  Award,
  Users,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { AuthSession, EmulationRegistration, SchoolYearConfig } from '../types.ts';
import { apiRequest } from '../services/api.ts';
import { NavTab } from './Sidebar.tsx';

interface DashboardViewProps {
  currentUser: AuthSession['user'];
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [myReg, setMyReg] = useState<EmulationRegistration | null>(null);
  const [schoolYear, setSchoolYear] = useState<SchoolYearConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsData, myData] = await Promise.all([
        apiRequest('/api/emulation/reports/summary'),
        apiRequest('/api/emulation/my')
      ]);
      setStats(reportsData);
      setMyReg(myData.registration);
      setSchoolYear(myData.schoolYear);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return { text: 'Đã duyệt chính thức', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'locked':
        return { text: 'Đã khóa hồ sơ', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: ShieldCheck };
      case 'submitted':
        return { text: 'Đã nộp – Đang chờ duyệt', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock };
      case 'revision_requested':
        return { text: 'Yêu cầu bổ sung / điều chỉnh', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle };
      case 'draft':
      default:
        return { text: 'Bản nháp (Chưa nộp)', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: FileText };
    }
  };

  const statusInfo = getStatusBadge(myReg?.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting & Academic Year */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 border border-white/20 mb-3">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Niên độ thi đua: Năm học 2026–2027</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Kính chào Thầy/Cô {currentUser.fullName}!
          </h2>
          <p className="text-sm text-blue-100 mt-1 max-w-3xl">
            Chào mừng đến với Hệ thống Đăng ký và Theo dõi Thi đua Trường THPT Đắk Song. Hệ thống hỗ trợ xuyên suốt từ đăng ký chỉ tiêu đầu năm, cập nhật minh chứng, tự đánh giá đến công nhận khen thưởng chính thức.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('registration')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Đăng ký chỉ tiêu thi đua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('results')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Cập nhật kết quả & minh chứng</span>
            </button>
            <button
              onClick={() => onNavigate('school_lookup')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/20 transition-all"
            >
              <span>Tra cứu toàn trường</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Personal Status Alert Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-3 rounded-xl border ${statusInfo.color}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Trạng thái hồ sơ cá nhân:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                {myReg?.versionsCount && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    (Phiên bản {myReg.versionsCount})
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                Danh hiệu đăng ký: <span className="text-blue-700">{myReg?.registeredTitle || 'Chưa chọn'}</span> | Đề nghị khen thưởng: <span className="text-amber-700">{myReg?.registeredAward || 'Chưa chọn'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {myReg?.status === 'draft' || myReg?.status === 'revision_requested' ? (
              <button
                onClick={() => onNavigate('registration')}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Chỉnh sửa & Nộp hồ sơ
              </button>
            ) : (
              <button
                onClick={() => onNavigate('registration')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Xem chi tiết hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* School Emulation Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng nhân sự</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalPersonnel ?? 64}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Toàn bộ CBQL, giáo viên, nhân viên
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đã nộp đăng ký</span>
            <FileCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {stats?.registrationOverview?.submittedCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Hồ sơ đã hoàn tất gửi tổ & BGH
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đã phê duyệt</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {stats?.registrationOverview?.approvedCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            BGH đã thông qua chỉ tiêu đầu năm
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Khen thưởng chính thức</span>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">
            {stats?.publishedCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Có số quyết định & đã công bố
          </p>
        </div>
      </div>

      {/* Emulation Workflow Stages Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-700" />
          Tiến trình quy trình thi đua năm học 2026–2027
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 relative">
            <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">
              Giai đoạn 1
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-2">Đăng ký đầu năm</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Đăng ký chỉ tiêu, danh hiệu, hình thức khen thưởng và cam kết chất lượng.
            </p>
            <div className="text-[10px] font-bold text-blue-800 mt-2">
              Hạn chót: 15/10/2026
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
            <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded-sm">
              Giai đoạn 2
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-2">Thẩm định & Duyệt</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Tổ chuyên môn nhận xét; BGH phê duyệt chính thức chỉ tiêu thi đua.
            </p>
            <div className="text-[10px] font-semibold text-slate-600 mt-2">
              Thời gian: 16/10 - 31/10/2026
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
            <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded-sm">
              Giai đoạn 3
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-2">Thực hiện & Minh chứng</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Cập nhật tiến độ, số liệu, minh chứng cụ thể cho từng tiêu chuẩn đã đăng ký.
            </p>
            <div className="text-[10px] font-semibold text-slate-600 mt-2">
              Suốt năm học 2026–2027
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
            <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded-sm">
              Giai đoạn 4
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-2">Tự đánh giá cuối năm</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Đối chiếu mục tiêu, tự xếp loại, đề xuất danh hiệu và in phiếu đánh giá.
            </p>
            <div className="text-[10px] font-semibold text-slate-600 mt-2">
              Tháng 05/2027
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
            <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded-sm">
              Giai đoạn 5
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-2">Công nhận khen thưởng</h4>
            <p className="text-[11px] text-slate-600 mt-1">
              Hội đồng TĐKT họp xét; ban hành Quyết định khen thưởng chính thức.
            </p>
            <div className="text-[10px] font-semibold text-slate-600 mt-2">
              Tháng 06/2027
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
