import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  Users,
  FileCheck,
  Building2,
  Award,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';

export const ReportsView: React.FC = () => {
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/emulation/reports/summary');
      setReportData(data);
    } catch (e) {
      console.error('Error loading reports', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'BÁO CÁO THỐNG KÊ THI ĐUA NĂM HỌC 2026-2027 - TRƯỜNG THPT ĐẮK SONG\n\n';
    csvContent += 'STT,Tổ chuyên môn,Tổng số nhân sự,Đã nộp đăng ký,Đã phê duyệt,Bản nháp,Tỷ lệ hoàn thành (%)\n';

    reportData.departmentStats.forEach((d: any, idx: number) => {
      csvContent += `${idx + 1},"${d.department}",${d.totalMembers},${d.submitted},${d.approved},${d.drafts},${d.pendingRate}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_thi_dua_THPT_Dak_Song_2026_2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Đang tổng hợp báo cáo thống kê...
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-8 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs">
        Không có dữ liệu báo cáo thống kê.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-700" />
            Báo cáo – Thống kê thi đua khen thưởng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Báo cáo số liệu tổng hợp niên độ 2026–2027 phục vụ quản lý và báo cáo Sở GD&ĐT tỉnh Lâm Đồng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo thống kê</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
            Tổng số viên chức
          </span>
          <div className="text-2xl font-black text-slate-900">{reportData.totalPersonnel}</div>
          <p className="text-[11px] text-slate-500 mt-1">64 CBQL, GV, NV nhà trường</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
            Đã nộp đăng ký
          </span>
          <div className="text-2xl font-black text-indigo-700">
            {reportData.registrationOverview.submittedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Chờ tổ chuyên môn & BGH duyệt</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
            BGH đã phê duyệt
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {reportData.registrationOverview.approvedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Đã thông qua kế hoạch thi đua</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
            Quyết định khen thưởng
          </span>
          <div className="text-2xl font-black text-amber-700">{reportData.publishedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Đã có quyết định chính thức</p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Bảng theo dõi tiến độ thi đua theo từng Tổ chuyên môn & Tổ Văn phòng
          </h3>
          <span className="text-xs font-semibold text-slate-500">Năm học 2026–2027</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Tổ chuyên môn / Công tác</th>
                <th className="py-3 px-4 text-center">Tổng nhân sự</th>
                <th className="py-3 px-4 text-center">Đã nộp</th>
                <th className="py-3 px-4 text-center">Đã duyệt</th>
                <th className="py-3 px-4 text-center">Bản nháp</th>
                <th className="py-3 px-4">Tỷ lệ tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.departmentStats.map((dept: any, idx: number) => (
                <tr key={dept.department} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-500 text-center">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {dept.totalMembers}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-700">
                    {dept.submitted}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {dept.approved}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-500">{dept.drafts}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${dept.pendingRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-[10px] text-blue-900">
                        {dept.pendingRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Title Breakdown Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600" />
          Cơ cấu danh hiệu thi đua đăng ký toàn trường
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(reportData.titleCounts || {}).map(([titleName, count]: any) => (
            <div
              key={titleName}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 block">{titleName}</span>
                <span className="text-[11px] text-slate-500">Cấp thẩm quyền xét</span>
              </div>
              <div className="text-xl font-black text-blue-800">{count} hồ sơ</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
