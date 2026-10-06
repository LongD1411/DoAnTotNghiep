import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Chủ đề diễn đàn — khớp mock (ForumPage / CreatePostPage)
const categories = [
  { name: 'Sâu & Bệnh',      slug: 'pest',    description: 'Hỏi đáp về sâu bệnh hại cây trồng', order: 1 },
  { name: 'Mẹo Nông Nghiệp', slug: 'tips',    description: 'Chia sẻ kinh nghiệm & mẹo canh tác', order: 2 },
  { name: 'Chung',           slug: 'general', description: 'Thảo luận chung về nông nghiệp',      order: 3 },
];

const main = async () => {
  for (const c of categories) {
    await prisma.forumCategory.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, description: c.description, order: c.order },
      create: c,
    });
  }
  const all = await prisma.forumCategory.findMany({ orderBy: { order: 'asc' } });
  console.log('✅ Seeded forum categories:', all.map(c => `#${c.id} ${c.name}`).join(' · '));
};

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
