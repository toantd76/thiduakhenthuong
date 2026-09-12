import React, { useState } from 'react';
import { Lock, User, AlertCircle, ShieldAlert, KeyRound, Check, HelpCircle } from 'lucide-react';
import { apiRequest, setStoredToken } from '../services/api.ts';
import { AuthSession } from '../types.ts';

interface LoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ số CCCD (tên đăng nhập) và mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });

      setStoredToken(data.token);
      onLoginSuccess({
        token: data.token,
        user: data.user
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white p-1 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/logo.png"
                alt="Logo THPT Đắk Song"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">Đăng nhập Hệ thống Thi đua</h3>
              <p className="text-xs text-blue-200">Trường THPT Đắk Song – Năm học 2026–2027</p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(90vh-100px)] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <div>
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase mb-2 tracking-wide">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Tên đăng nhập (Số CCCD hoặc Admin)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập 12 chữ số CCCD (VD: 040076003624) hoặc Admin"
                className="w-full pl-11 pr-3 py-2.5 text-sm bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all font-medium text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <span className="text-amber-600 font-bold">* Lưu ý:</span> Giữ nguyên số 0 ở đầu nếu có. Mật khẩu mặc định: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-700">Ds@123</code>
            </p>
          </div>

          <div>
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase mb-2 tracking-wide">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mật khẩu truy cập</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full pl-11 pr-3 py-2.5 text-sm bg-indigo-50/20 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 active:from-blue-900 active:to-indigo-900 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Đăng nhập hệ thống</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
