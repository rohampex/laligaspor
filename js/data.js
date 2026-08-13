// LaLiga Sports — backend API wrapper + client-side favorites

const DEFAULT_SETTINGS = {
  siteName: 'LaLiga Sports',
  footerText: 'بزرگترین و معتبرترین فروشگاه آنلاین لباس و تجهیزات ورزشی. ارائه‌دهنده جدیدترین کیت‌های باشگاهی و ملی با بالاترین کیفیت.',
  whatsapp: '989120000000',
  telegram: 'laligasports',
  instagram: 'laligasports',
  contactEmail: 'info@laligasports.ir',
  address: 'تهران، خیابان ولیعصر، نبش کوچه اسپرت، پلاک ۱۲',
  businessHours: 'شنبه تا پنجشنبه، ۱۰ صبح تا ۹ شب',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.8!2d51.401!3d35.734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQ0JzAyLjQiTiA1McKwMjQnMDMuNiJF!5e0!3m2!1sen!2sus!4v1'
};

const KEYS = {
  favorites: 'll_favorites'
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return JSON.parse(JSON.stringify(fallback));
    }
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function getCsrfToken() {
  if (window.__csrfToken) return window.__csrfToken;
  const res = await LLapi.get('/api/auth/csrf.php');
  window.__csrfToken = res.data.csrfToken;
  return window.__csrfToken;
}

window.LLapi = {
  async request(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...(options.headers || {})
    };
    if (options.method && options.method.toUpperCase() !== 'GET' && options.csrf !== false) {
      headers['X-CSRF-TOKEN'] = await getCsrfToken();
    }
    const opts = {
      credentials: 'same-origin',
      ...options,
      headers
    };
    const response = await fetch(path, opts);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || 'API request failed');
    }
    return json;
  },
  async get(path, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(query ? `${path}?${query}` : path, { method: 'GET' });
  },
  async post(path, body = {}, csrf = true) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      csrf
    });
  },
  async postForm(path, formData, csrf = true) {
    return this.request(path, {
      method: 'POST',
      body: formData,
      csrf
    });
  }
};

window.LLbackend = {
  async login(username, password) {
    return LLapi.post('/api/auth/login.php', { username, password }, false);
  },
  async logout() {
    return LLapi.post('/api/auth/logout.php', {});
  },
  async me() {
    try {
      const res = await LLapi.get('/api/auth/me.php');
      return res.data;
    } catch {
      return null;
    }
  },
  async getSettings() {
    const res = await LLapi.get('/api/settings/get.php');
    window.__llSettings = res.data;
    return res.data;
  },
  async saveSettings(data) {
    return LLapi.post('/api/settings/update.php', data);
  },
  async getCategories(admin = false) {
    const params = admin ? { admin: 1 } : {};
    return LLapi.get('/api/categories/list.php', params).then(res => res.data);
  },
  async getProducts(params = {}) {
    return LLapi.get('/api/products/list.php', params).then(res => res.data);
  },
  async getProductBySlug(slug) {
    return LLapi.get('/api/products/get.php', { slug }).then(res => res.data);
  },
  async getBlogPosts(admin = false) {
    const params = admin ? { admin: 1 } : {};
    return LLapi.get('/api/blog/list.php', params).then(res => res.data);
  },
  async getBlogPostBySlug(slug) {
    return LLapi.get('/api/blog/get.php', { slug }).then(res => res.data);
  },
  async getOffers(admin = false) {
    const params = admin ? { admin: 1 } : {};
    return LLapi.get('/api/offers/list.php', params).then(res => res.data);
  },
  async getContent() {
    const settings = await this.getSettings();
    return {
      hero: {
        backgroundImage: settings.hero?.backgroundImage || '',
        eyebrow: settings.hero?.eyebrow || '',
        title: settings.hero?.title || '',
        titleHighlight: settings.hero?.titleHighlight || '',
        subtitle: settings.hero?.subtitle || '',
        cta1Text: settings.hero?.cta1Text || '',
        cta1Link: settings.hero?.cta1Link || '/products.html',
        cta2Text: settings.hero?.cta2Text || '',
        cta2Link: settings.hero?.cta2Link || '/offers.html'
      },
      homepage: {
        categoriesTitle: settings.homepage?.categoriesTitle || '',
        categoriesSubtitle: settings.homepage?.categoriesSubtitle || '',
        featuredTitle: settings.homepage?.featuredTitle || '',
        featuredSubtitle: settings.homepage?.featuredSubtitle || '',
        promoBanner: {
          enabled: !!settings.homepage?.promoBanner?.enabled,
          image: settings.homepage?.promoBanner?.image || '',
          title: settings.homepage?.promoBanner?.title || '',
          link: settings.homepage?.promoBanner?.link || ''
        }
      }
    };
  },
  async saveContent(data) {
    const payload = {};
    if (data.hero) {
      payload.hero_backgroundImage = data.hero.backgroundImage || '';
      payload.hero_eyebrow = data.hero.eyebrow || '';
      payload.hero_title = data.hero.title || '';
      payload.hero_titleHighlight = data.hero.titleHighlight || '';
      payload.hero_subtitle = data.hero.subtitle || '';
      payload.hero_cta1Text = data.hero.cta1Text || '';
      payload.hero_cta1Link = data.hero.cta1Link || '';
      payload.hero_cta2Text = data.hero.cta2Text || '';
      payload.hero_cta2Link = data.hero.cta2Link || '';
    }
    if (data.homepage) {
      payload.homepage_categoriesTitle = data.homepage.categoriesTitle || '';
      payload.homepage_categoriesSubtitle = data.homepage.categoriesSubtitle || '';
      payload.homepage_featuredTitle = data.homepage.featuredTitle || '';
      payload.homepage_featuredSubtitle = data.homepage.featuredSubtitle || '';
      payload.homepage_promoBanner_enabled = data.homepage.promoBanner?.enabled ? '1' : '0';
      payload.homepage_promoBanner_image = data.homepage.promoBanner?.image || '';
      payload.homepage_promoBanner_title = data.homepage.promoBanner?.title || '';
      payload.homepage_promoBanner_link = data.homepage.promoBanner?.link || '';
    }
    return this.saveSettings(payload);
  },
  async getStats() {
    const [categories, products, blogs, offers] = await Promise.all([
      this.getCategories(true),
      this.getProducts({ admin: 1 }),
      this.getBlogPosts(true),
      this.getOffers(true)
    ]);
    return {
      productsCount: products.length,
      categoriesCount: categories.length,
      blogCount: blogs.length,
      offersCount: offers.filter(o => o.active).length
    };
  },
  async saveProduct(data) {
    return data.id ? LLapi.post('/api/products/update.php', data) : LLapi.post('/api/products/create.php', data);
  },
  async deleteProduct(id) {
    return LLapi.post('/api/products/delete.php', { id });
  },
  async saveCategory(data) {
    return data.id ? LLapi.post('/api/categories/update.php', data) : LLapi.post('/api/categories/create.php', data);
  },
  async deleteCategory(id) {
    return LLapi.post('/api/categories/delete.php', { id });
  },
  async saveBlog(data) {
    return data.id ? LLapi.post('/api/blog/update.php', data) : LLapi.post('/api/blog/create.php', data);
  },
  async deleteBlog(id) {
    return LLapi.post('/api/blog/delete.php', { id });
  },
  async saveOffer(data) {
    return data.id ? LLapi.post('/api/offers/update.php', data) : LLapi.post('/api/offers/create.php', data);
  },
  async deleteOffer(id) {
    return LLapi.post('/api/offers/delete.php', { id });
  }
};

window.LL = {
  getSettings() {
    return window.__llSettings || DEFAULT_SETTINGS;
  },
  favorites: {
    all() { return load(KEYS.favorites, []); },
    has(id) { return this.all().includes(id); },
    toggle(id) {
      const list = this.all();
      const index = list.indexOf(id);
      if (index >= 0) list.splice(index, 1);
      else list.push(id);
      save(KEYS.favorites, list);
      window.dispatchEvent(new CustomEvent('ll:favorites', { detail: list }));
      return list;
    }
  },
  auth: {
    async login(username, password) {
      await LLbackend.login(username, password);
      window.__llAdminUser = await LLbackend.me();
      return true;
    },
    async logout() {
      await LLbackend.logout();
      window.__llAdminUser = null;
    }
  }
};