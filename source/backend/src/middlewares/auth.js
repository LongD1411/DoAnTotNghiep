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

export { authenticateToken, authorizeRole };
