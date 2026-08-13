(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { productCard, el, $ } = LLutil;
  const params = new URLSearchParams(location.search);
  let activeCategory = params.get('category') || '';
  let search = '';
  let debounceTimer;

  const cats = await LLbackend.getCategories();
  const catList = $('#cat-list');
  const catScroller = $('#cat-scroller');

  function renderCats() {
    catList.innerHTML = '';
    catScroller.innerHTML = '';
    const all = [{ slug: '', name: 'همه محصولات', shortName: 'همه' }, ...cats.map(c => ({ slug: c.slug, name: c.name, shortName: c.name }))];
    all.forEach(c => {
      const li = el(`<li><button class="${c.slug === activeCategory ? 'active' : ''}" data-cat="${c.slug}">${c.name}</button></li>`);
      catList.append(li);
      const chip = el(`<button class="${c.slug === activeCategory ? 'active' : ''}" data-cat="${c.slug}">${c.shortName}</button>`);
      catScroller.append(chip);
    });
    document.querySelectorAll('[data-cat]').forEach(b => {
      b.addEventListener('click', () => {
        activeCategory = b.dataset.cat;
        renderCats();
        render();
      });
    });
  }

  async function render() {
    const grid = $('#products-grid');
    const empty = $('#empty');
    grid.innerHTML = '';
    const list = await LLbackend.getProducts({ category: activeCategory || undefined, search: search || undefined, limit: 100 });
    if (list.length === 0) {
      grid.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }
    grid.classList.remove('hidden');
    empty.classList.add('hidden');
    list.forEach((p, i) => grid.append(productCard(p, i)));
  }

  $('#search-input').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      search = e.target.value.trim();
      render();
    }, 400);
  });
  $('#clear-filters').addEventListener('click', () => {
    activeCategory = '';
    search = '';
    $('#search-input').value = '';
    renderCats();
    render();
  });

  renderCats();
  await render();
})();
