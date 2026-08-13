// LaLiga Sports — Admin panel shared logic
window.LLadmin = (function () {
  const { I, el, $, $$, toast, formatPersianPrice, formatFaDate } = LLutil;

  // Extra icon for content management
  const iconContent = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>';
  const iconMenu = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';

  function renderSidebar(active) {
    const items = [
      { icon: I.dashboard, label: 'داشبورد', path: '/admin/dashboard.html', id: 'dashboard' },
      { icon: I.package, label: 'محصولات', path: '/admin/products.html', id: 'products' },
      { icon: I.tag, label: 'دسته‌بندی‌ها', path: '/admin/categories.html', id: 'categories' },
      { icon: I.file, label: 'وبلاگ', path: '/admin/blog.html', id: 'blog' },
      { icon: I.tag, label: 'پیشنهادات', path: '/admin/offers.html', id: 'offers' },
      { icon: iconContent, label: 'محتوای سایت', path: '/admin/content.html', id: 'content' },
      { icon: I.settings, label: 'تنظیمات', path: '/admin/settings.html', id: 'settings' }
    ];
    const sidebarEl = el(`
      <aside class="admin-sidebar" id="admin-sidebar" role="navigation" aria-label="منوی مدیریت">
        <div class="brand">
          <a href="/home.html" class="logo" aria-label="لالیگا اسپرت Admin"><span class="bubble" aria-hidden="true">L</span>LaLiga <span class="sports" style="font-size:.9rem">Admin</span></a>
          <button class="sidebar-close btn btn-ghost btn-icon" id="sidebar-close" aria-label="بستن منو">✕</button>
        </div>
        <nav>
          ${items.map(it => `<a href="${it.path}" class="${it.id === active ? 'active' : ''}" aria-current="${it.id === active ? 'page' : 'false'}">${it.icon}<span>${it.label}</span></a>`).join('')}
        </nav>
        <div class="logout">
          <button class="btn btn-danger btn-block" id="admin-logout" aria-label="خروج از سیستم">${I.logout} خروج از سیستم</button>
        </div>
      </aside>
    `);
    document.body.prepend(sidebarEl);

    // Mobile top bar
    const topBar = el(`
      <div class="admin-topbar" id="admin-topbar" role="banner">
        <button class="btn btn-ghost btn-icon" id="sidebar-open" aria-label="باز کردن منو" aria-expanded="false" aria-controls="admin-sidebar">${iconMenu}</button>
        <a href="/home.html" class="logo" aria-label="لالیگا اسپرت"><span class="bubble" aria-hidden="true" style="width:26px;height:26px;font-size:.85rem">L</span>Admin</a>
        <div></div>
      </div>
    `);
    document.body.prepend(topBar);

    // Overlay for mobile
    const overlay = el('<div class="sidebar-overlay" id="sidebar-overlay" aria-hidden="true"></div>');
    document.body.append(overlay);

    const sidebar = document.getElementById('admin-sidebar');
    const openBtn = document.getElementById('sidebar-open');

    openBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
      openBtn.setAttribute('aria-expanded', 'true');
      // Focus first nav link for keyboard accessibility
      setTimeout(() => sidebar.querySelector('nav a')?.focus(), 50);
    });
    const closeMenu = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      openBtn.setAttribute('aria-expanded', 'false');
    };
    document.getElementById('sidebar-close').addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeMenu();
    });

    document.getElementById('admin-logout').addEventListener('click', () => {
      LL.auth.logout(); location.href = '/admin/login.html';
    });
  }

  async function bootstrap(active) {
    const user = await LLbackend.me();
    if (!user) {
      if (!window.location.pathname.endsWith('/admin/login.html')) {
        window.location.href = '/admin/login.html';
      }
      return;
    }
    window.__llAdminUser = user;
    renderSidebar(active);
  }

  // ---- Modal helper (animated) ----
  let _closeTimer = null;

  function openModal(html, wide = false) {
    // Clear any pending close
    if (_closeTimer) { clearTimeout(_closeTimer); _closeTimer = null; }

    let bd = $('.modal-backdrop');
    if (!bd) {
      bd = el('<div class="modal-backdrop" role="dialog" aria-modal="true"></div>');
      document.body.append(bd);
    }
    bd.classList.remove('closing', 'open');
    bd.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" tabindex="-1">${html}</div>`;

    // Force reflow so the animation runs fresh
    void bd.offsetWidth;

    bd.classList.add('open');
    bd.addEventListener('click', (e) => { if (e.target === bd) closeModal(); }, { once: true });

    // Focus first focusable element in modal
    requestAnimationFrame(() => {
      const focusable = bd.querySelector('input, textarea, select, button:not([disabled]), [tabindex="0"]');
      focusable?.focus();
    });

    // Trap focus inside modal
    bd.addEventListener('keydown', trapFocus);

    return bd.querySelector('.modal');
  }

  function closeModal() {
    const bd = $('.modal-backdrop');
    if (!bd || !bd.classList.contains('open')) return;

    bd.classList.add('closing');
    _closeTimer = setTimeout(() => {
      bd.classList.remove('open', 'closing');
      bd.removeEventListener('keydown', trapFocus);
      _closeTimer = null;
    }, 220);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const bd = $('.modal-backdrop');
    if (!bd) return;
    const focusable = Array.from(bd.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // Image upload helper — posts to /api/upload, returns url or null
  async function uploadImage(file, onProgress) {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await LLapi.postForm('/api/upload', fd);
      if (res.success) return res.url;
      return null;
    } catch {
      // Fallback: convert to base64 for offline/static mode
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
  }

  // Build upload zone UI
  function makeUploadZone(opts = {}) {
    const { id = 'upload-zone', label = 'آپلود تصویر', accept = 'image/*', multiple = false } = opts;
    const zone = el(`
      <div class="upload-zone" id="${id}" role="button" tabindex="0" aria-label="${label}">
        <input type="file" accept="${accept}" ${multiple ? 'multiple' : ''} id="${id}-input" class="upload-input" aria-hidden="true">
        <div class="upload-placeholder">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          <p>${label}</p>
          <span>کلیک کنید یا فایل را اینجا بکشید</span>
        </div>
        <div class="upload-previews" id="${id}-previews"></div>
      </div>
    `);
    const input = zone.querySelector('input');
    const placeholder = zone.querySelector('.upload-placeholder');
    const previews = zone.querySelector('.upload-previews');

    zone.addEventListener('click', (e) => { if (!e.target.closest('.upload-preview-item')) input.click(); });
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('drag-over'); if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event('change')); } });

    return { zone, input, previews, placeholder };
  }

  return { bootstrap, openModal, closeModal, I, el, $, $$, toast, formatPersianPrice, formatFaDate, uploadImage, makeUploadZone };
})();
