// LaLiga Sports — shared utilities: formatting, icons, header/footer render, product card, toast

window.LLutil = (function() {
  // Persian digits
  const toFa = (s) => String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  function formatPersianPrice(n) {
    if (n == null) return '';
    const withCommas = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return toFa(withCommas) + ' تومان';
  }

  function formatFaDate(iso) {
    try {
      const d = new Date(iso);
      const m = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];
      return toFa(d.getDate()) + ' ' + m[d.getMonth()] + ' ' + toFa(d.getFullYear());
    } catch { return ''; }
  }

  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ------ Inline SVG icons (lucide-inspired) ------
  const I = {
    heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    file: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    mappin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>',
    ig: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4C7.72 4 4.2 7.52 4.2 11.85c0 1.38.36 2.73 1.05 3.92L4.13 20l4.35-1.14a7.86 7.86 0 0 0 3.57.86h.01c4.33 0 7.85-3.52 7.85-7.85 0-2.1-.82-4.07-2.31-5.55zm-5.55 12.08a6.52 6.52 0 0 1-3.32-.91l-.24-.14-2.58.68.69-2.51-.16-.26a6.52 6.52 0 0 1-1-3.42c0-3.6 2.93-6.52 6.52-6.52 1.74 0 3.38.68 4.61 1.91a6.5 6.5 0 0 1 1.91 4.61c0 3.6-2.93 6.52-6.52 6.52zm3.58-4.88c-.2-.1-1.16-.57-1.34-.63-.18-.07-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.23.15-.43.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.11.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.07-.61-1.46-.16-.38-.32-.33-.44-.34l-.38-.01c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.65 0 .97.71 1.92.81 2.05.1.13 1.4 2.13 3.4 2.99.47.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.16-.47 1.33-.93.16-.46.16-.85.11-.93-.05-.09-.18-.14-.38-.24z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.94 4.11 18.68 19.5c-.24 1.09-.89 1.35-1.8.84l-4.98-3.67-2.4 2.31c-.27.27-.49.49-1 .49l.36-5.07 9.24-8.35c.4-.36-.09-.55-.62-.2L6.05 12.9l-4.92-1.54c-1.07-.33-1.09-1.07.22-1.58L20.65 3.16c.89-.32 1.67.22 1.29 1.95z"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    share: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    logout: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    package: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M7.5 4.27 16.5 9.73"/></svg>',
    tag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>',
    image: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'
  };

  // ------ Lazy image fade-in ------
  function initLazyImages(root) {
    const imgs = (root || document).querySelectorAll('img[loading="lazy"]');
    imgs.forEach(img => {
      if (img.complete && img.naturalWidth) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
      }
    });
  }

  // ------ Skeleton helpers ------
  function skeletonProductGrid(count, container) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      container.append(el(`
        <div class="skeleton-card">
          <div class="sk-img skeleton"></div>
          <div class="sk-title skeleton"></div>
          <div class="sk-price skeleton"></div>
        </div>
      `));
    }
  }

  function skeletonBlogGrid(count, container) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      container.append(el(`
        <div class="skeleton-blog">
          <div class="sk-img skeleton"></div>
          <div class="sk-line wide skeleton"></div>
          <div class="sk-line med skeleton"></div>
          <div class="sk-line short skeleton"></div>
        </div>
      `));
    }
  }

  // ------ Header / Footer / Mobile nav (RENDER) ------
  function renderHeader(activePath) {
    const links = [
      { name: 'خانه', path: '/home.html', match: ['/home.html','/','/index.html'] },
      { name: 'محصولات', path: '/products.html', match: ['/products.html','/product.html'] },
      { name: 'پیشنهادات ویژه', path: '/offers.html', match: ['/offers.html'] },
      { name: 'وبلاگ', path: '/blog.html', match: ['/blog.html','/article.html'] },
      { name: 'تماس با ما', path: '/contact.html', match: ['/contact.html'] }
    ];
    const path = activePath || location.pathname;
    const linksHtml = links.map(l => `<a href="${l.path}" class="${l.match.includes(path)?'active':''}">${l.name}</a>`).join('');
    const favCount = LL.favorites.all().length;
    const header = el(`
      <header class="header" id="site-header" role="banner">
        <div class="container nav-inner">
          <a href="/home.html" class="logo" aria-label="لالیگا اسپرت - صفحه اصلی">
            <span class="bubble" aria-hidden="true">L</span>
            LaLiga <span class="sports">Sports</span>
          </a>
          <nav class="nav-links" aria-label="ناوبری اصلی">${linksHtml}</nav>
          <div class="nav-actions">
            <a href="/favorites.html" class="btn btn-ghost btn-icon" aria-label="علاقه‌مندی‌ها${favCount>0?' ('+favCount+' مورد)':''}">${I.heart}${favCount>0?'<span class="dot-badge" aria-hidden="true"></span>':''}</a>
            <a href="/admin/login.html" class="btn btn-ghost btn-icon" aria-label="ورود به پنل مدیریت">${I.user}</a>
          </div>
        </div>
      </header>
    `);
    document.body.prepend(header);
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
      header.classList.toggle('glass-panel-heavy', window.scrollY > 20);
    }, { passive: true });
  }

  function renderMobileNav(activePath) {
    const path = activePath || location.pathname;
    if (path.startsWith('/admin')) return;
    const favCount = LL.favorites.all().length;
    const items = [
      { path:'/home.html', icon: I.home, label:'خانه', match:['/home.html','/'] },
      { path:'/products.html', icon: I.grid, label:'محصولات', match:['/products.html','/product.html'] },
      { path:'/favorites.html', icon: I.heart, label:'علاقه‌مندی', match:['/favorites.html'], count: favCount },
      { path:'/blog.html', icon: I.file, label:'وبلاگ', match:['/blog.html','/article.html'] },
      { path:'/contact.html', icon: I.phone, label:'تماس', match:['/contact.html'] }
    ];
    const html = items.map(it => `
      <a href="${it.path}" class="${it.match.includes(path)?'active':''}" aria-label="${it.label}">
        ${it.icon}
        ${it.count ? '<span class="count-dot" aria-hidden="true"></span>' : ''}
      </a>
    `).join('');
    document.body.append(el(`<nav class="mobile-nav" aria-label="ناوبری موبایل">${html}</nav>`));
  }

  function renderFooter() {
    const s = LL.getSettings();
    const y = new Date().getFullYear();
    const footer = el(`
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid" data-reveal>
            <div>
              <a href="/home.html" class="logo mb-4" aria-label="لالیگا اسپرت"><span class="bubble" aria-hidden="true">L</span>LaLiga <span class="sports">Sports</span></a>
              <p class="mt-4">${s.footerText}</p>
              <div class="social" role="list" aria-label="شبکه‌های اجتماعی">
                <a href="https://instagram.com/${s.instagram}" target="_blank" rel="noreferrer" aria-label="اینستاگرام" role="listitem">${I.ig}</a>
                <a href="https://wa.me/${s.whatsapp}" target="_blank" rel="noreferrer" aria-label="واتساپ" role="listitem">${I.wa}</a>
                <a href="https://t.me/${s.telegram}" target="_blank" rel="noreferrer" aria-label="تلگرام" role="listitem">${I.tg}</a>
              </div>
            </div>
            <div>
              <h3>دسترسی سریع</h3>
              <ul>
                <li><a href="/products.html">محصولات</a></li>
                <li><a href="/offers.html">پیشنهادات ویژه</a></li>
                <li><a href="/blog.html">وبلاگ</a></li>
                <li><a href="/contact.html">تماس با ما</a></li>
              </ul>
            </div>
            <div>
              <h3>دسته‌بندی‌ها</h3>
              <ul>
                <li><a href="/products.html?category=club">پیراهن باشگاهی</a></li>
                <li><a href="/products.html?category=national">پیراهن ملی</a></li>
                <li><a href="/products.html?category=classic">کیت‌های کلاسیک</a></li>
                <li><a href="/products.html?category=kids">کلکسیون کودکان</a></li>
              </ul>
            </div>
            <div>
              <h3>اطلاعات تماس</h3>
              <div class="contact-item" role="group" aria-label="آدرس">${I.mappin}<span>${s.address}</span></div>
              <div class="contact-item" role="group" aria-label="ایمیل">${I.mail}<span dir="ltr">${s.contactEmail}</span></div>
              <div class="contact-item" role="group" aria-label="تلفن">${I.phone}<span dir="ltr">${s.whatsapp}</span></div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>تمامی حقوق برای فروشگاه لالیگا اسپرت محفوظ است. © ${toFa(y)}</p>
          </div>
        </div>
      </footer>
    `);
    document.body.append(footer);
  }

  function layout() {
    renderHeader();
    renderFooter();
    renderMobileNav();
    // Kick off lazy image watcher after layout
    requestAnimationFrame(initLazyImages);
    window.addEventListener('ll:favorites', () => {
      // rerender header + mobile bar counts
      $('#site-header')?.remove();
      $('.mobile-nav')?.remove();
      renderHeader();
      renderMobileNav();
    });
  }

  // ------ Product card ------
  function productCard(p, index=0) {
    const oos = p.stock === 0;
    const fav = LL.favorites.has(p.id);
    let badge = '';
    if (oos) badge = `<div class="badge badge-out" aria-label="ناموجود">ناموجود</div>`;
    else if (p.discountPercent) badge = `<div class="badge badge-discount" aria-label="${toFa(p.discountPercent)} درصد تخفیف">${toFa(p.discountPercent)}٪ تخفیف</div>`;
    else if (p.isFeatured) badge = `<div class="badge badge-feature">${I.star} ویژه</div>`;
    else if (p.isNew) badge = `<div class="badge badge-new">جدید</div>`;

    const link = oos ? '#' : `/product.html?slug=${encodeURIComponent(p.slug)}`;
    const img1 = p.images?.[0] || 'https://picsum.photos/seed/x/500/625';
    const img2 = p.images?.[1] || '';

    const div = el(`
      <div class="product-card ${oos?'out-of-stock':''}" data-anim="fade-up" data-reveal-delay="${index*80}">
        <a href="${link}" ${oos?'onclick="return false" aria-disabled="true"':''} aria-label="${p.name}${oos?' — ناموجود':''}">
          <div class="p-img-wrap">
            ${badge}
            ${oos ? '' : `<button class="fav-btn ${fav?'active':''}" data-fav="${p.id}" aria-label="${fav?'حذف از':'افزودن به'} علاقه‌مندی: ${p.name}" aria-pressed="${fav}">${I.heart}</button>`}
            <img class="primary" src="${img1}" alt="${p.name}" loading="lazy">
            ${img2 && !oos ? `<img class="secondary" src="${img2}" alt="${p.name} - تصویر دوم" aria-hidden="true">` : ''}
            ${oos ? '' : `<div class="p-quick" aria-hidden="true"><div class="quick-btn">مشاهده سریع</div></div>`}
          </div>
        </a>
        <a href="${link}" ${oos?'onclick="return false" aria-disabled="true"':''}><h3>${p.name}</h3></a>
        <div class="p-price-row" aria-label="قیمت">
          ${oos
            ? '<span class="p-old" style="text-decoration:none">ناموجود</span>'
            : `<span class="p-price">${formatPersianPrice(p.price)}</span>
               ${p.originalPrice && p.originalPrice > p.price ? `<span class="p-old" aria-label="قیمت قبلی">${formatPersianPrice(p.originalPrice)}</span>` : ''}`}
        </div>
      </div>
    `);
    // Lazy image init
    div.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
      if (img.complete && img.naturalWidth) img.classList.add('loaded');
    });
    div.querySelector('[data-fav]')?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      LL.favorites.toggle(p.id);
      const btn = e.currentTarget;
      btn.classList.toggle('active');
      btn.setAttribute('aria-pressed', btn.classList.contains('active'));
    });
    return div;
  }

  // ------ Toast ------
  function toast(title, description, type='ok') {
    let wrap = $('.toast-wrap');
    if (!wrap) { wrap = el('<div class="toast-wrap" role="region" aria-live="polite" aria-label="اعلان‌ها"></div>'); document.body.append(wrap); }
    const t = el(`<div class="toast ${type==='err'?'err':''}" role="alert"><strong>${title}</strong>${description?`<small>${description}</small>`:''}</div>`);
    wrap.append(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(16px)';
      t.style.transition = 'opacity .3s, transform .3s';
      setTimeout(() => t.remove(), 310);
    }, 3000);
  }

  return { toFa, formatPersianPrice, formatFaDate, el, $, $$, I, layout, productCard, toast, renderHeader, renderFooter, renderMobileNav, skeletonProductGrid, skeletonBlogGrid, initLazyImages };
})();
