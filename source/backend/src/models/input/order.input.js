import { z } from 'zod';
import { QuerySchema } from '../../common/schema.js';

export const ORDER_STATUS   = ['pending', 'approved', 'delivering', 'delivered', 'completed', 'cancelled'];
export const PAYMENT_STATUS  = ['unpaid', 'paid', 'refunded'];
export const PAYMENT_METHODS = ['cod', 'bank_transfer'];

// Địa chỉ giao hàng gửi kèm khi đặt đơn (map sang model Address)
const AddressSchema = z.object({
  full_name: z.string().min(1).max(100),
  phone:     z.string().regex(/^\d{8,15}$/),
  street:    z.string().min(1),
  ward:      z.string().optional(),
  district:  z.string().min(1),
  city:      z.string().min(1),
  zip:       z.string().optional(),
});

// POST /orders — chỉ nhận địa chỉ + phương thức + ghi chú. Giỏ, giá, phí ship đều lấy/tính SERVER.
export const CreateOrderSchema = z.object({
  address:        AddressSchema,
  payment_method: z.enum(PAYMENT_METHODS).default('cod'),
  note:           z.string().max(500).optional(),
});

// PUT /orders/:id (admin) — cập nhật trạng thái đơn / thanh toán / lý do huỷ. Tất cả optional.
export const UpdateOrderSchema = z.object({
  status:         z.enum(ORDER_STATUS).optional(),
  payment_status: z.enum(PAYMENT_STATUS).optional(),
  cancel_reason:  z.string().max(255).optional(),
});

// PUT /orders/:id/cancel — chủ đơn tự huỷ đơn (lý do tuỳ chọn)
export const CancelOrderSchema = z.object({
  cancel_reason: z.string().max(255).optional(),
});

// GET /orders — lọc theo trạng thái (admin dùng để đối soát)
export const OrderQuerySchema = QuerySchema.extend({
  status:         z.enum(ORDER_STATUS).optional(),
  payment_status: z.enum(PAYMENT_STATUS).optional(),
});
