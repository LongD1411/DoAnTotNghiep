import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';

const STATS = [
  { icon: 'inventory_2',  value: '200+',  label: 'Sản phẩm BVTV'       },
  { icon: 'groups',       value: '5.000+', label: 'Nông dân tin dùng'    },
  { icon: 'bug_report',   value: '50+',   label: 'Loài sâu bệnh tra cứu' },
  { icon: 'forum',        value: '1.000+', label: 'Bài thảo luận'         },
];

const SERVICES = [
  {
    icon: 'storefront',
    title: 'Cửa hàng trực tuyến',
    desc: 'Thuốc BVTV, phân bón và dụng cụ nông nghiệp chất lượng cao từ các thương hiệu uy tín. Giao hàng toàn quốc, kiểm định chất lượng trước khi giao.',
    link: '/san-pham',
    linkLabel: 'Khám phá sản phẩm',
    color: 'bg-green-50 dark:bg-green-900/20 text-[#2E7D32] dark:text-primary',
  },
  {
    icon: 'search',
    title: 'Bách khoa tra cứu',
    desc: 'Cơ sở dữ liệu sâu bệnh & dịch hại phong phú với hình ảnh nhận dạng, điều kiện phát sinh và biện pháp xử lý từ chuyên gia nông nghiệp.',
    link: '/tra-cuu',
    linkLabel: 'Tra cứu ngay',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  },
  {
    icon: 'forum',
    title: 'Diễn đàn cộng đồng',
    desc: 'Kết nối với hàng nghìn nông dân và chuyên gia. Hỏi đáp, chia sẻ kinh nghiệm canh tác và nhận tư vấn từ cộng đồng ngay lập tức.',
    link: '/dien-dan',
    linkLabel: 'Tham gia diễn đàn',
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  },
];

const TEAM = [
  {
    name: 'Nguyễn Văn An',
    role: 'Nhà sáng lập & CEO',
    bio: '15 năm kinh nghiệm trong lĩnh vực nông nghiệp và phân phối vật tư nông nghiệp tại đồng bằng sông Cửu Long.',
    initials: 'NA', color: 'bg-indigo-100 text-indigo-700',
  },
  {
    name: 'Trần Thị Bình',
    role: 'Giám đốc Kỹ thuật',
    bio: 'Kỹ sư Nông nghiệp, chuyên gia về bảo vệ thực vật với 10 năm nghiên cứu tại Viện Khoa học Nông nghiệp Việt Nam.',
    initials: 'TB', color: 'bg-pink-100 text-pink-700',
  },
  {
    name: 'Lê Minh Cường',
    role: 'Trưởng phòng Cộng đồng',
    bio: 'Cử nhân Kinh tế Nông nghiệp, tâm huyết xây dựng cộng đồng nông dân số và kết nối người nông dân với công nghệ.',
    initials: 'MC', color: 'bg-sky-100 text-sky-700',
  },
];

const VALUES = [
  { icon: 'verified',      title: 'Chất lượng',   desc: 'Mọi sản phẩm đều được kiểm định nguồn gốc và chứng nhận an toàn trước khi đến tay người dùng.'  },
  { icon: 'eco',           title: 'Bền vững',      desc: 'Ưu tiên các giải pháp thân thiện môi trường, giảm thiểu hoá chất độc hại trong canh tác.'        },
  { icon: 'support_agent', title: 'Hỗ trợ 24/7',  desc: 'Đội ngũ kỹ thuật viên sẵn sàng tư vấn miễn phí qua hotline, chat và diễn đàn mọi lúc.'           },
  { icon: 'local_shipping', title: 'Giao hàng nhanh', desc: 'Hệ thống kho vận toàn quốc, giao hàng trong 24–48h cho vùng đồng bằng sông Cửu Long và miền Trung.' },
];

const AboutPage = () => (
  <CustomerLayout>

    {/* ── Hero ─────────────────────────────────────────────────── */}
    <section
      className="relative flex min-h-[420px] flex-col items-center justify-center gap-6 bg-cover bg-center p-4"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%), url("https://picsum.photos/seed/about-hero/1440/600")',
      }}
    >
      <div className="flex flex-col gap-3 text-center max-w-3xl z-10">
        <span className="inline-flex self-center items-center gap-2 px-3 py-1 rounded-full bg-primary/90 text-[#101b0d] text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">spa</span>
          Nông nghiệp xanh
        </span>
        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
          Đồng hành cùng người nông dân Việt Nam
        </h1>
        <p className="text-gray-200 text-lg md:text-xl font-medium leading-relaxed">
          Chúng tôi kết nối kiến thức, sản phẩm và cộng đồng để giúp mỗi người nông dân canh tác hiệu quả, bền vững và an toàn hơn mỗi ngày.
        </p>
      </div>
    </section>

    <div className="w-full px-4 md:px-10 lg:px-20 xl:px-40 py-16 flex flex-col gap-20">

      {/* ── Sứ mệnh ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9f3e7] dark:bg-[#1a2e16] w-fit">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wide text-[#2E7D32] dark:text-primary">Sứ mệnh của chúng tôi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#101b0d] dark:text-white leading-tight">
            Hiện đại hoá nông nghiệp Việt Nam từ<span className="text-[#2E7D32] dark:text-primary"> gốc rễ</span>
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Nông nghiệp xanh được thành lập với niềm tin rằng mỗi người nông dân đều xứng đáng được tiếp cận sản phẩm chất lượng cao, kiến thức chuyên môn và cộng đồng hỗ trợ — bất kể họ canh tác ở đâu trên đất nước Việt Nam.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Chúng tôi tin vào sức mạnh của công nghệ trong việc rút ngắn khoảng cách giữa nghiên cứu khoa học và thực tiễn đồng ruộng, giữa nhà cung cấp và người tiêu dùng cuối, giữa chuyên gia và nông dân.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              to="/san-pham"
              className="flex items-center gap-2 h-11 px-6 rounded-lg bg-primary hover:bg-[#3ed622] text-[#101b0d] font-bold transition-colors"
            >
              Khám phá cửa hàng
            </Link>
            <Link
              to="/dien-dan"
              className="flex items-center gap-2 h-11 px-6 rounded-lg border border-[#d3e7cf] dark:border-[#3a5c35] text-[#2E7D32] dark:text-primary hover:bg-[#e9f3e7] dark:hover:bg-[#1a2e16] font-bold transition-colors"
            >
              Diễn đàn
            </Link>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-200 dark:bg-[#1c3019]">
          <img
            src="https://picsum.photos/seed/about-mission/800/600"
            alt="Nông dân làm việc trên đồng ruộng"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ── Số liệu ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map(s => (
          <div key={s.label} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] text-center shadow-sm">
            <div className="size-12 rounded-xl bg-[#e9f3e7] dark:bg-[#1a2e16] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[24px]">{s.icon}</span>
            </div>
            <span className="text-3xl font-black text-[#101b0d] dark:text-white">{s.value}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Dịch vụ ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-black text-[#101b0d] dark:text-white">Ba trụ cột của chúng tôi</h2>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto">
            Hệ sinh thái toàn diện giúp người nông dân có đầy đủ công cụ từ mua sắm đến học hỏi và kết nối.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map(sv => (
            <div key={sv.title} className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] shadow-sm hover:shadow-md transition-shadow">
              <div className={`size-12 rounded-xl flex items-center justify-center ${sv.color.split(' ').slice(0, 2).join(' ')}`}>
                <span className={`material-symbols-outlined text-[24px] ${sv.color.split(' ').slice(2).join(' ')}`}>{sv.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-[#101b0d] dark:text-white">{sv.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{sv.desc}</p>
              <Link to={sv.link} className="text-base font-bold text-primary hover:text-[#3dd122] flex items-center gap-1 transition-colors">
                {sv.linkLabel} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Giá trị cốt lõi ──────────────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[#101b0d] dark:text-white">Giá trị cốt lõi</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(v => (
            <div key={v.title} className="flex flex-col gap-3 p-5 rounded-xl bg-[#e9f3e7]/50 dark:bg-[#1a2e16] border border-[#d3e7cf] dark:border-[#2a4524]">
              <span className="material-symbols-outlined text-[#2E7D32] dark:text-primary text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                {v.icon}
              </span>
              <h4 className="text-base font-bold text-[#101b0d] dark:text-white">{v.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Đội ngũ ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-[#101b0d] dark:text-white">Đội ngũ sáng lập</h2>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2">Những người đặt nền móng cho Nông nghiệp xanh</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TEAM.map(m => (
            <div key={m.name} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-[#132210] border border-[#d3e7cf] dark:border-[#2a4524] shadow-sm text-center">
              <div className={`size-20 rounded-full flex items-center justify-center text-2xl font-black ${m.color}`}>
                {m.initials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101b0d] dark:text-white">{m.name}</h3>
                <p className="text-sm font-medium text-[#2E7D32] dark:text-primary mt-0.5">{m.role}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-[#e9f3e7] dark:bg-[#1a2e16] border border-[#d3e7cf] dark:border-[#2a4524] overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 p-10 md:p-14">
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-[#101b0d] dark:text-white">
              Cùng nhau xây dựng nền nông nghiệp bền vững
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              Tham gia cộng đồng Nông nghiệp xanh — chia sẻ kinh nghiệm, học hỏi từ chuyên gia và tiếp cận hàng trăm sản phẩm chất lượng.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <Link
                to="/dang-ky"
                className="flex items-center gap-2 h-12 px-8 rounded-lg bg-[#101b0d] dark:bg-white text-white dark:text-[#101b0d] font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                Đăng ký miễn phí
              </Link>
              <Link
                to="/dien-dan"
                className="flex items-center gap-2 h-12 px-6 rounded-lg border-2 border-[#101b0d] dark:border-white text-[#101b0d] dark:text-white font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Vào diễn đàn
              </Link>
            </div>
          </div>
          <div className="w-full md:w-56 h-40 md:h-56 rounded-2xl overflow-hidden bg-gray-200 shrink-0">
            <img
              src="https://picsum.photos/seed/about-cta/400/400"
              alt="Cộng đồng nông nghiệp"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  </CustomerLayout>
);

export default AboutPage;
