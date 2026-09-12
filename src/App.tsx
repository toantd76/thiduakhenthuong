import React, { useState, useEffect } from 'react';
import { AuthSession, EmulationRegistration } from './types.ts';
import { apiRequest, clearStoredAuth, getStoredToken, setStoredAuth } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ChangePasswordModal } from './components/ChangePasswordModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { MyRegistrationView } from './components/MyRegistrationView.tsx';
import { ExecutionResultsView } from './components/ExecutionResultsView.tsx';
import { SelfEvaluationView } from './components/SelfEvaluationView.tsx';
import { SchoolLookupView } from './components/SchoolLookupView.tsx';
import { ApprovalReviewView } from './components/ApprovalReviewView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { UserGuideView } from './components/UserGuideView.tsx';
import { PrintModal } from './components/PrintModal.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthSession['user'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [printRegistration, setPrintRegistration] = useState<EmulationRegistration | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      setShowLoginModal(true);
      return;
    }

    try {
      const data = await apiRequest('/api/auth/me');
      setCurrentUser(data.user);
      if (data.user.needsPasswordChange) {
        setShowChangePassword(true);
      }
    } catch (err) {
      clearStoredAuth();
      setCurrentUser(null);
      setShowLoginModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (session: AuthSession) => {
    setStoredAuth(session);
    setCurrentUser(session.user);
    setShowLoginModal(false);
    if (session.user.needsPasswordChange) {
      setShowChangePassword(true);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      clearStoredAuth();
      setCurrentUser(null);
      setShowLoginModal(true);
      setActiveView('dashboard');
    }
  };

  const handleOpenPrint = (reg: EmulationRegistration) => {
    setPrintRegistration(reg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Đang khởi động hệ thống thi đua THPT Đắk Song...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Navigation Topbar */}
      <Navbar
        currentUser={currentUser}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onLogoutClick={handleLogout}
        onOpenPasswordModal={() => setShowChangePassword(true)}
        onChangePasswordClick={() => setShowChangePassword(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNavigate={setActiveView}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col md:flex-row gap-5">
        {/* Sidebar Navigation */}
        <Sidebar
          currentUser={currentUser}
          userRoles={currentUser?.roles || []}
          activeView={activeView}
          currentTab={activeView as any}
          onSelectView={setActiveView}
          onSelectTab={(tab) => setActiveView(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 min-w-0">
          {!currentUser ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Chào mừng bạn đến với Cổng thi đua – khen thưởng Trường THPT Đắk Song
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Vui lòng đăng nhập bằng số CCCD và mật khẩu do nhà trường cấp để truy cập các chức năng đăng ký, tự đánh giá và theo dõi thi đua.
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-colors"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && (
                <DashboardView currentUser={currentUser} onNavigate={setActiveView} />
              )}
              {activeView === 'profile' && (
                <ProfileView currentUser={currentUser} onChangePassword={() => setShowChangePassword(true)} />
              )}
              {(activeView === 'registration' || activeView === 'my_registration') && (
                <MyRegistrationView currentUser={currentUser} onOpenPrintModal={handleOpenPrint} />
              )}
              {(activeView === 'results' || activeView === 'execution_results') && (
                <ExecutionResultsView currentUser={currentUser} />
              )}
              {activeView === 'self_evaluation' && (
                <SelfEvaluationView currentUser={currentUser} onOpenPrintModal={handleOpenPrint} />
              )}
              {activeView === 'school_lookup' && (
                <SchoolLookupView currentUser={currentUser} />
              )}
              {(activeView === 'approval_review' || activeView === 'review_approval') && (
                <ApprovalReviewView currentUser={currentUser} />
              )}
              {activeView === 'reports' && <ReportsView />}
              {activeView === 'admin' && <AdminView />}
              {(activeView === 'user_guide' || activeView === 'guide') && <UserGuideView />}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-[11px] text-slate-500 print:hidden">
        <div>
          <strong>TRƯỜNG TRUNG HỌC PHỔ THÔNG ĐẮK SONG – TỈNH LÂM ĐỒNG</strong>
        </div>
        <div className="mt-0.5">
          Hệ thống Đăng ký và Quản lý Thi đua – Khen thưởng Năm học 2026–2027 | Cơ sở dữ liệu 64 CBQL, GV, NV
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => {
            if (currentUser) setShowLoginModal(false);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          isMandatory={Boolean(currentUser?.needsPasswordChange)}
          onClose={() => {
            if (!currentUser?.needsPasswordChange) {
              setShowChangePassword(false);
            }
          }}
          onSuccess={() => {
            setShowChangePassword(false);
            if (currentUser) {
              setCurrentUser({ ...currentUser, needsPasswordChange: false });
            }
          }}
        />
      )}

      {printRegistration && (
        <PrintModal
          registration={printRegistration}
          onClose={() => setPrintRegistration(null)}
        />
      )}
    </div>
  );
}
