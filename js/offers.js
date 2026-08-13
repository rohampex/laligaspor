(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { el, productCard, toFa } = LLutil;
  const offers = await LLbackend.getOffers();
  const grid = document.getElementById('offers-grid');

  if (!offers.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><h3>در حال حاضر پیشنهاد ویژه‌ای نداریم</h3><p>به زودی با تخفیف‌های جدید برمی‌گردیم.</p></div>`;
    document.querySelector('.offer-hero')?.remove();
    return;
  }

  const countdownOffer = offers.find(o => o.countdown?.enabled);
  const cdEl = document.getElementById('countdown');
  if (countdownOffer && cdEl) {
    const hoursMs = (countdownOffer.countdown.hours || 24) * 3600000;
    const KEY = 'll_cd_' + countdownOffer.id;
    let endTime = +localStorage.getItem(KEY);
    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + hoursMs;
      localStorage.setItem(KEY, endTime);
    }
    function tick() {
      let diff = Math.max(0, endTime - Date.now());
      const h = String(Math.floor(diff / 3600e3)).padStart(2, '0'); diff %= 3600e3;
      const m = String(Math.floor(diff / 60e3)).padStart(2, '0'); diff %= 60e3;
      const s = String(Math.floor(diff / 1e3)).padStart(2, '0');
      cdEl.textContent = `${h}:${m}:${s}`;
    }
    tick();
    setInterval(tick, 1000);
  } else if (cdEl) {
    document.querySelector('.countdown-box')?.style && (document.querySelector('.countdown-box').style.display = 'none');
  }

  const imageFor = (offer) => {
    if (offer.imageUrl) return offer.imageUrl;
    if (!Array.isArray(offer.products) || !offer.products.length) return '';
    const first = offer.products[0];
    if (typeof first.images?.[0] === 'string') return first.images[0];
    return first.images?.[0]?.path || '';
  };

  offers.forEach((o, i) => {
    const hasProducts = Array.isArray(o.products) && o.products.length > 0;
    const card = el(`
      <article class="offer-card" style="animation-delay:${i * 100}ms" data-anim="fade-up">
        <div class="banner">
          <img src="${imageFor(o)}" alt="${o.title}" loading="lazy">
          <div class="banner-body">
            <span class="pct-tag">${toFa(o.discountPercent)}٪ تخفیف</span>
            <h3>${o.title}</h3>
          </div>
        </div>
        <div class="content">
          <p>${o.description || ''}</p>
          ${hasProducts ? `
            <div class="product-slot">
              <h4>محصولات شامل این آفر:</h4>
              <div class="offer-carousel-wrap">
                <div class="offer-carousel" id="carousel-${o.id}"></div>
                ${o.products.length > 1 ? `
                  <div class="carousel-controls">
                    <button class="carousel-btn prev-btn" data-id="${o.id}" aria-label="قبلی">&#8249;</button>
                    <div class="carousel-dots" id="dots-${o.id}"></div>
                    <button class="carousel-btn next-btn" data-id="${o.id}" aria-label="بعدی">&#8250;</button>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </article>
    `);
    grid.append(card);

    if (!hasProducts) return;

    const carouselEl = document.getElementById('carousel-' + o.id);
    const dotsEl = document.getElementById('dots-' + o.id);

    o.products.forEach((p, idx) => {
      const slide = el(`<div class="carousel-slide" data-slide-idx="${idx}"></div>`);
      slide.append(productCard(p, idx));
      carouselEl.append(slide);
    });

    if (o.products.length <= 1) return;

    o.products.forEach((_, idx) => {
      const dot = el(`<button class="carousel-dot ${idx === 0 ? 'active' : ''}" data-dot="${idx}" aria-label="اسلاید ${idx + 1}"></button>`);
      dot.addEventListener('click', () => goTo(idx));
      dotsEl.append(dot);
    });

    let current = 0;
    let autoplayTimer = null;
    let touchStartX = 0;

    function goTo(idx) {
      current = (idx + o.products.length) % o.products.length;
      carouselEl.style.transform = `translateX(${current * 100}%)`;
      document.querySelectorAll(`#dots-${o.id} .carousel-dot`).forEach((d, ii) => d.classList.toggle('active', ii === current));
    }

    function startAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goTo(current + 1), 3500);
    }

    card.querySelector(`.prev-btn`)?.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    card.querySelector(`.next-btn`)?.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

    carouselEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; clearInterval(autoplayTimer); }, { passive: true });
    carouselEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
      startAutoplay();
    });

    startAutoplay();
  });
})();
