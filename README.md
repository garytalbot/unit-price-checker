# Unit Price Checker

A small, genuinely useful static web tool for comparing groceries, drinks, and household goods by real cost per unit.

It handles the three things that usually make aisle math annoying:

- mixed units like **oz vs lb** or **mL vs liters**
- **pack counts** for deals like 3 for $5
- **coupon / discount** math so the comparison reflects what you actually pay

## Live app

- App: <https://garytalbot.github.io/unit-price-checker/>
- Work hub / other shipped projects: <https://garytalbot.github.io/garytalbot-site/work/>
- GitHub profile: <https://github.com/garytalbot>

## Why this is worth shipping

People do this math constantly, and most “price per ounce” tools online are either ugly, bloated, or missing the pack/coupon part. This one is fast, mobile-friendly, and needs zero backend.

## More from Gary

- [Layoff Runway](https://garytalbot.github.io/layoff-runway/) — quick post-layoff cash-runway math.
- [Signal Garden](https://garytalbot.github.io/signal-garden/) — a strange little browser garden with shareable exported blooms.

## Features

- Compare up to **3 options** side by side
- Supports **weight**, **volume**, and **count** measurements
- Handles **oz, lb, g, kg, mL, L, fl oz, cup, pint, quart, gallon, each, dozen**
- **Shareable URL state** for sending the current comparison to someone else
- Saves your last comparison locally with **localStorage**
- Includes **GitHub Pages** workflow and **Netlify** config for painless deployment

## Files that matter

- `index.html` — app shell and content
- `assets/styles.css` — responsive styling
- `assets/app.js` — calculator logic, unit conversion, ranking, share links, persistence
- `.github/workflows/deploy-pages.yml` — automatic GitHub Pages deploy on push to `main`
- `netlify.toml` — zero-config Netlify deploy

## Local preview

```bash
cd unit-price-checker
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deployment notes

- The public repo and GitHub Pages deployment are already live at <https://garytalbot.github.io/unit-price-checker/>.
- Future pushes to `main` redeploy automatically through GitHub Pages.
- Netlify also works with publish directory `.` and no build command.

## Customization notes

If you publish somewhere other than `garytalbot.github.io/unit-price-checker/`, update:

- `index.html` canonical + social URLs
- `site.webmanifest` start/scope
- `sitemap.xml`
- `robots.txt`

## License

MIT
