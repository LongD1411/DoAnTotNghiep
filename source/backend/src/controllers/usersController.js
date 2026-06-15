import prisma from '../config/database.js';
import { UpdateRoleSchema, UserQuerySchema } from '../models/input/user.input.js';
import { UserOutput, UserListOutput } from '../models/output/user.output.js';
import { respond, ERR, SCN } from '../common/response.js';

const getAll = async (req, res) => {
  const result = UserQuerySchema.safeParse(req.query);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { search, page, limit } = result.data;
  try {
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, select: { id: true, email: true, name: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    respond.ok(res, SCN.OK, UserListOutput({ data: users, total, page, limit }));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return respond.notFound(res, ERR.NOT_FOUND);
    respond.ok(res, SCN.OK, UserOutput(user));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

const updateRole = async (req, res) => {
  const result = UpdateRoleSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { id } = req.params;
  const { role } = result.data;
  if (parseInt(id) === req.user.id) return respond.badRequest(res, ERR.SELF_ROLE);

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    respond.ok(res, SCN.UPDATED, UserOutput(user));
  } catch {
    respond.notFound(res, ERR.NOT_FOUND);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) return respond.badRequest(res, ERR.SELF_DEL);

  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    respond.ok(res, SCN.DELETED, null);
  } catch {
    respond.notFound(res, ERR.NOT_FOUND);
  }
};

export { getAll, getById, updateRole, remove };
