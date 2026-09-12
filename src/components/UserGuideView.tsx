import React from 'react';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Award,
  Calendar,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-700" />
          Hướng dẫn sử dụng & Quy chế thi đua năm học 2026–2027
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tài liệu hướng dẫn nghiệp vụ và vận hành hệ thống thi đua – khen thưởng Trường THPT Đắk Song, tỉnh Lâm Đồng
        </p>
      </div>

      {/* Section 1: Legal Basis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-700" />
          1. Căn cứ pháp lý thi đua khen thưởng ngành Giáo dục
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Hệ thống được thiết kế và vận hành tuân thủ nghiêm ngặt các văn bản quy phạm pháp luật hiện hành:
        </p>
        <ul className="text-xs space-y-2 text-slate-700">
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong>Luật Thi đua, khen thưởng số 06/2022/QH15:</strong> Quốc hội ban hành ngày 15/06/2022, có hiệu lực từ ngày 01/01/2024. Quy định nguyên tắc tự nguyện, dân chủ, công khai, chính xác và kịp thời.
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong>Nghị định số 98/2023/NĐ-CP:</strong> Chính phủ ban hành ngày 31/12/2023 quy định chi tiết thi hành một số điều của Luật Thi đua, khen thưởng.
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong>Thông tư số 29/2023/TT-BGDĐT:</strong> Bộ Giáo dục và Đào tạo ban hành ngày 29/12/2023 quy định chi tiết thi hành công tác thi đua, khen thưởng trong ngành Giáo dục.
          </li>
          <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong>Nghị định số 90/2020/NĐ-CP & 48/2023/NĐ-CP:</strong> Quy định về đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức.
          </li>
        </ul>
      </div>

      {/* Section 2: Roles Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-700" />
          2. Phân quyền và trách nhiệm của các vai trò (RBAC)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <h4 className="font-bold text-blue-900 mb-1">👨‍🏫 Cá nhân (CBQL, Giáo viên, Nhân viên)</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Đăng ký chỉ tiêu, danh hiệu và hình thức khen thưởng đầu năm.</li>
              <li>Cập nhật tiến độ thực hiện và hồ sơ minh chứng trong suốt năm học.</li>
              <li>Thực hiện bản tự đánh giá cuối năm học.</li>
              <li>Tra cứu tiến độ thi đua toàn trường và tra cứu hồ sơ cá nhân.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
            <h4 className="font-bold text-indigo-900 mb-1">📋 Tổ trưởng / Tổ phó chuyên môn</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Xem và thẩm định hồ sơ đăng ký của các thành viên trong tổ.</li>
              <li>Ghi nhận xét riêng không ghi đè vào nội dung của viên chức.</li>
              <li>Họp tổ bình bầu và gửi văn bản đề xuất lên Ban Giám hiệu.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <h4 className="font-bold text-amber-900 mb-1">🏫 Ban Giám hiệu (Hiệu trưởng, Phó Hiệu trưởng)</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Phê duyệt hoặc yêu cầu bổ sung chỉ tiêu thi đua toàn trường.</li>
              <li>Chủ trì Hội đồng Thi đua – Khen thưởng trường xét duyệt cuối năm.</li>
              <li>Nhập Số quyết định, Ngày quyết định và công bố kết quả khen thưởng.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <h4 className="font-bold text-rose-900 mb-1">👑 Quản trị viên kỹ thuật (Admin)</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Quản trị 64 hồ sơ nhân sự, xử lý trùng CCCD (STT 57 và 58).</li>
              <li>Đặt lại mật khẩu mặc định (Ds@123), mở khóa tài khoản.</li>
              <li>Cấu hình năm học, thời hạn, danh mục tiêu chuẩn và sao lưu dữ liệu.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Data Safety & Privacy */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          3. Nguyên tắc bảo mật danh tính & an toàn dữ liệu
        </h3>
        <ul className="text-xs space-y-2 text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Bảo mật số CCCD:</strong> Số CCCD chỉ được hiển thị đầy đủ trong tài khoản Quản trị viên phục vụ đối soát và trong màn hình cá nhân của chính viên chức đó. Trên toàn bộ các bảng tra cứu công khai và danh sách toàn trường, số CCCD được che mặt nạ bảo mật (VD: <code>040***3624</code>).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Bắt buộc đổi mật khẩu lần đầu:</strong> Tài khoản khởi tạo mặc định bằng <code>Ds@123</code>. Ở lần đăng nhập đầu tiên, hệ thống bắt buộc viên chức phải đổi sang mật khẩu riêng để bảo vệ quyền lợi cá nhân.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Phòng chống dò mật khẩu (Brute-force):</strong> Sau 5 lần nhập sai mật khẩu liên tiếp, tài khoản tự động bị khóa an toàn. Quản trị viên có thẩm quyền mở khóa hoặc đặt lại mật khẩu.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Minh chứng bảo mật:</strong> Đối với minh chứng có chứa thông tin riêng tư của học sinh hoặc tài liệu nội bộ, viên chức có thể chọn gắn nhãn <em>"Minh chứng bảo mật"</em> để chỉ BGH và Tổ trưởng mới được phép truy cập xem chi tiết.
            </span>
          </li>
        </ul>
      </div>

      {/* Section 4: Testing & Verification Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600" />
          4. Hướng dẫn kiểm thử 14 kịch bản nghiệm thu (Acceptance Tests)
        </h3>
        <p className="text-xs text-slate-600">
          Người dùng và ban giám sát có thể kiểm tra thực tế 14 kịch bản nghiệp vụ trực tiếp trên hệ thống:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC01:</strong> Đăng nhập bằng CCCD có số 0 ở đầu (VD: Tô Minh Chí <code>040084000163</code>).
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC02:</strong> Bắt buộc đổi mật khẩu khi đăng nhập bằng <code>Ds@123</code> lần đầu.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC03:</strong> Chặn đăng nhập đối với tài khoản trùng CCCD tại STT 57 và 58.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC04:</strong> Khóa tài khoản sau 5 lần nhập sai mật khẩu liên tiếp.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC05:</strong> Đăng ký chỉ tiêu đầu năm (Lao động tiên tiến, CSTĐ cơ sở).
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC06:</strong> Nộp hồ sơ và tạo phiên bản lịch sử (Version tracking).
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC07:</strong> Khóa không cho sửa trực tiếp khi hồ sơ đã duyệt/khóa.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC08:</strong> Cập nhật kết quả thực hiện và đính kèm đường link minh chứng.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC09:</strong> Tự đánh giá cuối năm và in phiếu đánh giá chuẩn quy định.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC10:</strong> Tổ trưởng nhận xét và lưu vào trường thẩm định riêng biệt.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC11:</strong> BGH phê duyệt hoặc yêu cầu bổ sung kèm lý do kiểm toán.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC12:</strong> BGH ban hành số quyết định, ngày ban hành và công bố.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC13:</strong> Tra cứu toàn trường hiển thị thông tin đã được làm sạch CCCD.
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong>TC14:</strong> Quản trị viên cập nhật CCCD cho STT 57/58 và kích hoạt tài khoản.
          </div>
        </div>
      </div>
    </div>
  );
};
