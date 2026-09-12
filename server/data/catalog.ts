import { CriterionTemplate, LegalCitation, EmulationTitleConfig, SchoolYearConfig } from '../../src/types.ts';

export const DEFAULT_SCHOOL_YEAR: SchoolYearConfig = {
  year: '2026-2027',
  registrationDeadline: '2026-10-15',
  supplementDeadline: '2026-10-31',
  evaluationDeadline: '2027-05-25',
  status: 'active',
  allowRegistrationEdit: true,
  allowResultUpdate: true
};

export const DEFAULT_LEGAL_CITATIONS: LegalCitation[] = [
  {
    id: 'LEG_01',
    title: 'Luật Thi đua, khen thưởng năm 2022',
    docNumber: '06/2022/QH15',
    issueDate: '15/06/2022',
    effectiveDate: '01/01/2024',
    issuingAuthority: 'Quốc hội khóa XV',
    relevantArticles: 'Điều 19, 21, 22, 23, 24, 72, 74',
    sourceUrl: 'https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Luat-Thi-dua-khen-thuong-2022-297800.aspx',
    verificationStatus: 'verified',
    notes: 'Văn bản luật cao nhất hiện hành quy định về nguyên tắc, danh hiệu thi đua, hình thức khen thưởng'
  },
  {
    id: 'LEG_02',
    title: 'Nghị định quy định chi tiết thi hành Luật Thi đua, khen thưởng',
    docNumber: '98/2023/NĐ-CP',
    issueDate: '31/12/2023',
    effectiveDate: '01/01/2024',
    issuingAuthority: 'Chính phủ',
    relevantArticles: 'Điều 5, 8, 9, 10, 11',
    sourceUrl: 'https://vanban.chinhphu.vn/?pageid=27160&docid=209355',
    verificationStatus: 'verified',
    notes: 'Quy định chi tiết tiêu chuẩn, trình tự, thủ tục xét tặng danh hiệu và khen thưởng'
  },
  {
    id: 'LEG_03',
    title: 'Thông tư quy định chi tiết thi đua, khen thưởng ngành Giáo dục',
    docNumber: '29/2023/TT-BGDĐT',
    issueDate: '29/12/2023',
    effectiveDate: '15/02/2024',
    issuingAuthority: 'Bộ Giáo dục và Đào tạo',
    relevantArticles: 'Điều 4, 5, 6, 7, 8, 9, 10',
    sourceUrl: 'https://moet.gov.vn/van-ban/van-ban-moi/Pages/chi-tiet-van-ban.aspx?ItemID=4519',
    verificationStatus: 'verified',
    notes: 'Áp dụng cho các cơ sở giáo dục mầm non, phổ thông, GDTX trên toàn quốc'
  },
  {
    id: 'LEG_04',
    title: 'Nghị định đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức',
    docNumber: '90/2020/NĐ-CP & 48/2023/NĐ-CP',
    issueDate: '13/08/2020 & 17/07/2023',
    effectiveDate: '01/08/2020 & 15/09/2023',
    issuingAuthority: 'Chính phủ',
    relevantArticles: 'Điều 12, 13, 14, 15',
    sourceUrl: 'https://vanban.chinhphu.vn/',
    verificationStatus: 'verified',
    notes: 'Khung đánh giá hoàn thành xuất sắc / tốt / hoàn thành / không hoàn thành nhiệm vụ'
  },
  {
    id: 'LEG_05',
    title: 'Hướng dẫn công tác Thi đua - Khen thưởng Ngành GD&ĐT Lâm Đồng năm học 2026-2027',
    docNumber: 'HD-SGDĐT/TĐKT-2026',
    issueDate: 'Chờ xác minh',
    effectiveDate: 'Năm học 2026-2027',
    issuingAuthority: 'Sở GD&ĐT tỉnh Lâm Đồng',
    relevantArticles: 'Quy định phân bổ chỉ tiêu và thẩm quyền',
    sourceUrl: 'Cổng thông tin Sở GD&ĐT Lâm Đồng (http://lamdong.edu.vn)',
    verificationStatus: 'pending_verification',
    notes: 'Đang chờ hướng dẫn cụ thể theo niên độ 2026-2027 từ Sở GD&ĐT tỉnh Lâm Đồng'
  }
];

export const DEFAULT_TITLE_CONFIGS: EmulationTitleConfig[] = [
  {
    id: 'TITLE_01',
    name: 'Lao động tiên tiến',
    type: 'emulation_title',
    legalCitationId: 'LEG_01',
    criteriaSummary: 'Hoàn thành tốt nhiệm vụ trở lên; chấp hành tốt chủ trương chính sách, nội quy; có tinh thần tự lực tự cường, đoàn kết',
    applicableScope: 'Toàn thể CBQL, giáo viên, nhân viên',
    approvalAuthority: 'Hiệu trưởng Trường THPT Đắk Song',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'TITLE_02',
    name: 'Chiến sĩ thi đua cơ sở',
    type: 'emulation_title',
    legalCitationId: 'LEG_01',
    criteriaSummary: 'Đạt danh hiệu "Lao động tiên tiến" và có sáng kiến kinh nghiệm được cấp thẩm quyền công nhận hiệu quả áp dụng, hoặc có đề tài NCKH, GV dạy giỏi / GVCN giỏi / GV bồi dưỡng HSG đạt giải',
    applicableScope: 'Toàn thể CBQL, giáo viên, nhân viên',
    approvalAuthority: 'Giám đốc Sở GD&ĐT tỉnh Lâm Đồng',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'TITLE_03',
    name: 'Chiến sĩ thi đua cấp Tỉnh',
    type: 'emulation_title',
    legalCitationId: 'LEG_01',
    criteriaSummary: 'Có 03 lần liên tục đạt danh hiệu CSTĐ cơ sở và có sáng kiến / đề tài NCKH được Hội đồng cấp tỉnh công nhận',
    applicableScope: 'Toàn thể CBQL, giáo viên',
    approvalAuthority: 'Chủ tịch UBND tỉnh Lâm Đồng',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'DUTY_01',
    name: 'Hoàn thành xuất sắc nhiệm vụ',
    type: 'duty_rating',
    legalCitationId: 'LEG_04',
    criteriaSummary: 'Đạt 100% chỉ tiêu theo kế hoạch với chất lượng, hiệu quả cao, có sáng kiến đổi mới được áp dụng hiệu quả',
    applicableScope: 'Viên chức giáo dục',
    approvalAuthority: 'Hiệu trưởng / Giám đốc Sở GD&ĐT',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'DUTY_02',
    name: 'Hoàn thành tốt nhiệm vụ',
    type: 'duty_rating',
    legalCitationId: 'LEG_04',
    criteriaSummary: 'Hoàn thành 100% nhiệm vụ theo kế hoạch đảm bảo tiến độ và chất lượng',
    applicableScope: 'Viên chức giáo dục',
    approvalAuthority: 'Hiệu trưởng / Giám đốc Sở GD&ĐT',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'DUTY_03',
    name: 'Hoàn thành nhiệm vụ',
    type: 'duty_rating',
    legalCitationId: 'LEG_04',
    criteriaSummary: 'Hoàn thành các nhiệm vụ được giao, có tối đa không quá 20% tiêu chí chưa đảm bảo tiến độ',
    applicableScope: 'Viên chức giáo dục',
    approvalAuthority: 'Hiệu trưởng',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'AWARD_01',
    name: 'Giấy khen của Hiệu trưởng',
    type: 'award',
    legalCitationId: 'LEG_01',
    criteriaSummary: 'Khen thưởng cá nhân hoàn thành tốt nhiệm vụ, tích cực tham gia các phong trào thi đua của trường',
    applicableScope: 'CBQL, GV, NV trường THPT Đắk Song',
    approvalAuthority: 'Hiệu trưởng Trường THPT Đắk Song',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'AWARD_02',
    name: 'Giấy khen của Giám đốc Sở GD&ĐT',
    type: 'award',
    legalCitationId: 'LEG_03',
    criteriaSummary: 'Hoàn thành xuất sắc nhiệm vụ, có thành tích tiêu biểu xuất sắc trong công tác dạy học hoặc bồi dưỡng học sinh',
    applicableScope: 'CBQL, GV, NV ngành Giáo dục tỉnh Lâm Đồng',
    approvalAuthority: 'Giám đốc Sở GD&ĐT tỉnh Lâm Đồng',
    isActive: true,
    verificationStatus: 'verified'
  },
  {
    id: 'AWARD_03',
    name: 'Bằng khen của Chủ tịch UBND Tỉnh',
    type: 'award',
    legalCitationId: 'LEG_01',
    criteriaSummary: 'Có 02 năm liên tục hoàn thành xuất sắc nhiệm vụ và trong thời gian đó có 02 sáng kiến được công nhận',
    applicableScope: 'CBQL, GV, NV',
    approvalAuthority: 'Chủ tịch UBND tỉnh Lâm Đồng',
    isActive: true,
    verificationStatus: 'verified'
  }
];

export const DEFAULT_CRITERIA_TEMPLATES: CriterionTemplate[] = [
  // --- a) Nhóm chung (7 tiêu chuẩn) ---
  {
    id: 'CRIT_CHUNG_01',
    category: 'chung',
    title: 'Thực hiện nhiệm vụ được giao',
    description: 'Chấp hành nghiêm túc sự phân công công tác của Lãnh đạo trường; đảm bảo tiến độ, chất lượng và hiệu quả công việc.',
    unitAndMethod: 'Đánh giá mức độ hoàn thành theo tiến độ và chất lượng sản phẩm công tác',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: '100% nhiệm vụ đúng hạn và đạt chất lượng tốt',
    expectedProofSuggestion: 'Kế hoạch công tác cá nhân, biên bản giao ban, bảng tổng kết nhiệm vụ',
    isMandatory: true
  },
  {
    id: 'CRIT_CHUNG_02',
    category: 'chung',
    title: 'Chấp hành nội quy, quy chế và kỷ luật lao động',
    description: 'Nghiêm túc thực hiện ngày giờ công, quy chế văn hóa công sở, không vi phạm các điều cấm của viên chức.',
    unitAndMethod: 'Số lần vi phạm kỷ luật / ngày giờ công (Càng thấp càng tốt)',
    targetType: 'quantitative',
    targetDirection: 'lower_better',
    defaultTargetValue: '0',
    expectedProofSuggestion: 'Sổ theo dõi nền nếp, bảng chấm công, báo cáo tổ',
    isMandatory: true
  },
  {
    id: 'CRIT_CHUNG_03',
    category: 'chung',
    title: 'Đạo đức nghề nghiệp, văn hóa ứng xử, trách nhiệm phối hợp',
    description: 'Gương mẫu, tận tụy, tôn trọng đồng nghiệp và phụ huynh; có tinh thần đoàn kết nội bộ và trách nhiệm phối hợp liên tổ.',
    unitAndMethod: 'Nhận xét tập thể tổ chuyên môn và đánh giá chuẩn đạo đức viên chức',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Tốt, không để xảy ra phản ánh tiêu cực',
    expectedProofSuggestion: 'Biên bản đánh giá chuẩn nghề nghiệp, ý kiến phản hồi phụ huynh/học sinh',
    isMandatory: true
  },
  {
    id: 'CRIT_CHUNG_04',
    category: 'chung',
    title: 'Thực hiện chuẩn mực nhà giáo trường THPT Đắk Song',
    description: 'Tác phong mô phạm, trang phục chỉnh tề, giữ gìn uy tín danh dự nhà giáo và thương hiệu Trường THPT Đắk Song.',
    unitAndMethod: 'Thực hiện theo bộ quy tắc ứng xử học đường của nhà trường',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Đạt chuẩn mực nhà giáo gương mẫu',
    expectedProofSuggestion: 'Biên bản bình bầu tổ, phiếu khảo sát nền nếp sư phạm',
    isMandatory: true
  },
  {
    id: 'CRIT_CHUNG_05',
    category: 'chung',
    title: 'Học tập, bồi dưỡng và tự phát triển',
    description: 'Tham gia đầy đủ các lớp tập huấn GDPT 2018, bồi dưỡng thường xuyên; chủ động tự học nâng cao trình độ chuyên môn.',
    unitAndMethod: 'Số tiết/mô đun bồi dưỡng hoàn thành (Càng cao càng tốt)',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: '100% các mô đun BDTX đạt yêu cầu',
    expectedProofSuggestion: 'Chứng chỉ/giấy xác nhận hoàn thành tập huấn BDTX, mô đun trên hệ thống TEMIS',
    isMandatory: true
  },
  {
    id: 'CRIT_CHUNG_06',
    category: 'chung',
    title: 'Ứng dụng công nghệ, chuyển đổi số, sử dụng AI phù hợp',
    description: 'Ứng dụng công nghệ thông tin trong dạy học, quản lý hồ sơ điện tử và khai thác công cụ AI có trách nhiệm, hiệu quả.',
    unitAndMethod: 'Số sản phẩm ứng dụng CNTT / bài giảng điện tử / học liệu số',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: 'Tối thiểu 02 bài giảng điện tử hoặc giải pháp chuyển đổi số',
    expectedProofSuggestion: 'Kế hoạch bài dạy có ứng dụng CNTT/AI, link bài giảng LMS, bài thuyết trình số',
    isMandatory: true
  },
  {
    id: 'CRIT_CHUNG_07',
    category: 'chung',
    title: 'Tham gia phong trào và xây dựng môi trường giáo dục an toàn',
    description: 'Tích cực tham gia các phong trào do Công đoàn, Đoàn trường phát động; phòng chống bạo lực học đường, an toàn giao thông.',
    unitAndMethod: 'Số hoạt động/phong trào tham gia tích cực',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Tham gia 100% các hoạt động phong trào chung',
    expectedProofSuggestion: 'Giấy chứng nhận, hình ảnh hoạt động, biên bản công đoàn',
    isMandatory: true
  },

  // --- b) Đối với giáo viên (8 tiêu chuẩn) ---
  {
    id: 'CRIT_GV_01',
    category: 'giao_vien',
    title: 'Thực hiện kế hoạch dạy học, kiểm tra và đánh giá',
    description: 'Dạy đủ số tiết theo thời khóa biểu; thực hiện đúng ma trận đề kiểm tra định kỳ, nhập điểm vnEdu đúng hạn.',
    unitAndMethod: 'Tiến độ phân phối chương trình và nộp điểm trên vnEdu',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Đúng 100% tiến độ chương trình, không dạy dồn dạy ép',
    expectedProofSuggestion: 'Sổ ghi đầu bài điện tử, sổ điểm cá nhân vnEdu',
    isMandatory: true
  },
  {
    id: 'CRIT_GV_02',
    category: 'giao_vien',
    title: 'Thực hiện nề nếp chuyên môn',
    description: 'Lên lịch báo giảng đúng hạn, nộp kế hoạch bài dạy trước khi lên lớp, ký sổ đầu bài đầy đủ, tham gia sinh hoạt tổ và họp hội đồng.',
    unitAndMethod: 'Số lần trễ lịch báo giảng, kế hoạch bài dạy, sổ đầu bài (Càng thấp càng tốt)',
    targetType: 'quantitative',
    targetDirection: 'lower_better',
    defaultTargetValue: '0',
    expectedProofSuggestion: 'Lịch báo giảng trên hệ thống, xác nhận kiểm tra hồ sơ của Tổ trưởng CM',
    isMandatory: true
  },
  {
    id: 'CRIT_GV_03',
    category: 'giao_vien',
    title: 'Chất lượng giảng dạy theo môn, lớp được giao',
    description: 'Tỷ lệ học sinh đạt điểm trung bình môn trở lên, tỷ lệ học sinh khá giỏi môn học phụ trách đạt hoặc vượt chỉ tiêu nhà trường.',
    unitAndMethod: 'Tỷ lệ % học sinh đạt kết quả từ Đạt/Khá/Tốt trở lên',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: '≥ 95% học sinh đạt yêu cầu môn học',
    expectedProofSuggestion: 'Bảng thống kê chất lượng bộ môn học kỳ và cuối năm',
    isMandatory: true
  },
  {
    id: 'CRIT_GV_04',
    category: 'giao_vien',
    title: 'Đổi mới phương pháp, phát triển phẩm chất và năng lực học sinh',
    description: 'Áp dụng các kỹ thuật dạy học tích cực, dạy học dự án, tổ chức lớp học linh hoạt theo định hướng phát triển phẩm chất, năng lực.',
    unitAndMethod: 'Số tiết dạy đổi mới phương pháp được tổ chuyên môn dự giờ đánh giá',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: 'Tối thiểu 02 tiết dạy chuyên đề đổi mới / năm',
    expectedProofSuggestion: 'Biên bản dự giờ, phiếu đánh giá tiết dạy của tổ chuyên môn',
    isMandatory: true
  },
  {
    id: 'CRIT_GV_05',
    category: 'giao_vien',
    title: 'Phụ đạo học sinh, bồi dưỡng học sinh giỏi, ôn thi tốt nghiệp',
    description: 'Tham gia phụ đạo học sinh có nguy cơ lưu ban; bồi dưỡng đội tuyển HSG hoặc ôn thi TN THPT đạt kết quả tốt nếu được phân công.',
    unitAndMethod: 'Số buổi phụ đạo / kết quả thi học sinh giỏi / tỷ lệ đỗ tốt nghiệp môn dạy',
    targetType: 'qualitative',
    targetDirection: 'higher_better',
    defaultTargetValue: 'Không có học sinh lưu ban vì điểm môn phụ trách; đạt giải HSG cấp trường/tỉnh (nếu có đội tuyển)',
    expectedProofSuggestion: 'Danh sách và sổ theo dõi phụ đạo/bồi dưỡng, quyết định công nhận giải HSG',
    isMandatory: false
  },
  {
    id: 'CRIT_GV_06',
    category: 'giao_vien',
    title: 'Sinh hoạt chuyên môn, nghiên cứu bài học, phát triển học liệu',
    description: 'Tham gia đầy đủ các buổi sinh hoạt tổ/nhóm theo hướng nghiên cứu bài học; đóng góp chia sẻ học liệu câu hỏi trắc nghiệm, đề kiểm tra.',
    unitAndMethod: 'Số buổi sinh hoạt CM tham gia và số chuyên đề thực hiện',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: 'Tham gia 100% số buổi sinh hoạt tổ CM; đóng góp 01 chuyên đề',
    expectedProofSuggestion: 'Biên bản họp tổ CM, sản phẩm ngân hàng câu hỏi trên kho học liệu số',
    isMandatory: true
  },
  {
    id: 'CRIT_GV_07',
    category: 'giao_vien',
    title: 'STEM/STEAM, nghiên cứu khoa học hoặc sáng kiến',
    description: 'Xây dựng ít nhất 01 chủ đề dạy học STEM/STEAM hoặc hướng dẫn học sinh NCKH kỹ thuật hoặc viết sáng kiến kinh nghiệm hiệu quả.',
    unitAndMethod: 'Số chủ đề STEM thực hiện hoặc sáng kiến kinh nghiệm được công nhận',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: '01 chủ đề STEM và 01 sáng kiến cấp trường/ngành',
    expectedProofSuggestion: 'Kế hoạch bài dạy STEM, quyết định công nhận SKKN hoặc giải KHKT',
    isMandatory: false
  },
  {
    id: 'CRIT_GV_08',
    category: 'giao_vien',
    title: 'Chủ nhiệm lớp và công tác kiêm nhiệm nếu có',
    description: 'Thực hiện tốt công tác chủ nhiệm: quản lý sĩ số, liên lạc chặt chẽ với cha mẹ học sinh, tổ chức sinh hoạt lớp, giáo dục kỹ năng sống.',
    unitAndMethod: 'Xếp loại thi đua của lớp chủ nhiệm (Nhất, Nhì, Ba, Khá...) hoặc hoàn thành nhiệm vụ kiêm nhiệm',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Lớp đạt danh hiệu Lớp Tiên tiến trở lên; không có HS vi phạm pháp luật',
    expectedProofSuggestion: 'Sổ chủ nhiệm, biên bản họp CMHS 3 lần/năm, bảng tổng kết thi đua lớp',
    isMandatory: false
  },

  // --- c) Đối với cán bộ quản lý (5 tiêu chuẩn) ---
  {
    id: 'CRIT_CBQL_01',
    category: 'can_bo_quan_ly',
    title: 'Thực hiện kế hoạch và nhiệm vụ quản lý được phân công',
    description: 'Chỉ đạo, điều hành các hoạt động thuộc mảng phụ trách đạt mục tiêu kế hoạch năm học đã được phê duyệt.',
    unitAndMethod: 'Tiến độ và kết quả thực hiện kế hoạch năm học của trường/mảng phụ trách',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Hoàn thành xuất sắc 100% nhiệm vụ chỉ đạo điều hành',
    expectedProofSuggestion: 'Kế hoạch năm học, báo cáo sơ kết học kỳ và tổng kết năm học',
    isMandatory: true,
    applicablePositions: ['Hiệu trưởng', 'Phó hiệu trưởng']
  },
  {
    id: 'CRIT_CBQL_02',
    category: 'can_bo_quan_ly',
    title: 'Nâng cao chất lượng giáo dục, phát triển đội ngũ',
    description: 'Xây dựng kế hoạch đào tạo bồi dưỡng giáo viên, duy trì và nâng cao chất lượng đại trà và chất lượng mũi nhọn của trường.',
    unitAndMethod: 'Tỷ lệ tốt nghiệp THPT toàn trường, số giải HSG tỉnh, tỷ lệ GV đạt chuẩn',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: 'Tỷ lệ tốt nghiệp THPT ≥ 98%; chất lượng mũi nhọn tăng trưởng',
    expectedProofSuggestion: 'Báo cáo thống kê kết quả thi tốt nghiệp, thi HSG cấp tỉnh',
    isMandatory: true,
    applicablePositions: ['Hiệu trưởng', 'Phó hiệu trưởng']
  },
  {
    id: 'CRIT_CBQL_03',
    category: 'can_bo_quan_ly',
    title: 'Kiểm tra nội bộ, cải cách hành chính, chuyển đổi số',
    description: 'Thực hiện nghiêm túc kế hoạch kiểm tra nội bộ, cải cách thủ tục hành chính, số hóa hồ sơ sổ sách và quản trị trường học thông minh.',
    unitAndMethod: 'Số cuộc kiểm tra nội bộ hoàn thành và tỷ lệ số hóa thủ tục',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: '100% kế hoạch kiểm tra nội bộ được thực hiện đúng quy trình',
    expectedProofSuggestion: 'Biên bản kiểm tra nội bộ, hồ sơ kết luận kiểm tra, báo cáo chuyển đổi số',
    isMandatory: true,
    applicablePositions: ['Hiệu trưởng', 'Phó hiệu trưởng']
  },
  {
    id: 'CRIT_CBQL_04',
    category: 'can_bo_quan_ly',
    title: 'Quản lý cơ sở vật chất, tài chính, tài sản trong phạm vi phụ trách',
    description: 'Quản lý thu chi ngân sách công khai, minh bạch, đúng luật; bảo quản và khai thác hiệu quả cơ sở vật chất, trang thiết bị trường học.',
    unitAndMethod: 'Biên bản kiểm kê tài sản và báo cáo quyết toán tài chính công khai',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Công khai, minh bạch, không để xảy ra thất thoát, lãng phí',
    expectedProofSuggestion: 'Biên bản công khai tài chính, biên bản kiểm kê tài sản cuối năm',
    isMandatory: true,
    applicablePositions: ['Hiệu trưởng', 'Phó hiệu trưởng']
  },
  {
    id: 'CRIT_CBQL_05',
    category: 'can_bo_quan_ly',
    title: 'Phối hợp công tác và thực hiện trách nhiệm giải trình',
    description: 'Chủ động phối hợp với cấp ủy, chính quyền địa phương, các ban ngành và Ban đại diện CMHS; thực hiện đầy đủ quy chế dân chủ.',
    unitAndMethod: 'Số hội nghị tiếp xúc, đối thoại và giải quyết thỏa đáng kiến nghị',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Thực hiện tốt quy chế dân chủ ở cơ sở, giải quyết kịp thời 100% phản ánh',
    expectedProofSuggestion: 'Biên bản hội nghị viên chức, biên bản họp Ban đại diện CMHS',
    isMandatory: true,
    applicablePositions: ['Hiệu trưởng', 'Phó hiệu trưởng']
  },

  // --- d) Đối với nhân viên (5 tiêu chuẩn) ---
  {
    id: 'CRIT_NV_01',
    category: 'nhan_vien',
    title: 'Tiến độ, chất lượng công việc chuyên môn',
    description: 'Hoàn thành các nhiệm vụ theo vị trí việc làm (Kế toán, Văn thư, Thiết bị, Y tế, Thư viện) kịp thời, chính xác, không để tồn đọng.',
    unitAndMethod: 'Tỷ lệ hoàn thành nhiệm vụ theo quy chế vị trí việc làm',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: '100% công việc xử lý đúng hạn, không để tồn đọng hồ sơ',
    expectedProofSuggestion: 'Sổ giao nhận công văn, chứng từ thanh toán, sổ mượn thiết bị/sách',
    isMandatory: true
  },
  {
    id: 'CRIT_NV_02',
    category: 'nhan_vien',
    title: 'Hồ sơ, sổ sách, báo cáo nghiệp vụ',
    description: 'Thiết lập, lưu trữ và cập nhật hồ sơ, sổ sách nghiệp vụ khoa học, ngăn nắp; báo cáo số liệu trung thực, đúng hạn quy định.',
    unitAndMethod: 'Số lần trễ hạn nộp báo cáo định kỳ (Càng thấp càng tốt)',
    targetType: 'quantitative',
    targetDirection: 'lower_better',
    defaultTargetValue: '0',
    expectedProofSuggestion: 'Hồ sơ lưu trữ theo danh mục, biên nhận gửi báo cáo cấp trên',
    isMandatory: true
  },
  {
    id: 'CRIT_NV_03',
    category: 'nhan_vien',
    title: 'Chất lượng phục vụ hoạt động giáo dục',
    description: 'Phục vụ tận tình, chu đáo giáo viên và học sinh trong công tác mượn trả sách, chuẩn bị thiết bị thí nghiệm, chăm sóc sức khỏe y tế.',
    unitAndMethod: 'Khảo sát mức độ hài lòng của giáo viên và học sinh đối với công tác phục vụ',
    targetType: 'qualitative',
    targetDirection: 'binary',
    defaultTargetValue: 'Đạt phản hồi tốt, không có khiếu nại về thái độ phục vụ',
    expectedProofSuggestion: 'Phiếu lấy ý kiến giáo viên/học sinh, nhật ký phục vụ phòng học bộ môn',
    isMandatory: true
  },
  {
    id: 'CRIT_NV_04',
    category: 'nhan_vien',
    title: 'Bảo quản, quản lý tài sản hoặc dữ liệu được giao',
    description: 'Thường xuyên kiểm kê, bảo quản tốt tài sản, thuốc men, sách báo, thiết bị thí nghiệm, chứng từ tài chính; phòng chống cháy nổ.',
    unitAndMethod: 'Tỷ lệ hao hụt / thất thoát tài sản ngoài quy định (Càng thấp càng tốt)',
    targetType: 'quantitative',
    targetDirection: 'lower_better',
    defaultTargetValue: '0%',
    expectedProofSuggestion: 'Biên bản kiểm kê định kỳ, sổ tài sản, phiếu xuất nhập kho',
    isMandatory: true
  },
  {
    id: 'CRIT_NV_05',
    category: 'nhan_vien',
    title: 'Cải tiến quy trình và ứng dụng công nghệ trong công việc',
    description: 'Đề xuất giải pháp cải tiến thủ tục hành chính, quản lý thư viện/thiết bị/văn thư điện tử bằng phần mềm chuyên dụng.',
    unitAndMethod: 'Số sáng kiến/giải pháp cải tiến quy trình công việc trong năm',
    targetType: 'quantitative',
    targetDirection: 'higher_better',
    defaultTargetValue: 'Ít nhất 01 giải pháp cải tiến hiệu quả công việc',
    expectedProofSuggestion: 'Mô tả sáng kiến hoặc link hệ thống quản lý số áp dụng thực tế',
    isMandatory: false
  }
];
