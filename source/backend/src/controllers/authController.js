import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { RegisterSchema, LoginSchema, RefreshSchema } from '../models/input/auth.input.js';
import { RegisterOutput, LoginOutput, ProfileOutput } from '../models/output/auth.output.js';
import { respond, ERR, SCN } from '../common/response.js';

const ACCESS_TTL  = '15m';
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày (ms)

const _generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

const _saveRefreshToken = (userId, token) =>
  prisma.refreshToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + REFRESH_TTL) },
  });

// ── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { email, password, full_name } = result.data;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name: full_name } });
    respond.created(res, SCN.REGISTER_OK, RegisterOutput(user));
  } catch {
    respond.badRequest(res, ERR.EMAIL_DUPE);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { email, password } = result.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
      return respond.unauthorized(res, ERR.BAD_CREDS);
    }

    const accessToken  = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
    const refreshToken = _generateRefreshToken();
    await _saveRefreshToken(user.id, refreshToken);

    respond.ok(res, SCN.LOGIN_OK, LoginOutput(accessToken, refreshToken, user));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

// ── Refresh ───────────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  const result = RefreshSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { refresh_token } = result.data;
  try {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refresh_token }, include: { user: true } });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      return respond.unauthorized(res, ERR.BAD_REFRESH);
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const newRefreshToken = _generateRefreshToken();
    await _saveRefreshToken(stored.userId, newRefreshToken);

    const accessToken = jwt.sign({ id: stored.user.id, role: stored.user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

    respond.ok(res, SCN.REFRESH_OK, { access_token: accessToken, refresh_token: newRefreshToken });
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  const result = RefreshSchema.safeParse(req.body);
  if (!result.success) return respond.badRequest(res, ERR.VALIDATION);

  const { refresh_token } = result.data;
  try {
    await prisma.refreshToken.deleteMany({ where: { token: refresh_token } });
    respond.ok(res, SCN.LOGOUT_OK, null);
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

// ── Profile ───────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return respond.notFound(res, ERR.NOT_FOUND);
    respond.ok(res, SCN.OK, ProfileOutput(user));
  } catch {
    respond.serverError(res, ERR.SERVER);
  }
};

export { register, login, refresh, logout, getProfile };
