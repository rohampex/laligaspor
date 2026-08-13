(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { I, productCard, el, $ } = LLutil;

  const [content, cats, featured, news] = await Promise.all([
    LLbackend.getContent(),
    LLbackend.getCategories(),
    LLbackend.getProducts({ featured: true, limit: 4 }),
    LLbackend.getProducts({ new: true, limit: 4 })
  ]);

  const hero = content.hero;
  const hp = content.homepage;

  if (hero.backgroundImage) {
    const bgImg = document.getElementById('hero-bg-img');
    if (bgImg) bgImg.src = hero.backgroundImage;
  }
  const eyebrowText = document.getElementById('hero-eyebrow-text');
  if (eyebrowText && hero.eyebrow) eyebrowText.textContent = hero.eyebrow;

  const titleEl = document.getElementById('hero-title');
  if (titleEl) {
    titleEl.innerHTML = `${hero.title || ''}<br><span class="grad">${hero.titleHighlight || ''}</span>`;
  }
  const subtitleEl = document.getElementById('hero-subtitle');
  if (subtitleEl) subtitleEl.textContent = hero.subtitle || '';

  const cta1 = document.getElementById('hero-cta1');
  if (cta1) {
    cta1.textContent = hero.cta1Text || 'مشاهده کالکشن';
    cta1.href = hero.cta1Link || '/products.html';
  }
  const cta2 = document.getElementById('hero-cta2');
  if (cta2) {
    cta2.textContent = hero.cta2Text || 'تخفیف‌های ویژه';
    cta2.href = hero.cta2Link || '/offers.html';
  }

  const setTxt = (id, val) => {
    const element = document.getElementById(id);
    if (element && val) element.textContent = val;
  };
  setTxt('cats-title', hp.categoriesTitle);
  setTxt('cats-subtitle', hp.categoriesSubtitle);
  setTxt('featured-title', hp.featuredTitle);
  setTxt('featured-subtitle', hp.featuredSubtitle);
  setTxt('new-title', hp.newTitle);
  setTxt('new-subtitle', hp.newSubtitle);

  if (hp.promoBanner?.enabled && hp.promoBanner.image) {
    const banner = document.getElementById('promo-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="container" style="padding-top:1.5rem;padding-bottom:1.5rem">
          <a href="${hp.promoBanner.link || '#'}" class="promo-banner-link">
            <img src="${hp.promoBanner.image}" alt="${hp.promoBanner.title || ''}" loading="lazy" style="width:100%;border-radius:1rem;max-height:200px;object-fit:cover">
            ${hp.promoBanner.title ? `<div class="promo-banner-title">${hp.promoBanner.title}</div>` : ''}
          </a>
        </div>
      `;
    }
  }

  const catsWrap = document.getElementById('home-cats');
  cats.slice(0, 3).forEach((c, i) => {
    const card = el(`
      <a href="/products.html?category=${encodeURIComponent(c.slug)}" class="cat-card" style="animation-delay:${i * 100}ms" data-anim="fade-up">
        <img src="${c.image}" alt="${c.name}" loading="lazy">
        <div class="cat-body">
          <h3>${c.name}</h3>
          <div class="see-all"><span>مشاهده همه</span>${I.arrow}</div>
        </div>
      </a>
    `);
    catsWrap?.append(card);
  });

  const featuredWrap = document.getElementById('home-featured');
  featured.forEach((p, i) => featuredWrap?.append(productCard(p, i)));

  const trust = [
    { icon: I.trophy, title: 'کیفیت اورجینال', text: 'تمامی محصولات دارای بالاترین کیفیت گرید A تایلندی و کاملا مشابه اورجینال هستند.' },
    { icon: I.shield, title: 'ضمانت تعویض', text: 'در صورت عدم رضایت از سایز یا کیفیت، تا ۷ روز امکان تعویض کالا وجود دارد.' },
    { icon: I.truck, title: 'ارسال سریع', text: 'ارسال به سراسر کشور در سریع‌ترین زمان ممکن از طریق پست پیشتاز.' }
  ];
  const trustWrap = document.getElementById('home-trust');
  trust.forEach((t, i) => {
    trustWrap?.append(el(`
      <div class="trust-card" style="animation-delay:${i * 100}ms" data-anim="fade-up">
        <div class="icon-round">${t.icon}</div>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </div>
    `));
  });

  const newWrap = document.getElementById('home-new');
  news.forEach((p, i) => newWrap?.append(productCard(p, i)));
})();
