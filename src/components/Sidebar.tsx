import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  FileEdit,
  CheckCircle2,
  Award,
  Search,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { RoleType } from '../types.ts';

export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'registration'
  | 'results'
  | 'self_evaluation'
  | 'school_lookup'
  | 'approval_review'
  | 'reports'
  | 'admin'
  | 'user_guide';

interface SidebarProps {
  currentTab?: NavTab | string;
  activeView?: string;
  onSelectTab?: (tab: NavTab) => void;
  onSelectView?: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userRoles?: RoleType[];
  currentUser?: { roles?: RoleType[] } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeView,
  onSelectTab,
  onSelectView,
  isOpen = false,
  onClose = () => {},
  userRoles,
  currentUser
}) => {
  const roles = (userRoles || currentUser?.roles || []) as RoleType[];
  const isDepartmentHead = roles.includes('department_head');
  const isSchoolBoard = roles.includes('school_board');
  const isAdmin = roles.includes('admin');

  // Normalize aliases so matching works whether using 'registration' or 'my_registration'
  const rawActive = activeView || currentTab || 'dashboard';
  const normalizedActive: string =
    rawActive === 'my_registration'
      ? 'registration'
      : rawActive === 'execution_results'
      ? 'results'
      : rawActive === 'review_approval'
      ? 'approval_review'
      : rawActive === 'guide'
      ? 'user_guide'
      : rawActive;

  const handleSelectTab = (tabId: NavTab) => {
    if (onSelectTab) onSelectTab(tabId);
    if (onSelectView) onSelectView(tabId);
    onClose();
  };

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: '1. Tổng quan',
      icon: LayoutDashboard,
      show: true
    },
    {
      id: 'profile' as NavTab,
      label: '2. Hồ sơ cá nhân',
      icon: UserCheck,
      show: true
    },
    {
      id: 'registration' as NavTab,
      label: '3. Đăng ký thi đua của tôi',
      icon: FileEdit,
      show: true
    },
    {
      id: 'results' as NavTab,
      label: '4. Kết quả & minh chứng',
      icon: CheckCircle2,
      show: true
    },
    {
      id: 'self_evaluation' as NavTab,
      label: '5. Tự đánh giá cuối năm',
      icon: Award,
      show: true
    },
    {
      id: 'school_lookup' as NavTab,
      label: '6. Tra cứu toàn trường',
      icon: Search,
      show: true
    },
    {
      id: 'approval_review' as NavTab,
      label: '7. Duyệt & xét thi đua',
      icon: CheckSquare,
      // Only show for department heads, school board, or admin
      show: isDepartmentHead || isSchoolBoard || isAdmin,
      badge: isSchoolBoard ? 'BGH' : isDepartmentHead ? 'Tổ' : undefined
    },
    {
      id: 'reports' as NavTab,
      label: '8. Báo cáo – Thống kê',
      icon: BarChart3,
      show: true
    },
    {
      id: 'admin' as NavTab,
      label: '9. Quản trị hệ thống',
      icon: Settings,
      // Only show for technical admin
      show: isAdmin,
      badge: 'Admin'
    },
    {
      id: 'user_guide' as NavTab,
      label: '10. Hướng dẫn sử dụng',
      icon: HelpCircle,
      show: true
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo THPT Đắk Song"
              referrerPolicy="no-referrer"
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="font-bold text-sm text-blue-900 block leading-none">THPT ĐẮK SONG</span>
              <span className="text-[11px] text-slate-500 font-medium">Thi đua 2026–2027</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Header */}
        <div className="px-5 py-4 border-b border-slate-100 hidden lg:block">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Danh mục chức năng
          </p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Quy trình thi đua năm 2026–2027
          </p>
        </div>

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = normalizedActive === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        isActive
                          ? 'bg-blue-800 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* System Info footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Phiên bản v2.6.27</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Trực tuyến
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Trường THPT Đắk Song – Lâm Đồng
          </p>
        </div>
      </aside>
    </>
  );
};
