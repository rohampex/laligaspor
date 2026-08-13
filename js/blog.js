(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { I, el, formatFaDate } = LLutil;
  const posts = await LLbackend.getBlogPosts();
  const grid = document.getElementById('blog-grid');

  if (!posts.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><h3>هنوز مقاله‌ای منتشر نشده</h3></div>`;
    return;
  }

  posts.forEach((p, i) => {
    grid.append(el(`
      <article class="blog-card" style="animation-delay:${i * 80}ms" data-anim="fade-up">
        <a href="/article.html?slug=${encodeURIComponent(p.slug)}">
          <div class="img-wrap"><img src="${p.image}" alt="${p.title}" loading="lazy"></div>
          <div class="meta"><span class="cat">${p.category || 'مجله'}</span> · ${formatFaDate(p.publishedAt)}</div>
          <h2>${p.title}</h2>
          <p class="excerpt">${p.excerpt}</p>
          <span class="read-more">ادامه مطلب ${I.arrow}</span>
        </a>
      </article>
    `));
  });
})();
