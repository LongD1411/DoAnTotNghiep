// ─── HTTP STATUS CODES ────────────────────────────────────────────────────────

export const HTTP = {
  OK:           200,
  CREATED:      201,
  BAD_REQUEST:  400,
  UNAUTHORIZED: 401,
  FORBIDDEN:    403,
  NOT_FOUND:    404,
  SERVER_ERROR: 500,
};

// ─── SUCCESS CODES (ECN) ──────────────────────────────────────────────────────
// Shape: { code, message }
// Controller dùng: respond.ok(res, SCN.OK, data)

export const SCN = {
  // Generic
  OK:          { code: 'ECN000', message: 'Thành công' },
  CREATED:     { code: 'ECN001', message: 'Tạo mới thành công' },
  UPDATED:     { code: 'ECN002', message: 'Cập nhật thành công' },
  DELETED:     { code: 'ECN003', message: 'Xóa thành công' },

  // Auth
  REGISTER_OK: { code: 'ECN101', message: 'Đăng ký tài khoản thành công' },
  LOGIN_OK:    { code: 'ECN102', message: 'Đăng nhập thành công' },
  LOGOUT_OK:   { code: 'ECN103', message: 'Đăng xuất thành công' },
  REFRESH_OK:  { code: 'ECN104', message: 'Làm mới token thành công' },
};

// ─── ERROR CODES (ER) ─────────────────────────────────────────────────────────
// Shape: { code, message }
// Controller dùng: respond.badRequest(res, ERR.VALIDATION)

export const ERR = {
  // Generic
  VALIDATION: { code: 'ER001', message: 'Có lỗi trong xử lý dữ liệu, vui lòng thử lại' },
  NOT_FOUND:  { code: 'ER002', message: 'Không tìm thấy dữ liệu' },
  SERVER:     { code: 'ER003', message: 'Lỗi hệ thống, vui lòng thử lại sau' },
  NO_UPDATE:  { code: 'ER004', message: 'Không có thông tin nào cần cập nhật' },

  // Auth
  NO_TOKEN:    { code: 'ER101', message: 'Lỗi xác thực, vui lòng đăng nhập lại' },
  BAD_TOKEN:   { code: 'ER102', message: 'Lỗi xác thực, vui lòng đăng nhập lại' },
  NO_PERM:     { code: 'ER103', message: 'Bạn không có quyền thực hiện thao tác này' },
  BAD_REFRESH: { code: 'ER105', message: 'Refresh token không hợp lệ hoặc đã hết hạn' },

  // User business
  BAD_CREDS:  { code: 'ER201', message: 'Email hoặc mật khẩu không đúng' },
  EMAIL_DUPE: { code: 'ER202', message: 'Email này đã được sử dụng' },
  SELF_ROLE:  { code: 'ER203', message: 'Không thể thay đổi role của chính mình' },
  SELF_DEL:   { code: 'ER204', message: 'Không thể xóa tài khoản của chính mình' },
  BAD_PASSWORD: { code: 'ER205', message: 'Mật khẩu hiện tại không đúng' },

  // Review business
  REVIEW_DUP:         { code: 'ER301', message: 'Lần mua này đã được đánh giá' },
  REVIEW_NOT_ALLOWED: { code: 'ER302', message: 'Bạn chỉ có thể đánh giá sản phẩm trong đơn đã nhận của mình' },

  // Upload
  FILE_TOO_LARGE: { code: 'ER401', message: 'Tổng dung lượng ảnh vượt quá 10MB' },

  // Cart business
  OUT_OF_STOCK: { code: 'ER501', message: 'Sản phẩm đã hết hàng hoặc không còn kinh doanh' },
};

// ─── RESPONSE HELPERS ─────────────────────────────────────────────────────────
// Unified shape cho cả success và error:
//
//   { "success": true,  "code": "ECNxxx", "message": "...", "data": { ... } | null }
//   { "success": false, "code": "ERxxx",  "message": "...", "data": null }

const _success = (res, status, scn, data = null) =>
  res.status(status).json({ success: true,  code: scn.code, message: scn.message, data });

const _error = (res, status, err) =>
  res.status(status).json({ success: false, code: err.code, message: err.message, data: null });

export const respond = {
  ok:           (res, scn, data = null) => _success(res, HTTP.OK,           scn, data),
  created:      (res, scn, data = null) => _success(res, HTTP.CREATED,      scn, data),

  badRequest:   (res, err) => _error(res, HTTP.BAD_REQUEST,  err),
  unauthorized: (res, err) => _error(res, HTTP.UNAUTHORIZED, err),
  forbidden:    (res, err) => _error(res, HTTP.FORBIDDEN,    err),
  notFound:     (res, err) => _error(res, HTTP.NOT_FOUND,    err),
  serverError:  (res, err) => _error(res, HTTP.SERVER_ERROR, err),
};
