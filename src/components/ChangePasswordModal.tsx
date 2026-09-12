import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, X } from 'lucide-react';
import { apiRequest } from '../services/api.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory: boolean;
  onPasswordChanged: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isMandatory,
  onPasswordChanged
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword === 'Ds@123') {
      setError('Mật khẩu mới không được trùng với mật khẩu mặc định khởi tạo ban đầu (Ds@123).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      setSuccess(true);
      setTimeout(() => {
        onPasswordChanged();
        onClose();
        setSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="text-base font-bold">
                {isMandatory ? 'Bắt buộc đổi mật khẩu lần đầu' : 'Đổi mật khẩu tài khoản'}
              </h3>
              <p className="text-xs text-blue-200">Bảo mật thông tin thi đua khen thưởng</p>
            </div>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isMandatory && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Yêu cầu an toàn:</strong> Bạn đang đăng nhập bằng mật khẩu mặc định. Theo quy chế bảo mật, viên chức bắt buộc phải đổi mật khẩu riêng trước khi tham gia đăng ký và theo dõi thi đua.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Đổi mật khẩu thành công! Đang lưu thông tin...</span>
            </div>
          )}

          <div>
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase mb-2">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Mật khẩu hiện tại</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại (VD: Ds@123)"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-slate-100 focus:border-slate-600 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase mb-2">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Mật khẩu mới</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự, khác Ds@123"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-blue-50/20 border-2 border-blue-200 hover:border-blue-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-900 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xác nhận mật khẩu mới</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-emerald-50/20 border-2 border-emerald-200 hover:border-emerald-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 transition-all text-slate-900 font-medium"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-2">
            {!isMandatory && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors order-2 sm:order-1"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
