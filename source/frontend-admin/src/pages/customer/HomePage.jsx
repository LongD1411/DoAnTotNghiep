import { useState } from 'react';
// import axios from 'axios';

import CustomerLayout from '../../components/customer/CustomerLayout';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FORUM_POSTS = [
  {
    id: 1, initials: 'NN', color: 'bg-indigo-100 text-indigo-600',
    title: 'Cách trị bệnh đạo ôn lúa hiệu quả?',
    author: '@NhaNong01', time: '2 giờ trước', replies: 12, solved: true,
  },
  {
    id: 2, initials: 'TH', color: 'bg-orange-100 text-orange-600',
    title: 'Thuốc hữu cơ thay thế cho bệnh thối thân cà chua?',
    author: '@ThanhHoa', time: '5 giờ trước', replies: 8, hot: true,
  },
  {
    id: 3, initials: 'VT', color: 'bg-blue-100 text-blue-600',
    title: 'Nhận dạng sâu hại trên ngô giúp tôi với?',
    author: '@VanToan', time: '1 ngày trước', replies: 3,
    thumbnail: 'https://picsum.photos/seed/pest3/40/40',
  },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Roundup Ultra 480 SL',  description: 'Thuốc diệt cỏ tiếp xúc và nội hấp, hiệu quả trên nhiều loại cỏ dại trong ruộng lúa và vườn cây.',         price: 185000,  discount_price: 157000,  rating: 4.8, category: { id: 1, name: 'Herbicide'   }, image_url: 'https://picsum.photos/seed/herb1/400/225'   },
  { id: 2, name: 'Amistar Top 325 SC',    description: 'Thuốc trừ nấm phổ rộng, bảo vệ cây trồng khỏi bệnh đốm lá, thán thư và đạo ôn lúa hiệu quả.',              price: 320000,  discount_price: null,    rating: 4.5, category: { id: 2, name: 'Fungicide'   }, image_url: 'https://picsum.photos/seed/fungi2/400/225'  },
  { id: 3, name: 'Bayer Confidor 200 SL', description: 'Thuốc trừ sâu hút nội hấp, đặc trị rầy nâu, bọ trĩ và nhện đỏ trên lúa và rau màu.',                       price: 210000,  discount_price: null,    rating: 4.9, category: { id: 3, name: 'Insecticide' }, image_url: 'https://picsum.photos/seed/insec3/400/225'  },
  { id: 4, name: 'Phân NPK 16-16-8+TE',  description: 'Phân bón hỗn hợp cân đối, bổ sung đầy đủ đạm, lân, kali và vi lượng cho cây trồng giai đoạn sinh trưởng.', price: 450000,  discount_price: 382000,  rating: 4.6, category: { id: 4, name: 'Phân bón'    }, image_url: 'https://picsum.photos/seed/fert4/400/225'   },
  { id: 5, name: 'Nativo 75 WG',          description: 'Thuốc trừ nấm kết hợp Tebuconazole + Trifloxystrobin, kiểm soát bệnh khô vằn và lem lép hạt lúa.',         price: 275000,  discount_price: null,    rating: 4.7, category: { id: 2, name: 'Fungicide'   }, image_url: 'https://picsum.photos/seed/fungi5/400/225'  },
  { id: 6, name: 'Bình xịt điện pin 16L', description: 'Bình phun thuốc chạy pin sạc, áp suất ổn định, thích hợp phun thuốc và phân bón lá cho diện tích lớn.',   price: 1250000, discount_price: 1050000, rating: 4.6, category: { id: 5, name: 'Dụng cụ'     }, image_url: 'https://picsum.photos/seed/tool6/400/225'   },
  { id: 7, name: 'Axial 100 EC',          description: 'Thuốc trừ cỏ chọn lọc cho lúa mì và lúa mạch, hiệu quả cao trên cỏ hòa bản một lá mầm.',                  price: 195000,  discount_price: null,    rating: 4.4, category: { id: 1, name: 'Herbicide'   }, image_url: 'https://picsum.photos/seed/herb7/400/225'   },
  { id: 8, name: 'Phân Hữu Cơ Vi Sinh',  description: 'Phân bón hữu cơ vi sinh giàu chất mùn, cải tạo đất, tăng khả năng giữ ẩm và bổ sung vi sinh vật có ích.',   price: 380000,  discount_price: null,    rating: 4.3, category: { id: 4, name: 'Phân bón'    }, image_url: 'https://picsum.photos/seed/fert8/400/225'   },
];

const DEFAULT_CHIPS = [
  { label: 'Tất cả',    icon: 'grid_view',    value: null        },
  { label: 'Herbicide', icon: 'pest_control', value: 'Herbicide' },
  { label: 'Fungicide', icon: 'coronavirus',  value: 'Fungicide' },
  { label: 'Phân bón',  icon: 'water_drop',   value: 'Phân bón'  },
  { label: 'Dụng cụ',   icon: 'construction', value: 'Dụng cụ'   },
];

const BTN_ADD = 'h-9 px-4 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors bg-[#e9f3e7] dark:bg-white/10 text-[#2E7D32] dark:text-primary hover:bg-[#2E7D32] hover:text-white dark:hover:bg-[#2E7D32]';

const HomePage = () => {
  const [products]                      = useState(MOCK_PRODUCTS);
  const [loading]                       = useState(false);
  const [search, setSearch]             = useState('');
  const [selectedCat, setSelectedCat]   = useState(null);
  const [email, setEmail]               = useState('');

  // -- API-related state (re-enable with fetch below) --
  // const [debouncedSearch, setDebounced] = useState('');
  // const [categories, setCategories]     = useState([]);
  // const debounceRef = useRef(null);

  // -- Debounce search --
  // useEffect(() => {
  //   clearTimeout(debounceRef.current);
  //   debounceRef.current = setTimeout(() => setDebounced(search), 400);
  //   return () => clearTimeout(debounceRef.current);
  // }, [search]);

  // -- Fetch featured products --
  // useEffect(() => {
  //   let cancelled = false;
  //   const params = new URLSearchParams({ limit: 8, page: 1 });
  //   if (debouncedSearch) params.set('search', debouncedSearch);
  //   if (selectedCat)     params.set('search', selectedCat);
  //   axios.get(`${API_URL}/products?${params}`)
  //     .then((res) => {
  //       if (cancelled) return;
  //       const list = res.data.data?.data ?? [];
  //       setProducts(list);
  //       setCategories((prev) => {
  //         const map = new Map(prev.map((c) => [c.id, c]));
  //         list.forEach((p) => { if (p.category) map.set(p.category.id, p.category); });
  //         return [...map.values()];
  //       });
  //     })
  //     .catch(() => { if (!cancelled) setProducts(MOCK_PRODUCTS); });
  //   return () => { cancelled = true; };
  // }, [debouncedSearch, selectedCat]);

  const fmt = (n) =>
    n != null
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
      : '—';

  const filteredProducts = products.filter((p) => {
    const matchesCat    = !selectedCat || p.category?.name === selectedCat;
    const q             = search.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <CustomerLayout searchValue={search} onSearchChange={setSearch}>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <div className="w-full">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 py-6 md:py-10">
          <div
            className="relative w-full rounded-2xl overflow-hidden min-h-[480px] flex flex-col justify-end p-8 md:p-16 shadow-lg"
            style={{
              backgroundImage: 'linear-gradient(to top, rgba(19,34,16,0.8) 0%, rgba(19,34,16,0.2) 50%, rgba(0,0,0,0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9gs9-laJTX5CkUzPMqPbW-ZZL9iOusIHByiPXwngmg5oF1BUV-UUON_25RgZ_YkMo17nUKcYCHdglS1BzQgFtiKb2s2TTrvocvM8LxXYFeT-95TwSzt_LyDDOMiXxegpczRUouskbP8XZEPJJffQzDdutaWSkVt40qLdy6qICWi4FH95k_1uapBYqOFFaa5r54a4KAfH3tB5JkZtHcnExXK2J1YnyoVe4PsA1YT7USc03rcGWdoBSgV49oILm8wl608j8bMqluUQ")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 max-w-2xl flex flex-col gap-4 animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/90 text-black text-xs font-bold uppercase tracking-wider w-fit backdrop-blur-md">
                <span className="material-symbols-outlined text-[16px]">eco</span>
                Sản phẩm mới
              </span>
              <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-sm">
                Bảo vệ mùa vụ<br />
                <span className="text-primary">Tối đa năng suất.</span>
              </h1>
              <p className="text-gray-100 text-lg md:text-xl font-medium max-w-[480px] drop-shadow-sm">
                Giải pháp toàn diện cho bảo vệ thực vật và dinh dưỡng đất. Được chuyên gia kiểm định.
              </p>
              <div className="pt-4">
                <button className="group flex items-center gap-2 h-12 px-8 bg-primary hover:bg-[#3ed622] text-[#101b0d] text-base font-bold rounded-lg transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30">
                  <span>Mua sắm ngay</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 pb-20">

        {/* Quick Filter Chips */}
        <div className="flex gap-3 py-4 flex-wrap border-b border-[#e9f3e7] dark:border-white/10 pb-6 mb-6">
          {DEFAULT_CHIPS.map((chip) => {
            const isActive = chip.value === selectedCat;
            return (
              <button
                key={chip.label}
                onClick={() => setSelectedCat(chip.value)}
                className={`flex h-10 items-center gap-2 rounded-full px-5 transition-colors ${
                  isActive
                    ? 'bg-[#2E7D32] text-white shadow-md'
                    : 'bg-[#e9f3e7] dark:bg-white/10 hover:bg-primary/20 text-[#101b0d] dark:text-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{chip.icon}</span>
                <span className="text-sm font-semibold">{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* ── Featured Products (8 cols) ────────────────────────────── */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[#101b0d] dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                Sản phẩm nổi bật
              </h2>
              <a href="#" className="text-[#2E7D32] dark:text-primary font-bold text-base flex items-center gap-1">
                Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-12 h-12 rounded-full border-4 border-[#e9f3e7] border-t-primary animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-24 text-[#599a4c]">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
                  <p className="text-lg font-medium">Không tìm thấy sản phẩm nào</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredProducts.map((product) => {
                  const discountPct = product.discount_price
                    ? Math.round((1 - product.discount_price / product.price) * 100)
                    : null;
                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Image */}
                      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-white/5 relative">
                        {discountPct && (
                          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discountPct}%
                          </div>
                        )}
                        {product.image_url ? (
                          <div
                            className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                            style={{ backgroundImage: `url("${product.image_url}")` }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#e9f3e7] dark:bg-[#2a3e25] group-hover:scale-105 transition-transform duration-500">
                            <span className="material-symbols-outlined text-5xl text-[#d3e7cf] dark:text-[#2f4b26]">eco</span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-[#101b0d] dark:text-white text-lg font-bold leading-tight group-hover:text-[#2E7D32] dark:group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          {product.rating != null && (
                            <div className="flex items-center text-yellow-500 text-xs shrink-0">
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className="ml-0.5 text-gray-500 font-medium">{product.rating}</span>
                            </div>
                          )}
                        </div>

                        {product.category?.name && (
                          <p className="text-sm text-[#599a4c] font-medium">{product.category.name}</p>
                        )}
                        {product.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{product.description}</p>
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            {product.discount_price ? (
                              <>
                                <span className="text-gray-400 text-xs line-through">{fmt(product.price)}</span>
                                <span className="text-[#2E7D32] dark:text-primary text-xl font-bold">{fmt(product.discount_price)}</span>
                              </>
                            ) : (
                              <span className="text-[#2E7D32] dark:text-primary text-xl font-bold">{fmt(product.price)}</span>
                            )}
                          </div>
                          <button className={BTN_ADD}>
                            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Community Sidebar (4 cols, sticky) ───────────────────── */}
          <aside className="xl:col-span-4 flex flex-col gap-6 sticky top-24">

            {/* Forum Widget */}
            <div className="rounded-xl bg-[#E8F5E9] dark:bg-white/5 border border-[#e9f3e7] dark:border-white/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#2E7D32] dark:text-white text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary">forum</span>
                  Cộng đồng
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                {FORUM_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-black/20 p-4 rounded-lg shadow-sm border border-transparent hover:border-[#2E7D32]/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full ${post.color} flex items-center justify-center shrink-0`}>
                          <span className="text-sm font-bold">{post.initials}</span>
                        </div>
                        <div>
                          <h4 className="text-[#101b0d] dark:text-white font-bold text-base leading-snug group-hover:text-[#2E7D32] dark:group-hover:text-primary transition-colors">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{post.author}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-xs text-gray-500">{post.time}</span>
                          </div>
                        </div>
                      </div>
                      {post.thumbnail && (
                        <div
                          className="w-10 h-10 rounded-md bg-gray-100 bg-cover bg-center shrink-0"
                          style={{ backgroundImage: `url("${post.thumbnail}")` }}
                        />
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                        {post.replies} Phản hồi
                      </div>
                      {post.solved && (
                        <div className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã giải quyết
                        </div>
                      )}
                      {post.hot && (
                        <span className="bg-primary/20 text-[#2E7D32] text-[10px] font-bold px-2 py-0.5 rounded">HOT</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-base font-bold text-[#2E7D32] dark:text-primary hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors">
                Xem tất cả thảo luận
              </button>
            </div>

            {/* Newsletter Widget */}
            <div className="rounded-xl bg-[#2E7D32] p-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-2 text-primary block">mark_email_unread</span>
                <h3 className="text-lg font-bold mb-2">Mẹo nông nghiệp hàng tuần</h3>
                <p className="text-white/80 text-base mb-4">
                  Nhận lời khuyên từ chuyên gia về bảo vệ thực vật và nông nghiệp theo mùa vụ.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email của bạn"
                    className="w-full h-9 rounded bg-white/10 border border-white/20 text-sm px-3 text-white placeholder:text-white/50 focus:outline-none focus:border-primary"
                  />
                  <button className="h-9 px-3 bg-primary text-[#2E7D32] font-bold rounded text-sm hover:bg-white transition-colors shrink-0">
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

    </CustomerLayout>
  );
};

export default HomePage;
