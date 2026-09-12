import React, { useState } from 'react';
import { User, Shield, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Building2, Briefcase, GraduationCap } from 'lucide-react';
import { AuthSession } from '../types.ts';

interface ProfileViewProps {
  currentUser: AuthSession['user'];
  onOpenPasswordModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenPasswordModal
}) => {
  const [showFullCCCD, setShowFullCCCD] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-700" />
          Hồ sơ cán bộ, giáo viên, nhân viên
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Thông tin hồ sơ nhân sự chính thức theo danh sách Trường THPT Đắk Song năm học 2026–2027
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 p-2 flex items-center justify-center shrink-0">
            <User className="w-12 h-12 text-blue-200" />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hồ sơ đã xác minh & kích hoạt</span>
            </div>
            <h3 className="text-2xl font-black">{currentUser.fullName}</h3>
            <p className="text-sm text-blue-200 mt-1 font-medium">
              {currentUser.currentPosition} – {currentUser.department}
            </p>
          </div>

          <button
            onClick={onOpenPasswordModal}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Detailed Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Họ và tên viên chức
            </span>
            <span className="text-base font-bold text-slate-900">{currentUser.fullName}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Số CCCD (Định danh cá nhân)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-base font-mono font-bold text-slate-900">
                {showFullCCCD ? currentUser.fullCCCD : currentUser.cccd}
              </span>
              <button
                type="button"
                onClick={() => setShowFullCCCD(!showFullCCCD)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 p-1"
              >
                {showFullCCCD ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ẩn</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hiện</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Ngày sinh & Giới tính
            </span>
            <span className="text-sm font-bold text-slate-900">
              {currentUser.birthDate || 'Chưa cập nhật'} – {currentUser.gender || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Chuyên môn đào tạo
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              {currentUser.specialty}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Chức vụ hiện tại
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              {currentUser.currentPosition}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Tổ chuyên môn / Tổ công tác
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              {currentUser.department}
            </span>
          </div>
        </div>

        {/* Roles & Permissions Info */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">
            Phân quyền tài khoản trong quy trình thi đua:
          </span>
          <div className="flex flex-wrap gap-2">
            {(currentUser?.roles || []).map((r) => (
              <span
                key={r}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs"
              >
                {r === 'admin'
                  ? 'Quản trị viên toàn hệ thống'
                  : r === 'school_board'
                  ? 'Ban Giám hiệu (Phê duyệt & Quyết định)'
                  : r === 'department_head'
                  ? 'Tổ trưởng / Tổ phó chuyên môn (Thẩm định)'
                  : 'Cán bộ, Giáo viên, Nhân viên (Đăng ký & Báo cáo)'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
