import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Thêm tiền tố 'Lúa - ' vào modelLabel của các lớp LÚA (khớp việc đổi tên thư mục).
// Bỏ qua lớp đã có tiền tố Ngô/Sầu riêng/Lúa (idempotent).
const SKIP = ['Ngô - ', 'Sầu riêng - ', 'Lúa - '];

const main = async () => {
  const rows = await prisma.pestEntry.findMany({
    where: { modelLabel: { not: null } },
    select: { id: true, modelLabel: true },
  });

  let n = 0;
  for (const r of rows) {
    const m = r.modelLabel;
    if (SKIP.some((p) => m.startsWith(p))) continue;
    const neu = 'Lúa - ' + m;
    await prisma.pestEntry.update({ where: { id: r.id }, data: { modelLabel: neu } });
    console.log(`${m}  ->  ${neu}`);
    n++;
  }
  console.log(`\n>> Đã cập nhật ${n} modelLabel lúa.`);
};

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
