import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed kho tri thức cho các lớp NGÔ + SẦU RIÊNG (model gộp đa cây).
 * modelLabel TRÙNG KHÍT tên thư mục lớp trong rice_images (sau khi format).
 * Bỏ qua 2 lớp "Khỏe mạnh" (ngô/sầu riêng) — backend xử lý qua isHealthy.
 */
const diseases = [
  // ── NGÔ (Lúa & Ngũ cốc) ───────────────────────────────────────────────────
  {
    modelLabel: 'Ngô - Bệnh cháy lá (Blight)',
    slug: 'ngo-chay-la-blight', name: 'Bệnh cháy lá ngô (Northern Leaf Blight)',
    latin: 'Exserohilum turcicum', category: 'Bệnh nấm', severity: 'NANG', crop: 'Lúa & Ngũ cốc',
    symptoms: [
      'Vết cháy dài hình điếu xì gà (hình thoi dài) màu xám nâu trên phiến lá, xuất hiện trước ở lá dưới.',
      'Vết lớn lan rộng làm lá khô cháy, giảm quang hợp.',
      'Phát triển mạnh khi ẩm độ cao, trời mát.',
    ],
    treatments: [
      'Dùng giống kháng, luân canh, dọn sạch tàn dư cây ngô.',
      'Phun thuốc gốc Azoxystrobin/Propiconazole/Mancozeb khi bệnh chớm.',
      'Bón cân đối, tránh gieo quá dày gây bí tán.',
    ],
  },
  {
    modelLabel: 'Ngô - Bệnh gỉ sắt (Common Rust)',
    slug: 'ngo-gi-sat-common-rust', name: 'Bệnh gỉ sắt thường trên ngô',
    latin: 'Puccinia sorghi', category: 'Bệnh nấm', severity: 'TRUNG_BINH', crop: 'Lúa & Ngũ cốc',
    symptoms: [
      'Ổ bào tử nhỏ màu nâu đỏ (như gỉ sắt) nổi rải đều hai mặt lá.',
      'Bệnh nặng làm lá khô cháy sớm, giảm năng suất hạt.',
    ],
    treatments: [
      'Chọn giống kháng, gieo đúng thời vụ.',
      'Phun thuốc gốc Triazole (Tebuconazole, Propiconazole) khi mới xuất hiện.',
      'Dọn sạch tàn dư sau thu hoạch.',
    ],
  },
  {
    modelLabel: 'Ngô - Bệnh đốm lá xám (Gray Leaf Spot)',
    slug: 'ngo-dom-la-xam-gray-leaf-spot', name: 'Bệnh đốm lá xám trên ngô',
    latin: 'Cercospora zeae-maydis', category: 'Bệnh nấm', severity: 'NANG', crop: 'Lúa & Ngũ cốc',
    symptoms: [
      'Đốm hình chữ nhật hẹp màu xám nâu, chạy dọc giữa các gân lá.',
      'Nhiều vết làm lá xám khô, cháy lá.',
      'Nặng ở ruộng canh tác ngô liên tục, ẩm.',
    ],
    treatments: [
      'Luân canh, cày vùi tàn dư cây bệnh.',
      'Dùng giống kháng.',
      'Phun Strobilurin/Triazole khi cần.',
    ],
  },
  // ── SẦU RIÊNG (Cây ăn quả) ─────────────────────────────────────────────────
  {
    modelLabel: 'Sầu riêng - Bệnh tảo (Algal)',
    slug: 'sau-rieng-benh-tao-algal', name: 'Bệnh đốm tảo (rỉ tảo) trên sầu riêng',
    latin: 'Cephaleuros virescens', category: 'Bệnh do tảo', severity: 'TRUNG_BINH', crop: 'Cây ăn quả',
    symptoms: [
      'Đốm tròn hơi nhô lên, bề mặt nhung màu cam – nâu đỏ (bào tử tảo).',
      'Lá bệnh nặng chuyển vàng, rụng.',
      'Phổ biến ở vườn rậm, ẩm, kém thông thoáng.',
    ],
    treatments: [
      'Tỉa cành tạo tán thông thoáng, giảm ẩm độ.',
      'Phun thuốc gốc đồng (Bordeaux/Copper) định kỳ trong mùa mưa.',
      'Bón cân đối để tăng sức đề kháng.',
    ],
  },
  {
    modelLabel: 'Sầu riêng - Bệnh cháy lá (Blight)',
    slug: 'sau-rieng-chay-la-blight', name: 'Bệnh cháy lá sầu riêng',
    latin: null, category: 'Bệnh nấm', severity: 'NANG', crop: 'Cây ăn quả',
    symptoms: [
      'Vết cháy nâu lan từ chóp/mép lá, khô thành mảng lớn.',
      'Lá rụng nhiều khi nặng, ảnh hưởng sinh trưởng.',
    ],
    treatments: [
      'Cắt tỉa lá bệnh, vệ sinh vườn.',
      'Phun thuốc trừ nấm (Mancozeb/Azoxystrobin) theo hướng dẫn.',
      'Thoát nước tốt, tránh ẩm ứ trong tán.',
    ],
  },
  {
    modelLabel: 'Sầu riêng - Bệnh Phomopsis',
    slug: 'sau-rieng-phomopsis', name: 'Bệnh đốm lá Phomopsis trên sầu riêng',
    latin: 'Phomopsis spp.', category: 'Bệnh nấm', severity: 'TRUNG_BINH', crop: 'Cây ăn quả',
    symptoms: [
      'Đốm nâu nhỏ đến mảng cháy trên lá, viền rõ, tâm xám.',
      'Lá khô và rụng sớm khi bệnh nặng.',
    ],
    treatments: [
      'Tỉa cành cho thông thoáng, dọn lá bệnh.',
      'Phun thuốc trừ nấm phổ rộng khi bệnh chớm.',
      'Bón cân đối, tránh để cây suy.',
    ],
  },
  {
    modelLabel: 'Sầu riêng - Bệnh Rhizoctonia',
    slug: 'sau-rieng-rhizoctonia', name: 'Bệnh cháy lá Rhizoctonia trên sầu riêng',
    latin: 'Rhizoctonia solani', category: 'Bệnh nấm', severity: 'NANG', crop: 'Cây ăn quả',
    symptoms: [
      'Vết loang màu nâu xám như bị luộc, lan nhanh sang các lá sát nhau khi ẩm.',
      'Lá kết dính, khô cháy thành từng đám.',
    ],
    treatments: [
      'Tỉa tán thông thoáng, giảm ẩm độ trong tán.',
      'Phun Validamycin/Hexaconazole khi bệnh chớm.',
      'Tránh tưới đẫm tán lá vào buổi tối.',
    ],
  },
];

const main = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null }, take: 3, orderBy: { id: 'asc' }, select: { id: true },
  });
  if (!products.length) console.warn('⚠️  Chưa có sản phẩm — bỏ qua gắn thuốc.');

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
      await prisma.pestCropType.create({ data: { pestId: entry.id, cropType: d.crop } });

      if (products.length) {
        await prisma.pestProduct.deleteMany({ where: { pestId: entry.id } });
        await prisma.pestProduct.createMany({ data: products.map((p) => ({ pestId: entry.id, productId: p.id })), skipDuplicates: true });
      }
      console.log(`✅ ${entry.id}\t${d.modelLabel}`);
    } catch (e) {
      console.error(`❌ Lỗi seed "${d.modelLabel}":`, e.code || e.message);
    }
  }
  console.log(`\n🌽🌰 Seed ngô + sầu riêng xong: ${diseases.length} lớp bệnh. 2 lớp "Khỏe mạnh" -> nhánh cây khỏe.`);
};

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
