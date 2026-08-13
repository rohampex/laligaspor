(async function () {
  await LLbackend.getSettings();
  LLutil.layout();
  const { I, formatFaDate } = LLutil;
  const slug = new URLSearchParams(location.search).get('slug');
  let post = null;
  try {
    post = await LLbackend.getBlogPostBySlug(slug);
  } catch (error) {
    post = null;
  }

  const root = document.getElementById('article-root');
  if (!post) {
    root.innerHTML = `<div class="empty"><h3>مقاله یافت نشد</h3><a href="/blog.html" class="btn btn-outline">بازگشت به وبلاگ</a></div>`;
    return;
  }

  document.title = `${post.title} | مجله لالیگا`;
  root.innerHTML = `
    <div class="breadcrumb"><a href="/home.html">خانه</a> ${I.chev} <a href="/blog.html">وبلاگ</a> ${I.chev} <span style="color:#fff">${post.title}</span></div>
    <div class="article-hero">
      <img src="${post.image}" alt="${post.title}">
      <div class="body">
        <div class="cat">${post.category || 'مجله'}</div>
        <h1>${post.title}</h1>
        <div class="meta">${post.author || 'تیم لالیگا'} · ${formatFaDate(post.publishedAt)}</div>
      </div>
    </div>
    <article class="article-body">${post.content || `<p>${post.excerpt}</p>`}</article>
  `;
})();
