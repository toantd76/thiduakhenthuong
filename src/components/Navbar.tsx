import React from 'react';
import { Menu, Shield, KeyRound, LogOut, Award, User, Bell } from 'lucide-react';
import { AuthSession, RoleType } from '../types.ts';

interface NavbarProps {
  currentUser: AuthSession['user'] | null;
  onOpenPasswordModal?: () => void;
  onChangePasswordClick?: () => void;
  onLogout?: () => void;
  onLogoutClick?: () => void;
  onToggleSidebar?: () => void;
  onOpenLoginModal?: () => void;
  onLoginClick?: () => void;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenPasswordModal,
  onChangePasswordClick,
  onLogout,
  onLogoutClick,
  onToggleSidebar,
  onOpenLoginModal,
  onLoginClick
}) => {
  const handlePasswordModal = () => {
    if (onOpenPasswordModal) onOpenPasswordModal();
    if (onChangePasswordClick) onChangePasswordClick();
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    if (onLogoutClick) onLogoutClick();
  };

  const handleOpenLogin = () => {
    if (onOpenLoginModal) onOpenLoginModal();
    if (onLoginClick) onLoginClick();
  };
  const getRoleLabel = (role: RoleType) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị hệ thống', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'school_board':
        return { label: 'Ban Giám hiệu', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'department_head':
        return { label: 'Tổ trưởng / Tổ phó', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'personal':
      default:
        return { label: 'Cá nhân', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Mobile Toggle & School Branding */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* School Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo THPT Đắk Song"
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-xs"
              />
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-900">
                  SỞ GD&ĐT TỈNH LÂM ĐỒNG
                </div>
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-blue-800 uppercase">
                  TRƯỜNG THPT ĐẮK SONG
                </h1>
                <div className="text-xs sm:text-sm font-semibold text-slate-700">
                  HỆ THỐNG ĐĂNG KÝ VÀ THEO DÕI THI ĐUA
                  <span className="hidden sm:inline font-bold text-amber-700 ml-1.5 px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200">
                    Năm học 2026–2027
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: User Information & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Year Tag on mobile */}
                <span className="sm:hidden text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  26–27
                </span>

                {/* User Details */}
                <div className="hidden md:flex flex-col items-end text-right">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentUser.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap justify-end">
                    <span className="text-xs text-slate-500 font-medium mr-1">
                      {currentUser.department}
                    </span>
                    {(currentUser.roles || []).map((r) => {
                      const badge = getRoleLabel(r);
                      return (
                        <span
                          key={r}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 sm:pl-3">
                  <button
                    id="btn-change-password"
                    onClick={handlePasswordModal}
                    title="Đổi mật khẩu"
                    className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <KeyRound className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-logout"
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden xl:inline text-xs font-semibold">Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-login-open"
                onClick={handleOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                <User className="w-4 h-4" />
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
