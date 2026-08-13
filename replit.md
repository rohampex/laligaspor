# LaLiga Sports

A Persian-language football jersey e-commerce store — fully static (HTML + CSS + vanilla JS), no build step or backend required.

## Stack

- Pure HTML / CSS / JavaScript (no frameworks, no bundler)
- Data stored in `localStorage` (seeded from `js/data.js` on first load)
- Admin panel at `/admin/login.html`

## Running

Served with Python's built-in HTTP server on port 5000:

```
python3 -m http.server 5000
```

Open `/home.html` as the entry point.

## Structure

```
/               — storefront pages (home, products, product, blog, etc.)
/admin/         — admin panel (login, dashboard, products, categories, blog, offers, settings)
/css/           — stylesheets (style.css, animations.css)
/js/            — JavaScript modules (data.js seeds defaults; utils.js shared helpers)
```

## User preferences
