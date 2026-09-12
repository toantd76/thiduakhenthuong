import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building2,
  Lock,
  ExternalLink,
  X,
  Award,
  Stamp
} from 'lucide-react';
import { AuthSession } from '../types.ts';
import { apiRequest } from '../services/api.ts';

interface SchoolLookupViewProps {
  currentUser: AuthSession['user'];
}

export const SchoolLookupView: React.FC<SchoolLookupViewProps> = ({ currentUser }) => {
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [title, setTitle] = useState('all');

  // Modal for viewing details
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);

  useEffect(() => {
    fetchList();
  }, [department, status, title]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword.trim()) params.append('keyword', keyword.trim());
      if (department !== 'all') params.append('department', department);
      if (status !== 'all') params.append('status', status);
      if (title !== 'all') params.append('title', title);

      const data = await apiRequest(`/api/emulation/school-lookup?${params.toString()}`);
      setPersonnelList(data);
    } catch (e) {
      console.error('Error fetching lookup list', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList();
  };

  const handleViewDetail = async (person: any) => {
    setSelectedPerson(person);
    setDetailLoading(true);
    try {
      const data = await apiRequest(`/api/emulation/school-lookup/${person.personnelId}`);
      setDetailData(data);
    } catch (e: any) {
      setDetailData({ error: e.message || 'Không thể xem chi tiết' });
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'approved':
        return { text: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-800' };
      case 'locked':
        return { text: 'Đã khóa', color: 'bg-purple-100 text-purple-800' };
      case 'submitted':
        return { text: 'Chờ duyệt', color: 'bg-blue-100 text-blue-800' };
      case 'revision_requested':
        return { text: 'Bổ sung', color: 'bg-amber-100 text-amber-800' };
      case 'draft':
      default:
        return { text: 'Bản nháp', color: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-700" />
          Tra cứu thi đua toàn trường THPT Đắk Song
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Theo dõi tiến độ đăng ký, kết quả thực hiện và quyết định khen thưởng công khai trong nhà trường (Bảo mật CCCD & dữ liệu riêng tư)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm theo họ tên giáo viên, tổ bộ môn, chức vụ..."
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-blue-50/20 border-2 border-blue-200 hover:border-blue-400 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tổ chuyên môn</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2.5 bg-indigo-50/20 border-2 border-indigo-200 hover:border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-hidden rounded-xl font-medium text-slate-800 transition-all cursor-pointer"
            >
              <option value="all">-- Tất cả các tổ ({personnelList.length}) --</option>
              <option value="Toán - Tin">Tổ Toán - Tin</option>
              <option value="Ngữ văn - Anh">Tổ Ngữ văn - Anh</option>
              <option value="GDTC - QPAN - KTPL">Tổ GDTC - QPAN - KTPL</option>
              <option value="Sử - Địa">Tổ Sử - Địa</option>
              <option value="Khoa học Tự nhiên">Tổ Khoa học Tự nhiên</option>
              <option value="Văn phòng">Tổ Văn phòng</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>Trạng thái đăng ký</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-amber-50/20 border-2 border-amber-200 hover:border-amber-300 focus:border-amber-600 focus:ring-4 focus:ring-amber-100 focus:outline-hidden rounded-xl font-medium text-slate-800 transition-all cursor-pointer"
            >
              <option value="all">-- Tất cả trạng thái --</option>
              <option value="draft">📝 Bản nháp</option>
              <option value="submitted">⏳ Đã nộp chờ duyệt</option>
              <option value="approved">✅ Đã phê duyệt</option>
              <option value="revision_requested">⚠️ Yêu cầu bổ sung</option>
              <option value="locked">🔒 Đã khóa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Danh hiệu đăng ký</span>
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-purple-50/20 border-2 border-purple-200 hover:border-purple-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-hidden rounded-xl font-medium text-slate-800 transition-all cursor-pointer"
            >
              <option value="all">-- Tất cả danh hiệu --</option>
              <option value="Lao động tiên tiến">🥇 Lao động tiên tiến</option>
              <option value="Chiến sĩ thi đua cơ sở">🏅 Chiến sĩ thi đua cơ sở</option>
              <option value="Chiến sĩ thi đua cấp Tỉnh">🎖️ Chiến sĩ thi đua cấp Tỉnh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách nhân sự ({personnelList.length} hồ sơ)
          </span>
          <span className="text-[11px] text-slate-500">
            * Dữ liệu danh tính CCCD được bảo mật theo quy định
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Đang tải danh sách...</div>
        ) : personnelList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Tổ / Chức vụ</th>
                  <th className="py-3 px-4">Danh hiệu đăng ký</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Tiến độ</th>
                  <th className="py-3 px-4">Kết quả công nhận</th>
                  <th className="py-3 px-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personnelList.map((p) => {
                  const badge = getStatusBadge(p.registrationStatus);
                  return (
                    <tr key={p.personnelId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-500 text-center">{p.stt}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{p.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{p.specialty}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.department}</div>
                        <div className="text-[10px] text-slate-500">{p.currentPosition}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-900">
                        {p.registeredTitle}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${p.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-bold text-[10px] text-slate-600">
                            {p.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {p.officialResult ? (
                          <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                            <Stamp className="w-3.5 h-3.5" />
                            <span>{p.officialResult.recognizedTitle}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Chưa xét</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewDetail(p)}
                          className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết hồ sơ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{selectedPerson.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {selectedPerson.currentPosition} – {selectedPerson.department}
                </p>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {detailLoading ? (
                <div className="text-center py-8 text-slate-500">Đang tải hồ sơ...</div>
              ) : detailData?.error ? (
                <div className="p-4 bg-rose-50 text-rose-800 rounded-xl">{detailData.error}</div>
              ) : !detailData?.registration ? (
                <div className="text-slate-500 py-4">Nhân sự chưa khởi tạo hồ sơ thi đua.</div>
              ) : (
                <>
                  {/* Overview box */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block font-medium">Danh hiệu đăng ký:</span>
                      <strong className="text-blue-900">{detailData.registration.registeredTitle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Khen thưởng đăng ký:</span>
                      <strong className="text-slate-800">{detailData.registration.registeredAward || 'Không'}</strong>
                    </div>
                  </div>

                  {/* Official result if any */}
                  {detailData.registration.officialRecognition?.isPublished && (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                        <Stamp className="w-4 h-4" />
                        <span>Quyết định công nhận chính thức</span>
                      </div>
                      <div className="text-xs">
                        Số {detailData.registration.officialRecognition.decisionNumber} ngày{' '}
                        {detailData.registration.officialRecognition.decisionDate} ({detailData.registration.officialRecognition.issuingAuthority}):
                      </div>
                      <div className="font-bold mt-1">
                        {detailData.registration.officialRecognition.recognizedTitle} – {detailData.registration.officialRecognition.recognizedDutyRating}
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Tiêu chuẩn & Kết quả thực hiện
                    </h4>
                    <div className="space-y-2">
                      {detailData.registration.items.map((item: any, idx: number) => (
                        <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">
                              #{idx + 1}. {item.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.completionLevel === 'completed' || item.completionLevel === 'exceeded'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.completionLevel === 'exceeded'
                                ? 'Vượt chỉ tiêu'
                                : item.completionLevel === 'completed'
                                ? 'Đạt'
                                : 'Chưa cập nhật'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                            <div className="text-slate-600">
                              Cam kết: <strong>{item.targetValue}</strong>
                            </div>
                            <div className="text-slate-800">
                              Thực tế: <strong>{item.actualValue || 'Chưa có'}</strong>
                            </div>
                          </div>

                          {item.actualProofDescription && (
                            <div className="mt-1 text-[11px] text-slate-500">
                              Minh chứng: {item.actualProofDescription}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-4 py-2 bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
