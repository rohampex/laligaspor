(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { productCard, el } = LLutil;

  async function render() {
    const ids = LL.favorites.all();
    const products = await LLbackend.getProducts({ limit: 100 });
    const wrap = document.getElementById('fav-content');
    wrap.innerHTML = '';
    const selected = products.filter(p => ids.includes(p.id));
    if (selected.length === 0) {
      wrap.append(el(`
        <div class="empty">
          <div class="empty-icon"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <h3>لیست علاقه‌مندی‌های شما خالی است</h3>
          <p>محصولاتی که دوست دارید را با زدن دکمه قلب به این لیست اضافه کنید.</p>
          <a href="/products.html" class="btn btn-primary btn-round">مشاهده محصولات</a>
        </div>
      `));
      return;
    }
    const grid = el('<div class="grid-products"></div>');
    selected.forEach((p, i) => grid.append(productCard(p, i)));
    wrap.append(grid);
  }

  await render();
  window.addEventListener('ll:favorites', render);
})();
