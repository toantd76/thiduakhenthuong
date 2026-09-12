import React from 'react';
import { X, Printer } from 'lucide-react';
import { EmulationRegistration } from '../types.ts';

interface PrintModalProps {
  registration: EmulationRegistration | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 flex flex-col border border-slate-200 overflow-hidden">
        {/* Controls header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <span className="text-sm font-bold flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            Xem trước bản in (Bản đăng ký thi đua năm học 2026–2027)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In trang này (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="print-sheet" className="p-8 sm:p-12 text-slate-900 bg-white font-serif leading-relaxed text-xs sm:text-sm">
          {/* Header standard */}
          <div className="grid grid-cols-2 pb-6 border-b border-slate-300 items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo THPT Đắk Song"
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-contain shrink-0"
              />
              <div className="text-left">
                <div className="text-[11px] sm:text-xs uppercase font-semibold text-slate-700">SỞ GD&ĐT TỈNH LÂM ĐỒNG</div>
                <div className="text-xs sm:text-sm font-bold uppercase text-blue-900">TRƯỜNG THPT ĐẮK SONG</div>
                <div className="text-[10px] sm:text-xs italic mt-1 text-slate-600">Năm học: 2026–2027</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm font-bold uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-xs sm:text-sm font-bold">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[10px] sm:text-xs italic mt-1">Đắk Song, ngày ..... tháng ..... năm 2026</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide">
              BẢN ĐĂNG KÝ THI ĐUA VÀ THEO DÕI THỰC HIỆN NHIỆM VỤ
            </h1>
            <div className="text-xs italic text-slate-700 mt-1">
              (Thực hiện theo Luật Thi đua, khen thưởng số 06/2022/QH15 và Thông tư số 29/2023/TT-BGDĐT)
            </div>
          </div>

          {/* Personnel Details */}
          <div className="space-y-1.5 mb-6 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                Họ và tên: <strong className="uppercase">{registration.personnelName}</strong>
              </div>
              <div>
                Tổ công tác: <strong>{registration.department}</strong>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                Mục tiêu hoàn thành nhiệm vụ: <strong>{registration.registeredDutyTarget}</strong>
              </div>
              <div>
                Danh hiệu thi đua đăng ký: <strong>{registration.registeredTitle}</strong>
              </div>
            </div>
            {registration.registeredAward && (
              <div>
                Hình thức khen thưởng đăng ký: <strong>{registration.registeredAward}</strong>
              </div>
            )}
            <div>
              Trạng thái hồ sơ trên hệ thống:{' '}
              <strong className="uppercase">
                {registration.status === 'approved'
                  ? 'ĐÃ ĐƯỢC BAN GIÁM HIỆU PHÊ DUYỆT'
                  : registration.status === 'submitted'
                  ? 'ĐÃ NỘP CHỜ DUYỆT'
                  : 'BẢN NHÁP'}
              </strong>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="font-bold uppercase text-xs mb-2">I. CÁC NỘI DUNG VÀ CHỈ TIÊU ĐĂNG KÝ:</div>
            <table className="w-full border-collapse border border-slate-800 text-[11px] sm:text-xs">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-800 p-2 w-10">TT</th>
                  <th className="border border-slate-800 p-2 w-1/3">Tiêu chuẩn / Nhiệm vụ</th>
                  <th className="border border-slate-800 p-2">Chỉ tiêu đăng ký</th>
                  <th className="border border-slate-800 p-2">Kết quả thực tế</th>
                  <th className="border border-slate-800 p-2">Minh chứng đính kèm</th>
                </tr>
              </thead>
              <tbody>
                {registration.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border border-slate-800 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-800 p-2">
                      <div className="font-bold">{item.title}</div>
                      <div className="text-[10px] text-slate-600">{item.targetDescription}</div>
                    </td>
                    <td className="border border-slate-800 p-2 font-semibold">
                      {item.targetValue}
                    </td>
                    <td className="border border-slate-800 p-2 font-semibold">
                      {item.actualValue || 'Chưa cập nhật'}
                    </td>
                    <td className="border border-slate-800 p-2 text-[10px]">
                      {item.actualProofDescription || item.expectedProof || 'Chưa có'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section II: Year-end Self-Evaluation & Department Opinion */}
          {registration.selfEvaluation && (
            <div className="mb-6 space-y-2">
              <div className="font-bold uppercase text-xs">II. KẾT QUẢ TỰ ĐÁNH GIÁ CUỐI NĂM:</div>
              <div className="p-3 border border-slate-400 rounded-lg text-xs space-y-1">
                <div>
                  • Cá nhân tự xếp loại chất lượng:{' '}
                  <strong>{registration.selfEvaluation.selfProposedRating}</strong>
                </div>
                <div>
                  • Đề nghị danh hiệu thi đua:{' '}
                  <strong>{registration.selfEvaluation.selfProposedTitle}</strong>
                </div>
                {registration.selfEvaluation.selfProposedAward && (
                  <div>
                    • Đề nghị khen thưởng:{' '}
                    <strong>{registration.selfEvaluation.selfProposedAward}</strong>
                  </div>
                )}
                {registration.selfEvaluation.summarySelfReport && (
                  <div className="italic mt-1">
                    " {registration.selfEvaluation.summarySelfReport} "
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section III: Department & Board Results if any */}
          {registration.officialRecognition?.isPublished && (
            <div className="mb-6 space-y-2">
              <div className="font-bold uppercase text-xs text-amber-900">
                III. QUYẾT ĐỊNH KHEN THƯỞNG CHÍNH THỨC:
              </div>
              <div className="p-3 border border-amber-500 rounded-lg bg-amber-50/30 text-xs">
                <div>
                  Quyết định số: <strong>{registration.officialRecognition.decisionNumber}</strong>, ban hành ngày {registration.officialRecognition.decisionDate} bởi {registration.officialRecognition.issuingAuthority}.
                </div>
                <div className="font-bold mt-1">
                  Đạt danh hiệu: {registration.officialRecognition.recognizedTitle} – Xếp loại: {registration.officialRecognition.recognizedDutyRating}
                </div>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center pt-8 text-xs font-bold gap-4">
            <div>
              <div className="uppercase">NGƯỜI ĐĂNG KÝ</div>
              <div className="text-[10px] font-normal italic">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="uppercase">{registration.personnelName}</div>
            </div>

            <div>
              <div className="uppercase">TỔ TRƯỞNG CHUYÊN MÔN</div>
              <div className="text-[10px] font-normal italic">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="text-[11px] text-slate-500">
                {registration.departmentRecommendation?.reviewerName || '(Đã ký số duyệt)'}
              </div>
            </div>

            <div>
              <div className="uppercase">HIỆU TRƯỞNG</div>
              <div className="text-[10px] font-normal italic">(Ký, đóng dấu)</div>
              <div className="h-16"></div>
              <div className="text-[11px] text-slate-500">
                {registration.status === 'approved' ? 'Tô Minh Chí' : '(Ban Giám hiệu)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
