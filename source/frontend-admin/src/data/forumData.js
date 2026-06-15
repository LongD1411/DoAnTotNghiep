export const CAT_BADGE = {
  pest:    { label: 'Sâu & Bệnh',      cls: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/20 dark:text-red-400'         },
  tips:    { label: 'Mẹo Nông Nghiệp', cls: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400' },
  general: { label: 'Chung',            cls: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400'     },
  rules:   { label: 'Quy định',         cls: 'bg-primary/10 text-[#2E7D32] ring-primary/20 dark:text-primary'                      },
};

export const FAKE_THREADS = [
  {
    id: 1, slug: '1-noi-quy-dien-dan',
    pinned: true, locked: true, catId: 'rules',
    title: 'Chào mừng đến với Diễn đàn! Vui lòng đọc nội quy trước khi đăng bài.',
    excerpt: 'Chúng tôi là cộng đồng của nông dân và chuyên gia. Vui lòng giữ thảo luận văn minh và đúng chủ đề.',
    content: [
      'Chào mừng bạn đến với Diễn đàn Nông nghiệp Xanh — nơi kết nối nông dân, kỹ sư nông nghiệp và những người yêu thích canh tác bền vững.',
      'Để cộng đồng hoạt động tốt, vui lòng đọc và tuân thủ các quy định sau: (1) Giữ thảo luận văn minh, tôn trọng lẫn nhau. (2) Chỉ đăng nội dung liên quan đến nông nghiệp, cây trồng, vật nuôi. (3) Không quảng cáo sản phẩm khi chưa được phép từ admin. (4) Đặt bài vào đúng chủ đề.',
      'Các bài vi phạm sẽ bị xoá mà không cần báo trước. Tài khoản vi phạm nhiều lần sẽ bị khoá vĩnh viễn. Cảm ơn bạn đã hợp tác!',
    ],
    author: 'Admin', initials: 'AD', avatarColor: 'bg-[#2E7D32] text-white',
    time: '1 năm trước', comments: 0, hot: false, isNew: false,
  },
  {
    id: 2, slug: '2-thuoc-tru-nam-cho-benh-moc-suong-ca-chua',
    pinned: false, locked: false, catId: 'pest',
    title: 'Thuốc trừ nấm tốt nhất cho bệnh mốc sương trên cà chua?',
    excerpt: 'Tôi thấy một số đốm đen trên lá và thân cây cà chua. Trời mưa nhiều gần đây. Ai đã dùng thành công thuốc gốc đồng mùa này chưa?',
    content: [
      'Ruộng cà chua của tôi đang có dấu hiệu bị mốc sương (Phytophthora infestans). Triệu chứng là các đốm nâu đen xuất hiện ở mép lá, sau lan rộng và làm lá héo úa. Trời mưa nhiều hơn 2 tuần nay nên bệnh lan khá nhanh.',
      'Tôi đã thử phun Ridomil Gold MZ nhưng hiệu quả không như mong đợi. Nghe nói thuốc gốc đồng (copper-based) như Bordeaux mixture hoặc Kocide có hiệu quả tốt hơn trong điều kiện mưa nhiều. Tuy nhiên tôi chưa dùng bao giờ nên không biết liều lượng và thời điểm phun hợp lý.',
      'Diện tích vườn của tôi khoảng 2 sào, hiện có khoảng 30% cây đã bị nhiễm. Mọi người có kinh nghiệm xử lý bệnh này chưa? Nên dùng loại gì, phun mấy lần và cách nhau bao lâu thì hợp lý?',
    ],
    author: 'NhaNong01', initials: 'NN', avatarColor: 'bg-indigo-100 text-indigo-700',
    time: '2 giờ trước', comments: 12, hot: false, isNew: true,
  },
  {
    id: 3, slug: '3-du-bao-gia-ngo-quy-3',
    pinned: false, locked: false, catId: 'general',
    title: 'Dự báo giá ngô quý 3 — nên giữ hay bán ngay?',
    excerpt: 'Với báo cáo thu hoạch gần đây từ các tỉnh đồng bằng, mọi người nghĩ sao về việc giữ hàng hay bán lúc này?',
    content: [
      'Vụ ngô vừa rồi nhà tôi thu được khoảng 15 tấn. Hiện tại giá ngô đang ở mức 5.200đ/kg, thấp hơn năm ngoái khoảng 8%. Tôi đang phân vân không biết nên bán ngay hay trữ lại chờ giá lên.',
      'Các báo cáo từ Bộ Nông nghiệp cho thấy sản lượng ngô cả nước tăng 12% so với cùng kỳ, trong khi nhu cầu từ các nhà máy thức ăn chăn nuôi không tăng tương ứng. Điều này có thể tạo áp lực giảm giá thêm trong ngắn hạn.',
      'Ngược lại, nếu El Niño tiếp tục ảnh hưởng đến vụ thu đông thì nguồn cung có thể giảm và giá sẽ phục hồi vào tháng 9-10. Mọi người có phân tích gì thêm không? Đặc biệt là bạn nào có kho chứa tốt và vốn dự phòng thì giữ hay bán?',
    ],
    author: 'ThanhHoa', initials: 'TH', avatarColor: 'bg-orange-100 text-orange-700',
    time: '5 giờ trước', comments: 34, hot: true, isNew: false,
  },
  {
    id: 4, slug: '4-lap-he-thong-tuoi-nho-giot-chi-phi-thap',
    pinned: false, locked: false, catId: 'tips',
    title: 'Hướng dẫn: Lắp đặt hệ thống tưới nhỏ giọt cho diện tích nhỏ',
    excerpt: 'Tôi đã tổng hợp một hướng dẫn nhỏ kèm ảnh về cách lắp hệ thống tưới của mình với chi phí dưới 5 triệu.',
    content: [
      'Sau khi thử nghiệm nhiều phương pháp, tôi đã lắp được hệ thống tưới nhỏ giọt cho 1 sào rau với tổng chi phí khoảng 4,2 triệu đồng. Hệ thống tiết kiệm nước đến 60% so với tưới phun truyền thống và tôi không cần ra vườn tưới hàng ngày nữa.',
      'Vật liệu cần chuẩn bị: đường ống chính PE 32mm (40m), ống nhỏ giọt 16mm (200m), đầu nhỏ giọt 2L/h (150 cái), bộ lọc 120mesh, van điều áp và đồng hồ đo áp. Tổng cộng mua tại cửa hàng vật tư nông nghiệp khoảng 3,8 triệu. Nhân công lắp đặt mất 1 ngày, tôi tự lắp nên tiết kiệm thêm.',
      'Lưu ý quan trọng: áp suất đầu vào cần ổn định 1-1,5 bar. Nếu dùng nước giếng cần có bơm tăng áp. Bộ lọc phải vệ sinh 2 tuần/lần để tránh tắc đầu nhỏ giọt. Tôi sẽ đăng thêm ảnh thực tế trong phần bình luận bên dưới.',
    ],
    author: 'MinhK', initials: 'MK', avatarColor: 'bg-gray-200 text-gray-600',
    time: '1 ngày trước', comments: 8, hot: false, isNew: false,
  },
  {
    id: 5, slug: '5-may-phun-thuoc-john-deere-cu-co-dang-mua',
    pinned: false, locked: false, catId: 'general',
    title: 'Máy phun thuốc cũ John Deere — có đáng mua không?',
    excerpt: 'Tìm được chiếc chạy 2000 giờ giá 18 triệu, đi kèm cần phun. Có vẻ hơi cao nhưng tình trạng tốt. Mọi người tư vấn nhé?',
    content: [
      'Tôi đang cần mua máy phun thuốc để xử lý 5 hecta lúa và rau màu. Tìm được một chiếc John Deere 4720 đã qua sử dụng, đồng hồ chạy 2.000 giờ, giá chủ yêu cầu 18 triệu đồng kèm cần phun 12m.',
      'Máy trông còn tốt, không rỉ sét nhiều, động cơ chạy êm. Tuy nhiên tôi không rành về máy móc nên không biết 2.000 giờ thì còn sử dụng được bao lâu nữa và có cần sửa chữa lớn không. Giá máy mới tương đương khoảng 35-40 triệu.',
      'Bạn nào có kinh nghiệm với dòng máy này hoặc mua đồ cũ loại này vui lòng cho ý kiến. Đặc biệt là các mục cần kiểm tra kỹ trước khi xuống tiền?',
    ],
    author: 'FarmBoy99', initials: 'FB', avatarColor: 'bg-sky-100 text-sky-700',
    time: '2 ngày trước', comments: 21, hot: false, isNew: false,
  },
  {
    id: 6, slug: '6-sau-keo-mua-thu-tren-ruong-ngo',
    pinned: false, locked: false, catId: 'pest',
    title: 'Sâu keo mùa thu xuất hiện trên ruộng ngô — xử lý thế nào?',
    excerpt: 'Ruộng nhà tôi có dấu hiệu của sâu keo mùa thu. Lá bắp bị cắn nham nhở và có phân sâu.',
    content: [
      'Ruộng ngô của tôi đang bị tấn công bởi sâu keo mùa thu (Spodoptera frugiperda). Triệu chứng rõ ràng: lá bị cắn nham nhở tạo thành "cửa sổ" trong suốt, có phân sâu màu xanh trong nõn lá. Một số cây đã bị phá hỏng nõn hoàn toàn.',
      'Ngô hiện được 25 ngày tuổi, đang ở giai đoạn 4-5 lá — đây là giai đoạn dễ bị tấn công nhất. Tôi chưa phun thuốc lần nào kể từ khi gieo.',
      'Qua nghiên cứu thì có thể dùng Spidermite, Lannate, hoặc các chế phẩm sinh học như Bt (Bacillus thuringiensis). Tuy nhiên tôi không biết loại nào hiệu quả nhất và ít ảnh hưởng đến thiên địch. Mọi người có kinh nghiệm thực tế không?',
    ],
    author: 'VanToan', initials: 'VT', avatarColor: 'bg-blue-100 text-blue-700',
    time: '3 ngày trước', comments: 6, hot: false, isNew: true,
  },
  {
    id: 7, slug: '7-u-phan-compost-tu-rom-ra',
    pinned: false, locked: false, catId: 'tips',
    title: 'Cách ủ phân compost từ rơm rạ sau thu hoạch lúa',
    excerpt: 'Sau vụ gặt, tôi thử ủ toàn bộ rơm rạ thay vì đốt. Kết quả sau 2 tháng rất tốt.',
    content: [
      'Thay vì đốt rơm rạ như trước đây (vừa ô nhiễm vừa lãng phí), tôi đã thử ủ compost từ rơm sau vụ gặt tháng trước. Kết quả sau 2 tháng vượt kỳ vọng: phân mục tơi, không mùi, màu nâu đen đẹp.',
      'Quy trình tôi làm: (1) Cắt rơm thành đoạn 10-15cm. (2) Xếp thành luống cao 1,2m, rộng 1,5m. (3) Tưới ướt đều rồi rắc chế phẩm vi sinh Trichoderma (mua tại cửa hàng VTNN, 50k/kg). (4) Phủ bạt giữ ẩm và nhiệt. (5) Sau 3-4 tuần đảo đống một lần. Tổng cộng 8 tuần là phân hoàng.',
      'Chi phí: 200kg rơm (miễn phí) + 0,5kg Trichoderma (25k) + công đảo 2 lần ≈ 1 ngày công. Được khoảng 80kg phân compost chất lượng tốt, tiết kiệm được 150k so với mua phân hữu cơ ngoài thị trường. Ai muốn hỏi thêm chi tiết cứ comment nhé!',
    ],
    author: 'LanAnh', initials: 'LA', avatarColor: 'bg-pink-100 text-pink-700',
    time: '4 ngày trước', comments: 15, hot: true, isNew: false,
  },
  {
    id: 8, slug: '8-mua-phan-bon-online-kinh-nghiem',
    pinned: false, locked: false, catId: 'general',
    title: 'Mua bán phân bón online — ai có kinh nghiệm không?',
    excerpt: 'Tôi muốn thử mua phân bón qua sàn thương mại điện tử để tiết kiệm chi phí. Có rủi ro gì không?',
    content: [
      'Giá phân bón tại đại lý địa phương của tôi cao hơn khoảng 15-20% so với giá trên các sàn TMĐT như Shopee, Lazada, Tiki. Tôi đang cân nhắc chuyển sang mua online để giảm chi phí đầu vào.',
      'Tuy nhiên tôi lo ngại về chất lượng — đặc biệt là phân giả, phân kém chất lượng. Ngoài ra còn vấn đề vận chuyển: phân bón nặng, phí ship có thể ăn hết phần tiết kiệm được. Chưa kể nếu nhận hàng sai thì đổi trả rất phức tạp.',
      'Bạn nào đã từng mua phân bón, thuốc BVTV qua mạng? Nên chọn shop nào uy tín? Có mẹo gì để kiểm tra chất lượng khi nhận hàng không? Tôi chủ yếu dùng NPK 20-20-20 và DAP, số lượng khoảng 1-2 tấn/vụ.',
    ],
    author: 'HoangMinhT', initials: 'HM', avatarColor: 'bg-violet-100 text-violet-700',
    time: '5 ngày trước', comments: 9, hot: false, isNew: false,
  },
];

export const FAKE_COMMENTS = {
  2: [
    { id: 1, author: 'ChuyenGia01', initials: 'CG', avatarColor: 'bg-green-100 text-green-700', time: '1 giờ trước', content: 'Mình đã dùng Ridomil Gold MZ nhiều năm và thấy hiệu quả tốt nhất khi phun phòng trước khi mưa. Nếu bệnh đã nặng thì nên kết hợp thêm Amistar Top 325 SC. Phun 2 lần cách nhau 7 ngày.' },
    { id: 2, author: 'NhaNong01', initials: 'NN', avatarColor: 'bg-indigo-100 text-indigo-700', time: '45 phút trước', content: 'Cảm ơn bạn! Vậy nếu trời mưa liên tục thì phun vào lúc nào? Mình lo rằng thuốc sẽ bị trôi ngay sau khi phun.' },
    { id: 3, author: 'KySuNongNghiep', initials: 'KS', avatarColor: 'bg-teal-100 text-teal-700', time: '30 phút trước', content: 'Bạn nên dùng thuốc có chất bám dính (sticker) như Silwet L-77 pha cùng. Tỷ lệ 0,1% là đủ để thuốc bám lá ngay cả khi trời mưa. Về thuốc gốc đồng: Kocide 538 WG hiệu quả và ít độc hơn, phun định kỳ 5-7 ngày/lần trong mùa mưa.' },
    { id: 4, author: 'TrangTrai01', initials: 'TT', avatarColor: 'bg-amber-100 text-amber-700', time: '20 phút trước', content: 'Mình thêm: với 30% cây đã nhiễm, nên nhổ bỏ cây bị nặng nhất và tiêu hủy trước để hạn chế lan rộng. Đừng để lá bệnh rơi xuống đất.' },
  ],
  3: [
    { id: 1, author: 'TraderNong', initials: 'TR', avatarColor: 'bg-purple-100 text-purple-700', time: '4 giờ trước', content: 'Theo mình nên bán khoảng 50% ngay bây giờ để thu hồi vốn, giữ lại 50% chờ thêm 6-8 tuần. Đừng trữ toàn bộ vì rủi ro giá xuống thêm nếu vụ đông bắc thuận lợi.' },
    { id: 2, author: 'ThanhHoa', initials: 'TH', avatarColor: 'bg-orange-100 text-orange-700', time: '3 giờ trước', content: 'Cảm ơn bạn! Mình cũng đang nghĩ đến phương án chia đôi như vậy. Vấn đề là chi phí kho bảo quản khá cao, khoảng 50-80k/tấn/tháng nên cũng ảnh hưởng đến lợi nhuận.' },
    { id: 3, author: 'PhanTichThi', initials: 'PT', avatarColor: 'bg-rose-100 text-rose-700', time: '2 giờ trước', content: 'Giá ngô thường có chu kỳ tăng vào tháng 10-11 do vụ thu đông ở miền Bắc. Nếu bạn có thể chịu được chi phí bảo quản 2 tháng thì có thể kỳ vọng giá lên 5.600-5.800đ/kg.' },
  ],
  4: [
    { id: 1, author: 'KyThuat01', initials: 'KT', avatarColor: 'bg-cyan-100 text-cyan-700', time: '20 giờ trước', content: 'Bài viết rất hay! Mình đang dự định lắp tương tự cho vườn ớt 3 sào. Bạn cho hỏi cụ thể mua vật tư ở đâu? Và với ớt thì lưu lượng 2L/h có đủ không hay cần loại 4L/h?' },
    { id: 2, author: 'MinhK', initials: 'MK', avatarColor: 'bg-gray-200 text-gray-600', time: '18 giờ trước', content: 'Mình mua tại cửa hàng Vật Tư Nông Nghiệp Xanh, đường Nguyễn Văn Cừ. Với ớt thì 2L/h là đủ nếu tưới 2 lần/ngày, mỗi lần 20 phút. Nhớ lắp thêm van solenoid nếu muốn tự động hóa hoàn toàn.' },
  ],
  7: [
    { id: 1, author: 'PhanBon01', initials: 'PB', avatarColor: 'bg-lime-100 text-lime-700', time: '3 ngày trước', content: 'Cảm ơn bạn đã chia sẻ! Mình cũng ủ rơm nhưng dùng men vi sinh tự làm từ chuối chín và nước vo gạo. Rẻ hơn mua Trichoderma nhưng chậm hơn khoảng 2-3 tuần.' },
    { id: 2, author: 'LanAnh', initials: 'LA', avatarColor: 'bg-pink-100 text-pink-700', time: '2 ngày trước', content: 'Hay đó! Bạn có thể chia sẻ công thức làm men tự nhiên không? Nghe có vẻ vừa rẻ vừa an toàn hơn hóa chất.' },
    { id: 3, author: 'HuuCo01', initials: 'HC', avatarColor: 'bg-emerald-100 text-emerald-700', time: '1 ngày trước', content: 'Mình bổ sung: thêm 10-15% phân bò hoặc phân gà vào đống ủ sẽ tăng N và tăng nhiệt độ ủ lên 50-60°C, giúp tiêu diệt mầm bệnh và cỏ dại tốt hơn.' },
  ],
};
