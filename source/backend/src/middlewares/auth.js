import jwt from 'jsonwebtoken';
import { respond, ERR } from '../common/response.js';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return respond.unauthorized(res, ERR.NO_TOKEN);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return respond.unauthorized(res, ERR.BAD_TOKEN);
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return respond.forbidden(res, ERR.NO_PERM);
  next();
};

// Giải mã token nếu có (gắn req.user), KHÔNG chặn khi thiếu/hỏng token.
// Dùng cho route public cần phân biệt admin vs khách (vd: ẩn sản phẩm is_active=false).
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

export { authenticateToken, authorizeRole, optionalAuth };
