const CartProduct = (p) => ({
  id:             p.id,
  name:           p.name,
  slug:           p.slug,
  price:          p.price,
  discount_price: p.discountPrice ?? null,
  unit:           p.unit,
  stock:          p.stock,
  image_url:      p.imageUrl ?? p.images?.[0]?.url ?? null,
});

export const CartOutput = (cart) => ({
  id: cart.id,
  items: (cart.cartItems ?? []).map(ci => ({
    product_id: ci.productId,
    quantity:   ci.quantity,
    product:    ci.product ? CartProduct(ci.product) : undefined,
  })),
});
