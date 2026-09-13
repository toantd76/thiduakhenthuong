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
    <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 border-b border-blue-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Mobile Toggle & School Branding */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-blue-950 hover:text-blue-900 hover:bg-white/80 focus:outline-hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* School Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-1 sm:p-1.5 bg-white/95 rounded-2xl shadow-xs border border-blue-200/70 shrink-0 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo THPT Đắk Song"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-950">
                  SỞ GD&ĐT TỈNH LÂM ĐỒNG
                </div>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-blue-900 uppercase">
                  TRƯỜNG THPT ĐẮK SONG
                </h1>
                <div className="text-xs sm:text-sm font-bold text-blue-950/85 flex items-center flex-wrap gap-1.5 mt-0.5">
                  <span>HỆ THỐNG ĐĂNG KÝ VÀ THEO DÕI THI ĐUA</span>
                  <span className="hidden sm:inline font-extrabold text-amber-900 px-2 py-0.5 bg-amber-100/90 rounded-md border border-amber-300 shadow-2xs">
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
                <span className="sm:hidden text-xs font-bold text-amber-900 bg-amber-100/90 px-2 py-1 rounded border border-amber-300">
                  26–27
                </span>

                {/* User Details */}
                <div className="hidden md:flex flex-col items-end text-right">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentUser.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap justify-end">
                    <span className="text-xs text-blue-950/70 font-medium mr-1">
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
                <div className="flex items-center gap-1.5 border-l border-blue-200/80 pl-2 sm:pl-3">
                  <button
                    id="btn-change-password"
                    onClick={handlePasswordModal}
                    title="Đổi mật khẩu"
                    className="p-2 text-slate-700 hover:text-blue-900 hover:bg-white/80 rounded-lg transition-colors"
                  >
                    <KeyRound className="w-5 h-5" />
                  </button>
                  <button
                    id="btn-logout"
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 text-slate-700 hover:text-rose-700 hover:bg-white/80 rounded-lg transition-colors flex items-center gap-1"
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
