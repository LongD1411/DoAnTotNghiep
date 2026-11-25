import { listOutput } from '../../common/schema.js';

// Mã đơn hiển thị cho user + dùng làm NỘI DUNG CHUYỂN KHOẢN khi đối soát (vd: DH000123)
export const orderCode = (id) => 'DH' + String(id).padStart(6, '0');

const OrderItemOutput = (it) => ({
  id:         it.id,
  product_id: it.productId,
  name:       it.product?.name ?? null,
  slug:       it.product?.slug ?? null,
  unit:       it.product?.unit ?? null,
  image_url:  it.product?.imageUrl ?? it.product?.images?.[0]?.url ?? null,
  price:      it.price,                 // giá tại thời điểm mua (snapshot)
  quantity:   it.quantity,
  subtotal:   it.price * it.quantity,
});

const AddressOutput = (a) => (a ? {
  id:        a.id,
  full_name: a.fullName,
  phone:     a.phone,
  street:    a.street,
  ward:      a.ward ?? null,
  district:  a.district,
  city:      a.city,
  zip:       a.zip ?? null,
} : null);

export const OrderOutput = (o) => {
  const items = o.orderItems ?? [];
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  return {
    id:             o.id,
    code:           orderCode(o.id),
    status:         o.status,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    subtotal,
    shipping_fee:   o.shippingFee,
    discount:       o.discount,
    total:          o.total,
    note:           o.note ?? null,
    cancel_reason:  o.cancelReason ?? null,
    address:        AddressOutput(o.address),
    items:          items.map(OrderItemOutput),
    item_count:     items.reduce((s, it) => s + it.quantity, 0),
    delivered_at:   o.deliveredAt ?? null,
    created_at:     o.createdAt,
    updated_at:     o.updatedAt,
  };
};

export const OrderListOutput = listOutput(OrderOutput);
