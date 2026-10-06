import prisma from '../config/database.js';
import { ForumCategoryOutput } from '../models/output/forumCategory.output.js';
import { respond, ERR, SCN } from '../common/response.js';

// GET /forum-categories — danh sách chủ đề diễn đàn (tập nhỏ → trả hết, không phân trang)
const getAll = async (req, res) => {
  try {
    const cats = await prisma.forumCategory.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { posts: true } } },
    });
    respond.ok(res, SCN.OK, cats.map(ForumCategoryOutput));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

export { getAll };
