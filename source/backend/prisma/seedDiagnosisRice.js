import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed kho tri thức cho Chẩn đoán AI — bộ BỆNH/SÂU HẠI LÚA (21 lớp).
 * - `modelLabel` TRÙNG KHÍT tên thư mục lớp trong dataset (xem ml-service/labels.py)
 *   để backend map output CNN -> PestEntry.
 * - Phủ 20/21 lớp (trừ "Healthy" = cây khỏe, backend xử lý riêng).
 */
const diseases = [
  {
    modelLabel: 'Bệnh Bạc lá (Bacterial leaf blight)',
    slug: 'lua-bac-la-vi-khuan', name: 'Bệnh bạc lá lúa (vi khuẩn)',
    latin: 'Xanthomonas oryzae pv. oryzae', category: 'Vi khuẩn', severity: 'NGUY_HIEM',
    symptoms: [
      'Mép lá xuất hiện vệt úng nước rồi chuyển vàng, khô trắng từ chóp lá lan dần xuống.',
      'Sáng sớm có giọt dịch vi khuẩn màu vàng đục đọng trên vết bệnh.',
      'Lá khô cháy thành mảng, giảm quang hợp, lép hạt khi nặng.',
    ],
    treatments: [
      'Dùng giống kháng, bón đạm cân đối, tuyệt đối tránh bón thừa đạm.',
      'Tháo nước phơi ruộng, không để ngập sâu khi bệnh chớm.',
      'Phun thuốc gốc đồng hoặc kháng sinh nông nghiệp (Kasugamycin, Oxolinic acid) khi mới phát.',
    ],
  },
  {
    modelLabel: 'Bệnh Cháy lá ( Leaf scald )',
    slug: 'lua-chay-la-leaf-scald', name: 'Bệnh cháy lá lúa (leaf scald)',
    latin: 'Microdochium oryzae', category: 'Bệnh nấm', severity: 'NANG',
    symptoms: [
      'Vết bệnh ở chóp/mép lá với các vân sóng xen kẽ nâu nhạt – nâu đậm như bị luộc.',
      'Vết lan rộng làm lá khô dần từ chóp xuống.',
    ],
    treatments: [
      'Bón phân cân đối NPK, tránh thừa đạm.',
      'Vệ sinh đồng ruộng, dọn sạch tàn dư cây bệnh.',
      'Phun thuốc trừ nấm gốc Tricyclazole/Propiconazole khi cần.',
    ],
  },
  {
    modelLabel: 'Bệnh Gạch Nâu ( Narrow Brown Spot )',
    slug: 'lua-gach-nau-narrow-brown-spot', name: 'Bệnh gạch nâu (đốm nâu hẹp)',
    latin: 'Cercospora janseana', category: 'Bệnh nấm', severity: 'TRUNG_BINH',
    symptoms: [
      'Vết sọc nâu hẹp, ngắn, chạy dọc theo gân lá.',
      'Nhiều vết khiến lá vàng và khô sớm.',
    ],
    treatments: [
      'Dùng giống kháng, bón đủ Kali.',
      'Phun Propiconazole/Mancozeb nếu bệnh nặng.',
    ],
  },
  {
    modelLabel: 'Bệnh Than Vàng ( False Smut )',
    slug: 'lua-than-vang-false-smut', name: 'Bệnh than vàng (false smut)',
    latin: 'Ustilaginoidea virens', category: 'Bệnh nấm', severity: 'TRUNG_BINH',
    symptoms: [
      'Hạt lúa biến thành khối bào tử màu vàng – xanh đen, lớn hơn hạt bình thường.',
      'Xuất hiện rải rác trên bông khi lúa trổ gặp thời tiết ẩm.',
    ],
    treatments: [
      'Tránh bón thừa đạm giai đoạn đòng – trổ.',
      'Phun phòng gốc đồng/Propiconazole trước trổ 7–10 ngày khi dự báo mưa ẩm.',
      'Thu gom và tiêu hủy hạt bệnh.',
    ],
  },
  {
    modelLabel: 'Bệnh lúa von (lúa đực) (Rice bakanae disease)',
    slug: 'lua-von-bakanae', name: 'Bệnh lúa von (mạ đực, bakanae)',
    latin: 'Fusarium fujikuroi', category: 'Bệnh nấm', severity: 'NANG',
    symptoms: [
      'Cây mạ/lúa vươn lóng cao bất thường, gầy yếu, lá xanh nhạt.',
      'Cây thường chết khô hoặc không trổ bông (lúa đực).',
    ],
    treatments: [
      'Xử lý hạt giống bằng thuốc trừ nấm trước khi gieo (biện pháp quan trọng nhất).',
      'Dùng hạt giống sạch bệnh, từ nguồn tin cậy.',
      'Nhổ bỏ cây von để hạn chế lây lan.',
    ],
  },
  {
    modelLabel: 'Bệnh Đạo ôn lá và cổ bông (Rice leaf and neck blast)',
    slug: 'lua-dao-on-la-co-bong', name: 'Bệnh đạo ôn (lá & cổ bông)',
    latin: 'Pyricularia oryzae', category: 'Bệnh nấm', severity: 'NGUY_HIEM',
    symptoms: [
      'Trên lá: vết hình thoi (mắt én), tâm xám trắng, viền nâu.',
      'Trên cổ bông: cổ bông thâm đen, gãy gục, hạt lép trắng.',
      'Lây lan rất nhanh khi ẩm độ cao, sáng sớm nhiều sương.',
    ],
    treatments: [
      'Dùng giống kháng, bón đạm vừa phải và chia nhiều lần.',
      'Phun Tricyclazole/Isoprothiolane khi bệnh chớm trên lá và phun phòng trước trổ cho cổ bông.',
      'Giữ mực nước hợp lý, không để ruộng khô hạn.',
    ],
  },
  {
    modelLabel: 'Bệnh Đốm Nâu ( Brown spot )',
    slug: 'lua-dom-nau-brown-spot', name: 'Bệnh đốm nâu',
    latin: 'Bipolaris oryzae', category: 'Bệnh nấm', severity: 'TRUNG_BINH',
    symptoms: [
      'Đốm tròn/bầu dục màu nâu, to cỡ hạt vừng đến hạt gạo, rải khắp lá.',
      'Nặng trên đất nghèo dinh dưỡng, thiếu Kali.',
    ],
    treatments: [
      'Bón cân đối, bổ sung Kali và vi lượng.',
      'Xử lý hạt giống, dùng giống khỏe.',
      'Phun Mancozeb/Propiconazole nếu cần.',
    ],
  },
  {
    modelLabel: 'Bệnh Đốm Vằn ( Khô vằn ) ( Sheath Blight )',
    slug: 'lua-dom-van-kho-van-sheath-blight', name: 'Bệnh đốm vằn (khô vằn)',
    latin: 'Rhizoctonia solani', category: 'Bệnh nấm', severity: 'NANG',
    symptoms: [
      'Vết loang màu xám xanh – nâu hình đám mây/vằn da hổ trên bẹ lá gần mặt nước.',
      'Lan lên lá đòng làm lá khô, gây lép hạt.',
      'Nặng khi ruộng rậm rạp, bón nhiều đạm.',
    ],
    treatments: [
      'Cấy/sạ thưa hợp lý, bón đạm cân đối.',
      'Phun Validamycin/Hexaconazole vào gốc – bẹ khi bệnh chớm.',
      'Tháo nước phơi ruộng ở giai đoạn mẫn cảm.',
    ],
  },
  {
    modelLabel: 'Bọ trĩ ( Thrips )',
    slug: 'lua-bo-tri-thrips', name: 'Bọ trĩ hại lúa',
    latin: 'Stenchaetothrips biformis', category: 'Côn trùng', severity: 'TRUNG_BINH',
    symptoms: [
      'Lá non cuốn lại, chóp lá khô vàng và quăn.',
      'Hại nặng giai đoạn mạ – đẻ nhánh, nhất là khi khô hạn.',
    ],
    treatments: [
      'Giữ đủ nước, tưới giữ ẩm ruộng mạ.',
      'Dùng bẫy, bảo vệ thiên địch.',
      'Phun thuốc khi mật độ cao (Imidacloprid, Spinetoram).',
    ],
  },
  {
    modelLabel: 'Rầy Nâu (Brown Plant Hopper)',
    slug: 'lua-ray-nau-bph', name: 'Rầy nâu hại lúa',
    latin: 'Nilaparvata lugens', category: 'Côn trùng', severity: 'NGUY_HIEM',
    symptoms: [
      'Rầy chích hút gốc lúa làm cây vàng, khô lụi thành chòm ("cháy rầy").',
      'Là môi giới truyền virus vàng lùn, lùn xoắn lá.',
      'Mật độ tập trung cao ở gốc, dưới tán.',
    ],
    treatments: [
      'Dùng giống kháng, sạ thưa, không bón thừa đạm.',
      'Bảo vệ thiên địch, tránh phun thuốc sớm diệt thiên địch.',
      'Khi mật độ cao phun thuốc đặc hiệu (Pymetrozine, Nitenpyram) vào gốc.',
    ],
  },
  {
    modelLabel: 'Sâu cuốn lá lớn ( Rice skipper)',
    slug: 'lua-sau-cuon-la-lon-skipper', name: 'Sâu cuốn lá lớn',
    latin: 'Parnara guttata', category: 'Côn trùng', severity: 'TRUNG_BINH',
    symptoms: [
      'Sâu cuốn nhiều lá thành ống lớn, ăn khuyết lá.',
      'Thường hại rải rác, ít bùng thành dịch lớn.',
    ],
    treatments: [
      'Thăm đồng, bắt sâu và ngắt ổ.',
      'Bảo vệ ong ký sinh.',
      'Phun thuốc khi mật độ cao, ưu tiên lúc sâu non.',
    ],
  },
  {
    modelLabel: 'Sâu cuốn lá nhỏ ( Rice leaf folder)',
    slug: 'lua-sau-cuon-la-nho-leaf-folder', name: 'Sâu cuốn lá nhỏ',
    latin: 'Cnaphalocrocis medinalis', category: 'Côn trùng', severity: 'NANG',
    symptoms: [
      'Sâu nhả tơ cuốn dọc lá thành ống, ăn phần xanh để lại vệt trắng dài.',
      'Hại lá đòng ảnh hưởng lớn đến năng suất.',
    ],
    treatments: [
      'Theo dõi bướm ra rộ, bón đạm cân đối.',
      'Bảo vệ thiên địch, chỉ phun khi vượt ngưỡng (sâu tuổi nhỏ).',
      'Dùng chế phẩm sinh học (Bt) hoặc thuốc đặc hiệu.',
    ],
  },
  {
    modelLabel: 'Sâu gai ( Hispa )',
    slug: 'lua-sau-gai-hispa', name: 'Sâu gai (hispa)',
    latin: 'Dicladispa armigera', category: 'Côn trùng', severity: 'TRUNG_BINH',
    symptoms: [
      'Trưởng thành cạp biểu bì tạo vệt trắng song song gân lá.',
      'Sâu non đục trong phiến lá tạo vết mờ, lá khô bạc.',
    ],
    treatments: [
      'Cắt tỉa lá bị hại nặng.',
      'Bón cân đối, vệ sinh bờ ruộng.',
      'Phun thuốc khi mật độ cao.',
    ],
  },
  {
    modelLabel: 'Sâu năn ( Muỗi hành )(Rice Gall Midge)',
    slug: 'lua-sau-nan-muoi-hanh-gall-midge', name: 'Sâu năn (muỗi hành)',
    latin: 'Orseolia oryzae', category: 'Côn trùng', severity: 'NANG',
    symptoms: [
      'Dảnh bị hại tạo ống tròn như cọng hành màu trắng xanh (ống hành), không trổ bông.',
      'Hại nặng giai đoạn đẻ nhánh, ruộng rậm và ẩm.',
    ],
    treatments: [
      'Dùng giống kháng, gieo cấy tập trung để né lứa.',
      'Bảo vệ ong ký sinh.',
      'Khi cần dùng thuốc nội hấp (Fipronil, Carbofuran dạng hạt) theo khuyến cáo.',
    ],
  },
  {
    modelLabel: 'Sâu đục thân (Rice yellow stem borer)',
    slug: 'lua-sau-duc-than-buom-2-cham', name: 'Sâu đục thân bướm 2 chấm',
    latin: 'Scirpophaga incertulas', category: 'Côn trùng', severity: 'NGUY_HIEM',
    symptoms: [
      'Giai đoạn đẻ nhánh: dảnh héo, nõn héo (dead heart).',
      'Giai đoạn trổ: bông bạc, lép trắng (whitehead).',
      'Thấy lỗ đục và phân sâu bên trong thân.',
    ],
    treatments: [
      'Theo dõi bướm & ổ trứng, ngắt ổ trứng.',
      'Gieo cấy né lứa bướm rộ, bảo vệ thiên địch.',
      'Phun/rải thuốc nội hấp khi bướm ra rộ (Chlorantraniliprole, Cartap).',
    ],
  },
  {
    modelLabel: 'Sâu đục thân (Sọc nâu )( Chilo suppressalis )',
    slug: 'lua-sau-duc-than-soc-nau-chilo', name: 'Sâu đục thân sọc nâu',
    latin: 'Chilo suppressalis', category: 'Côn trùng', severity: 'NANG',
    symptoms: [
      'Triệu chứng tương tự đục thân 2 chấm: nõn héo, bông bạc.',
      'Sâu non có sọc nâu, đục trong thân, thường nhiều con trên một dảnh.',
    ],
    treatments: [
      'Vệ sinh gốc rạ sau thu hoạch để diệt sâu qua đông.',
      'Né lứa bướm, bảo vệ thiên địch.',
      'Dùng thuốc nội hấp khi cần.',
    ],
  },
  {
    modelLabel: 'Tungro virus',
    slug: 'lua-vang-lun-tungro-virus', name: 'Bệnh vàng lùn Tungro (virus)',
    latin: 'Rice tungro virus (RTBV + RTSV)', category: 'Virus', severity: 'NGUY_HIEM',
    symptoms: [
      'Cây lùn, lá vàng – cam từ chóp lá xuống.',
      'Đẻ nhánh ít, trổ muộn, bông lép nhiều.',
      'Lây lan theo rầy xanh đuôi đen (côn trùng môi giới).',
    ],
    treatments: [
      'Dùng giống kháng, gieo cấy đồng loạt để né rầy.',
      'Nhổ bỏ sớm cây bệnh.',
      'Quản lý rầy môi giới — không có thuốc trị virus trực tiếp.',
    ],
  },
  {
    modelLabel: 'K',
    slug: 'lua-thieu-kali-k', name: 'Lúa thiếu Kali (K)',
    latin: null, category: 'Thiếu dinh dưỡng', severity: 'TRUNG_BINH',
    symptoms: [
      'Chóp và mép lá già vàng rồi khô cháy, có đốm nâu rải trên lá.',
      'Cây yếu, dễ đổ ngã và dễ nhiễm bệnh.',
      'Biểu hiện từ lá dưới lên trên.',
    ],
    treatments: [
      'Bón bổ sung Kali (KCl/K2SO4) theo nhu cầu từng giai đoạn.',
      'Bón cân đối NPK, trả lại rơm rạ cho ruộng.',
      'Tránh để ruộng thiếu nước kéo dài.',
    ],
  },
  {
    modelLabel: 'N',
    slug: 'lua-thieu-dam-n', name: 'Lúa thiếu đạm (N)',
    latin: null, category: 'Thiếu dinh dưỡng', severity: 'TRUNG_BINH',
    symptoms: [
      'Lá vàng nhạt đều, cây thấp bé, đẻ nhánh kém.',
      'Lá già vàng trước (đạm di chuyển lên nuôi lá non).',
      'Năng suất giảm rõ rệt.',
    ],
    treatments: [
      'Bón bổ sung đạm (urê) chia nhiều lần, đúng giai đoạn.',
      'Kết hợp phân hữu cơ.',
      'Tránh bón dồn một lần gây lãng phí và đổ ngã.',
    ],
  },
  {
    modelLabel: 'P',
    slug: 'lua-thieu-lan-p', name: 'Lúa thiếu lân (P)',
    latin: null, category: 'Thiếu dinh dưỡng', severity: 'TRUNG_BINH',
    symptoms: [
      'Lá nhỏ, dựng đứng, màu xanh đậm pha tím/đỏ ở lá già.',
      'Rễ kém phát triển, đẻ nhánh ít, chín muộn.',
      'Rõ trên đất phèn/chua, thời tiết lạnh.',
    ],
    treatments: [
      'Bón lân (super lân/DAP), ưu tiên bón lót sớm.',
      'Cải tạo đất chua bằng vôi.',
      'Bón cân đối NPK.',
    ],
  },
];

// 6 slug entry demo PlantVillage cũ — dọn để kho tri thức thuần lúa
const OLD_PLANTVILLAGE_SLUGS = [
  'ca-chua-moc-suong-muon', 'ca-chua-dom-vong-moc-suong-som', 'khoai-tay-moc-suong-muon',
  'ngo-gi-sat-thuong', 'nho-thoi-den', 'ca-chua-xoan-vang-la-virus',
];

const main = async () => {
  // Dọn entry PlantVillage cũ (nếu còn). Cascade sẽ xóa symptom/treatment/cropType/pestProduct.
  for (const slug of OLD_PLANTVILLAGE_SLUGS) {
    try {
      const old = await prisma.pestEntry.findUnique({ where: { slug }, select: { id: true } });
      if (old) {
        await prisma.diagnosis.updateMany({ where: { pestId: old.id }, data: { pestId: null, matched: false } });
        await prisma.pestEntry.delete({ where: { id: old.id } });
        console.log(`🧹 Đã xóa entry PlantVillage cũ: ${slug}`);
      }
    } catch (e) {
      console.warn(`⚠️  Không xóa được ${slug}:`, e.code || e.message);
    }
  }

  // Sản phẩm thuốc để gắn demo (nhánh matched hiện "thuốc điều trị")
  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null }, take: 3, orderBy: { id: 'asc' }, select: { id: true },
  });
  if (!products.length) {
    console.warn('⚠️  Chưa có sản phẩm — bỏ qua gắn thuốc. Có thể gắn sau trong Admin > Cẩm nang.');
  }

  for (const d of diseases) {
    try {
      const entry = await prisma.pestEntry.upsert({
        where:  { slug: d.slug },
        update: { name: d.name, latinName: d.latin, category: d.category, severity: d.severity,
                  modelLabel: d.modelLabel, isActive: true },
        create: { name: d.name, latinName: d.latin, slug: d.slug, category: d.category,
                  severity: d.severity, modelLabel: d.modelLabel },
      });

      await prisma.pestSymptom.deleteMany({ where: { pestId: entry.id } });
      await prisma.pestSymptom.createMany({ data: d.symptoms.map((content, i) => ({ pestId: entry.id, content, order: i })) });

      await prisma.pestTreatment.deleteMany({ where: { pestId: entry.id } });
      await prisma.pestTreatment.createMany({ data: d.treatments.map((content, i) => ({ pestId: entry.id, content, order: i })) });

      await prisma.pestCropType.deleteMany({ where: { pestId: entry.id } });
      await prisma.pestCropType.create({ data: { pestId: entry.id, cropType: 'Lúa & Ngũ cốc' } });

      if (products.length) {
        await prisma.pestProduct.deleteMany({ where: { pestId: entry.id } });
        await prisma.pestProduct.createMany({ data: products.map((p) => ({ pestId: entry.id, productId: p.id })), skipDuplicates: true });
      }

      console.log(`✅ ${entry.id}\t${d.modelLabel}`);
    } catch (e) {
      console.error(`❌ Lỗi seed "${d.modelLabel}":`, e.code || e.message);
    }
  }

  console.log(`\n🌾 Seed lúa xong: ${diseases.length} lớp có PestEntry. "Healthy" -> nhánh cây khỏe. `
    + 'Lớp nào model đoán mà chưa có PestEntry sẽ vào fallback.');
};

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
