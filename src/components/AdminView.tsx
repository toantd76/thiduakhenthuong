import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  BookOpen,
  History,
  Download,
  Upload,
  CheckCircle2,
  X,
  Edit2,
  Check,
  ShieldAlert,
  Search
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personnel' | 'config' | 'catalogs' | 'logs' | 'backup'>('personnel');
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [schoolYear, setSchoolYear] = useState<any | null>(null);
  const [catalogs, setCatalogs] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit CCCD Modal
  const [editingPerson, setEditingPerson] = useState<any | null>(null);
  const [newCCCD, setNewCCCD] = useState('');
  const [activateAcc, setActivateAcc] = useState(true);

  // Edit Roles Modal
  const [rolePerson, setRolePerson] = useState<any | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [pData, yData, cData, lData] = await Promise.all([
        apiRequest('/api/admin/personnel-full'),
        apiRequest('/api/admin/config/school-year'),
        apiRequest('/api/admin/config/catalogs'),
        apiRequest('/api/admin/audit-logs')
      ]);
      setPersonnelList(pData);
      setSchoolYear(yData);
      setCatalogs(cData);
      setAuditLogs(lData);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Lỗi khi tải dữ liệu quản trị' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditCCCD = (p: any) => {
    setEditingPerson(p);
    setNewCCCD(p.cccd);
    setActivateAcc(p.accountStatus === 'pending_verification' ? true : true);
  };

  const handleSaveCCCD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson) return;

    try {
      await apiRequest('/api/admin/personnel/update-cccd', {
        method: 'POST',
        body: JSON.stringify({
          personnelId: editingPerson.id,
          newCCCD: newCCCD.trim(),
          activateAccount: activateAcc
        })
      });

      setMessage({
        type: 'success',
        text: `Đã cập nhật CCCD mới cho ${editingPerson.fullName} (${newCCCD.trim()}) thành công!`
      });
      setEditingPerson(null);
      loadAllData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể cập nhật CCCD' });
    }
  };

  const handleResetPassword = async (p: any) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn đặt lại mật khẩu của ${p.fullName} về mặc định (Ds@123) và yêu cầu đổi mật khẩu ở lần đăng nhập tiếp theo?`
      )
    ) {
      return;
    }

    try {
      await apiRequest('/api/admin/personnel/reset-password', {
        method: 'POST',
        body: JSON.stringify({ personnelId: p.id })
      });
      setMessage({
        type: 'success',
        text: `Đã đặt lại mật khẩu của ${p.fullName} về mặc định (Ds@123)`
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi đặt lại mật khẩu' });
    }
  };

  const handleOpenRoles = (p: any) => {
    setRolePerson(p);
    setSelectedRoles([...(p.roles || [])]);
  };

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolePerson) return;

    try {
      await apiRequest('/api/admin/personnel/update-roles', {
        method: 'POST',
        body: JSON.stringify({
          personnelId: rolePerson.id,
          roles: selectedRoles
        })
      });
      setMessage({ type: 'success', text: `Đã cập nhật phân quyền cho ${rolePerson.fullName}` });
      setRolePerson(null);
      loadAllData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi cập nhật phân quyền' });
    }
  };

  const handleSaveSchoolYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolYear) return;

    try {
      await apiRequest('/api/admin/config/school-year', {
        method: 'PUT',
        body: JSON.stringify(schoolYear)
      });
      setMessage({ type: 'success', text: 'Đã cập nhật cấu hình thời hạn năm học thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi lưu cấu hình' });
    }
  };

  const handleExportBackup = () => {
    window.location.href = '/api/admin/backup';
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await apiRequest('/api/admin/restore', {
          method: 'POST',
          body: JSON.stringify({ data: json })
        });
        setMessage({ type: 'success', text: 'Đã phục hồi dữ liệu hệ thống từ bản sao lưu thành công!' });
        loadAllData();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Tệp sao lưu không hợp lệ' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-700" />
          Quản trị hệ thống thi đua (Quản trị viên kỹ thuật)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Quản lý 64 hồ sơ nhân sự, xử lý trùng lặp CCCD, phân quyền, cấu hình thời hạn và nhật ký kiểm toán
        </p>
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
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 text-xs font-bold gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('personnel')}
          className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'personnel'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Hồ sơ nhân sự ({personnelList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'config'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>2. Cấu hình năm học & thời hạn</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogs')}
          className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'catalogs'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>3. Căn cứ pháp lý & Danh mục tiêu chuẩn</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>4. Nhật ký kiểm toán ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'backup'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>5. Sao lưu & Phục hồi</span>
        </button>
      </div>

      {/* Tab Content 1: Personnel */}
      {activeTab === 'personnel' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Danh sách 64 CBQL, Giáo viên, Nhân viên chính thức
              </span>
              <p className="text-[11px] text-slate-500">
                Hiển thị số CCCD đầy đủ phục vụ kiểm toán tài khoản. STT 57 và 58 trùng CCCD được gắn nhãn cảnh báo.
              </p>
            </div>

            <div className="w-full md:w-72">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={personnelSearch}
                  onChange={(e) => setPersonnelSearch(e.target.value)}
                  placeholder="Tìm theo tên, tổ, số CCCD..."
                  className="w-full pl-9 pr-3 py-1.5 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Số CCCD</th>
                  <th className="py-3 px-4">Tổ / Chức vụ</th>
                  <th className="py-3 px-4">Trạng thái TK</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personnelList
                  .filter((p) => {
                    if (!personnelSearch.trim()) return true;
                    const q = personnelSearch.toLowerCase();
                    return (
                      p.fullName?.toLowerCase().includes(q) ||
                      p.cccd?.includes(q) ||
                      p.department?.toLowerCase().includes(q) ||
                      p.currentPosition?.toLowerCase().includes(q)
                    );
                  })
                  .map((p) => {
                  const isDuplicateAlert = p.accountStatus === 'pending_verification';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isDuplicateAlert ? 'bg-red-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-500 text-center">{p.stt}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.fullName}
                        <div className="text-[10px] text-slate-400 font-normal">{p.specialty}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {p.cccd}
                        {isDuplicateAlert && (
                          <span className="block text-[10px] font-bold text-red-600">
                            Trùng CCCD (STT 57-58)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.department}</div>
                        <div className="text-[10px] text-slate-500">{p.currentPosition}</div>
                      </td>
                      <td className="py-3 px-4">
                        {p.accountStatus === 'pending_verification' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            Chờ xác minh CCCD
                          </span>
                        ) : p.isLocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Đang khóa (5 lần sai)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Đã kích hoạt
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.roles.map((r: string) => (
                            <span
                              key={r}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditCCCD(p)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                            title="Cập nhật CCCD"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(p)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg"
                            title="Đặt lại mật khẩu Ds@123"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenRoles(p)}
                            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg"
                            title="Phân quyền"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: School Year & Deadlines */}
      {activeTab === 'config' && schoolYear && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              Cấu hình thời hạn & quyền sửa đổi thi đua năm học {schoolYear.year}
            </h3>
          </div>

          <form onSubmit={handleSaveSchoolYear} className="space-y-5 max-w-2xl text-xs">
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Niên độ năm học</span>
              </label>
              <input
                type="text"
                value={schoolYear.year}
                onChange={(e) => setSchoolYear({ ...schoolYear, year: e.target.value })}
                className="w-full p-2.5 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 rounded-xl font-bold text-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hạn nộp đăng ký</span>
                </label>
                <input
                  type="date"
                  value={schoolYear.registrationDeadline}
                  onChange={(e) =>
                    setSchoolYear({ ...schoolYear, registrationDeadline: e.target.value })
                  }
                  className="w-full p-2 bg-amber-50/20 border-2 border-amber-200 hover:border-amber-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-amber-100 rounded-xl font-bold text-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Hạn thẩm định</span>
                </label>
                <input
                  type="date"
                  value={schoolYear.supplementDeadline}
                  onChange={(e) =>
                    setSchoolYear({ ...schoolYear, supplementDeadline: e.target.value })
                  }
                  className="w-full p-2 bg-purple-50/20 border-2 border-purple-200 hover:border-purple-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-purple-100 rounded-xl font-bold text-slate-900 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hạn tự đánh giá</span>
                </label>
                <input
                  type="date"
                  value={schoolYear.evaluationDeadline}
                  onChange={(e) =>
                    setSchoolYear({ ...schoolYear, evaluationDeadline: e.target.value })
                  }
                  className="w-full p-2 bg-emerald-50/20 border-2 border-emerald-200 hover:border-emerald-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-emerald-100 rounded-xl font-bold text-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label
                htmlFor="allow-reg-edit"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  id="allow-reg-edit"
                  type="checkbox"
                  checked={schoolYear.allowRegistrationEdit}
                  onChange={(e) =>
                    setSchoolYear({ ...schoolYear, allowRegistrationEdit: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800">
                  Cho phép chỉnh sửa đăng ký thi đua đầu năm (khi hồ sơ ở trạng thái Bản nháp)
                </span>
              </label>

              <label
                htmlFor="allow-res-edit"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  id="allow-res-edit"
                  type="checkbox"
                  checked={schoolYear.allowResultUpdate}
                  onChange={(e) =>
                    setSchoolYear({ ...schoolYear, allowResultUpdate: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800">
                  Cho phép cập nhật kết quả thực hiện và bổ sung hồ sơ minh chứng
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-blue-200" />
                <span>Lưu cấu hình thời hạn</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content 3: Catalogs & Legal Citations */}
      {activeTab === 'catalogs' && catalogs && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Căn cứ pháp lý hiện hành
            </h3>
            <div className="space-y-3">
              {catalogs.legalCitations.map((leg: any) => (
                <div key={leg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{leg.title}</span>
                      <div className="text-slate-600 mt-0.5">
                        Số: <strong>{leg.docNumber}</strong> | Ngày ban hành: {leg.issueDate} | Cơ quan: {leg.issuingAuthority}
                      </div>
                      <div className="text-slate-500 mt-1">
                        Điều khoản áp dụng: <strong>{leg.relevantArticles}</strong>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        leg.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {leg.verificationStatus === 'verified' ? 'Đã xác minh chính thức' : 'Chờ xác minh niên độ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Nhật ký kiểm toán hệ thống ({auditLogs.length} sự kiện)
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4 w-40">Thời gian</th>
                  <th className="py-2.5 px-4">Người thực hiện</th>
                  <th className="py-2.5 px-4">Hành động</th>
                  <th className="py-2.5 px-4">Chi tiết</th>
                  <th className="py-2.5 px-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500 font-sans">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 font-sans">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-blue-800">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-sans">{log.details}</td>
                    <td className="py-2.5 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 5: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs max-w-xl">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <h4 className="font-bold text-slate-900 text-sm mb-1">1. Sao lưu toàn bộ dữ liệu</h4>
            <p className="text-slate-600 mb-3">
              Tải về tập tin JSON chứa toàn bộ dữ liệu hồ sơ nhân sự, chỉ tiêu đăng ký, minh chứng, biên bản đánh giá và nhật ký hệ thống.
            </p>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải bản sao lưu (JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <h4 className="font-bold text-slate-900 text-sm mb-1">2. Phục hồi từ bản sao lưu</h4>
            <p className="text-slate-600 mb-3">
              Chọn tập tin JSON sao lưu hợp lệ để khôi phục toàn bộ trạng thái dữ liệu.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      )}

      {/* Edit CCCD Modal */}
      {editingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Cập nhật số CCCD & Kích hoạt tài khoản
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Nhân sự: <strong className="text-blue-900">{editingPerson.fullName}</strong> (STT {editingPerson.stt} – {editingPerson.currentPosition})
              </p>
            </div>

            <form onSubmit={handleSaveCCCD} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Số CCCD mới (12 chữ số, giữ nguyên số 0 đầu)</span>
                </label>
                <input
                  type="text"
                  value={newCCCD}
                  onChange={(e) => setNewCCCD(e.target.value)}
                  placeholder="045082004379"
                  maxLength={12}
                  className="w-full p-2.5 bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 rounded-xl font-mono text-sm font-bold text-slate-900 transition-all"
                  required
                />
              </div>

              <label
                htmlFor="activate-checkbox"
                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer transition-colors"
              >
                <input
                  id="activate-checkbox"
                  type="checkbox"
                  checked={activateAcc}
                  onChange={(e) => setActivateAcc(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span className="font-bold text-slate-800">
                  Xác minh và kích hoạt tài khoản đăng nhập ngay
                </span>
              </label>

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-blue-200" />
                  <span>Lưu & Cập nhật</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Roles Modal */}
      {rolePerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Phân quyền tài khoản
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Nhân sự: <strong className="text-purple-900">{rolePerson.fullName}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveRoles} className="space-y-2.5 text-xs">
              {['personal', 'department_head', 'school_board', 'admin'].map((role) => {
                const isChecked = (selectedRoles || []).includes(role);
                return (
                  <label
                    key={role}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-colors ${
                      isChecked
                        ? 'border-purple-300 bg-purple-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, role]);
                        } else {
                          setSelectedRoles(selectedRoles.filter((r) => r !== role));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {role === 'admin'
                          ? '👑 Quản trị viên hệ thống (Admin)'
                          : role === 'school_board'
                          ? '🏫 Ban Giám hiệu (Phê duyệt & Quyết định)'
                          : role === 'department_head'
                          ? '📋 Tổ trưởng / Tổ phó chuyên môn (Thẩm định)'
                          : '👨‍🏫 Cá nhân (Đăng ký, cập nhật & tự đánh giá)'}
                      </span>
                    </div>
                  </label>
                );
              })}

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRolePerson(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-purple-200" />
                  <span>Lưu phân quyền</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
