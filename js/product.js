(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { I, productCard, el, $, $$, formatPersianPrice } = LLutil;

  const slug = new URLSearchParams(location.search).get('slug');
  const root = $('#product-root');
  let product = null;

  try {
    product = await LLbackend.getProductBySlug(slug);
  } catch (error) {
    product = null;
  }

  if (!product) {
    root.innerHTML = `<div class="empty"><h3>محصول یافت نشد</h3><a class="btn btn-outline" href="/products.html">بازگشت به محصولات</a></div>`;
    return;
  }

  const categories = await LLbackend.getCategories();
  const cat = categories.find(c => c.slug === product.category);

  function normalizeSC(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (item == null) return null;
      if (typeof item === 'string') {
        return { value: item, available: true };
      }
      if (item.value !== undefined) {
        return { value: item.value, available: item.available !== false };
      }
      return { value: item.size || item.color || '', available: item.is_available !== false };
    }).filter(Boolean);
  }

  const images = Array.isArray(product.images)
    ? product.images.map(img => (typeof img === 'string' ? img : img.path || '')).filter(Boolean)
    : [];
  const sizes = normalizeSC(product.sizes || []);
  const colors = normalizeSC(product.colors || []);

  const settings = LL.getSettings();
  let activeImage = 0;
  let selectedSize = null;
  let selectedColor = null;
  let isFav = LL.favorites.has(product.id);

  const sizesHtml = sizes.length ? `
    <div class="pd-section-label">${I.ruler}<span>سایز را انتخاب کنید</span></div>
    <div class="chip-group" id="size-group">
      ${sizes.map(s => `
        <button class="chip ${s.available ? '' : 'chip-unavailable'}" data-size="${s.value}" ${s.available ? '' : 'disabled title="ناموجود"'}>${s.value}${s.available ? '' : '<span class="chip-sold-out">ناموجود</span>'}</button>
      `).join('')}
    </div>` : '';

  const colorsHtml = colors.length ? `
    <div class="pd-section-label"><span>رنگ‌بندی</span></div>
    <div class="chip-group" id="color-group">
      ${colors.map(c => `
        <button class="chip ${c.available ? '' : 'chip-unavailable'}" data-color="${c.value}" ${c.available ? '' : 'disabled title="ناموجود"'}>${c.value}${c.available ? '' : '<span class="chip-sold-out">ناموجود</span>'}</button>
      `).join('')}
    </div>` : '';

  root.innerHTML = `
    <div class="breadcrumb">
      <a href="/home.html">خانه</a> ${I.chev}
      <a href="/products.html">محصولات</a> ${I.chev}
      ${cat ? `<a href="/products.html?category=${cat.slug}">${cat.name}</a> ${I.chev}` : ''}
      <span style="color:#fff">${product.name}</span>
    </div>
    <div class="pd-grid">
      <div class="pd-gallery">
        <div class="pd-main-img" id="pd-main-wrap">
          <img id="pd-img" src="${images[0] || ''}" alt="${product.name}" loading="eager">
          ${images.length > 1 ? `
            <button class="pd-arrow pd-arrow-prev" id="pd-prev" aria-label="قبلی">&#8250;</button>
            <button class="pd-arrow pd-arrow-next" id="pd-next" aria-label="بعدی">&#8249;</button>
          ` : ''}
        </div>
        ${images.length > 1 ? `
          <div class="pd-thumbs" id="pd-thumbs">
            ${images.map((im, i) => `
              <button class="${i === 0 ? 'active' : ''}" data-idx="${i}">
                <img src="${im}" alt="" loading="lazy">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="pd-info">
        <h1>${product.name}</h1>
        ${product.discountPercent ? `<div class="badge badge-discount" style="position:static;display:inline-block;margin-bottom:.75rem">${LLutil.toFa(product.discountPercent)}٪ تخفیف</div>` : ''}
        <div class="pd-price-row">
          <span class="pd-price">${formatPersianPrice(product.price)}</span>
          ${product.originalPrice && product.originalPrice > product.price ? `<span class="pd-old">${formatPersianPrice(product.originalPrice)}</span>` : ''}
        </div>
        <p class="pd-desc">${product.description || 'توضیحی برای این محصول ثبت نشده است.'}</p>
        ${sizesHtml}
        ${colorsHtml}
        <div class="pd-cta">
          <a id="wa-btn" href="#" target="_blank" rel="noreferrer" class="btn btn-primary btn-lg">${I.wa} سفارش با واتساپ</a>
          <a href="https://instagram.com/${settings.instagram}" target="_blank" rel="noreferrer" class="btn btn-glass btn-lg">${I.ig} اینستاگرام</a>
          <button id="fav-btn" class="btn btn-outline btn-icon" aria-label="افزودن به علاقه‌مندی" style="width:56px;height:56px">${I.heart}</button>
          <button id="share-btn" class="btn btn-outline btn-icon" aria-label="اشتراک‌گذاری" style="width:56px;height:56px">${I.share}</button>
        </div>
        <div class="pd-trust-row mt-8">
          <div class="pd-trust-item">${I.shield}<div><strong>ضمانت اصالت</strong><div class="text-muted">تضمین اورجینال بودن</div></div></div>
          <div class="pd-trust-item">${I.truck}<div><strong>ارسال سریع</strong><div class="text-muted">به سراسر کشور</div></div></div>
        </div>
      </div>
    </div>
  `;

  const pdImg = $('#pd-img');
  function goToImage(idx) {
    activeImage = (idx + images.length) % images.length;
    pdImg.classList.add('fade-transition');
    pdImg.src = images[activeImage] || '';
    pdImg.addEventListener('load', () => pdImg.classList.remove('fade-transition'), { once: true });
    $$('#pd-thumbs button').forEach(b => b.classList.toggle('active', +b.dataset.idx === activeImage));
  }

  $$('#pd-thumbs button').forEach(b => b.addEventListener('click', () => goToImage(+b.dataset.idx)));
  $('#pd-prev')?.addEventListener('click', () => goToImage(activeImage - 1));
  $('#pd-next')?.addEventListener('click', () => goToImage(activeImage + 1));

  let touchStartX = 0;
  const pdWrap = $('#pd-main-wrap');
  pdWrap?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  pdWrap?.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goToImage(diff > 0 ? activeImage + 1 : activeImage - 1);
  });

  $$('#size-group button:not([disabled])').forEach(b => b.addEventListener('click', () => {
    $$('#size-group button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); selectedSize = b.dataset.size; updateWA();
  }));
  $$('#color-group button:not([disabled])').forEach(b => b.addEventListener('click', () => {
    $$('#color-group button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); selectedColor = b.dataset.color; updateWA();
  }));

  const favBtn = $('#fav-btn');
  if (isFav) favBtn.style.color = '#ff3355';
  favBtn.addEventListener('click', () => {
    LL.favorites.toggle(product.id);
    isFav = !isFav;
    favBtn.style.color = isFav ? '#ff3355' : '';
    LLutil.toast(isFav ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
  });

  $('#share-btn').addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url: location.href }); } catch {};
    } else {
      navigator.clipboard?.writeText(location.href);
      LLutil.toast('لینک کپی شد');
    }
  });

  function updateWA() {
    const msg = encodeURIComponent(`سلام، برای سفارش محصول "${product.name}" تماس می‌گیرم.\nکد محصول: ${product.id}\nسایز: ${selectedSize || 'مشخص نشده'}\nرنگ: ${selectedColor || 'مشخص نشده'}\nلینک: ${location.href}`);
    $('#wa-btn').href = `https://wa.me/${settings.whatsapp}?text=${msg}`;
  }
  updateWA();

  const related = (await LLbackend.getProducts({ category: product.category, limit: 8 })).filter(p => p.id !== product.id).slice(0, 4);
  if (related.length) {
    $('#related-wrap').style.display = 'block';
    related.forEach((p, i) => $('#related-grid').append(productCard(p, i)));
  }

  document.title = `${product.name} | لالیگا اسپرت`;
})();
