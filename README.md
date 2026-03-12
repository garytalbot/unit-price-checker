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
- **Copyable plain-English verdict bundle** that includes the winner, the real checkout winner when target mode changes the answer, any shelf-tag warning, and the exact share URL
- **Starter presets** for realistic grocery/household scenarios like breakfast cereal, paper towels, sparkling water, and ground coffee so first-time visitors land on something useful immediately
- **Quick target presets** for common shopping amounts like 32 oz, 64 oz, 1 gallon, or 12 count so you can get to the real checkout winner faster
- **Shareable URL state** for sending the current comparison to someone else
- Saves your last comparison locally with **localStorage**
- Optional **shelf-tag audit** input that compares a claimed aisle unit price against the price, pack count, and coupon you entered
- Includes **GitHub Pages** workflow and **Netlify** config for painless deployment
- Adds on-page **help / FAQ / trust** copy so normal people can understand the math without reading the source

## Trust notes

A price comparison tool is only useful if the math feels credible. This project now makes that explicit in the public-facing copy:

- **No backend** — the app is just static files running in the browser
- **Local-only persistence** — your last comparison stays in your own browser unless you intentionally copy a share link
- **Honest exclusions** — weight, volume, and count do not get ranked together
- **Shelf-tag audit** — optional claimed unit-price checks help catch aisle labels that do not line up with the price, pack count, and coupon entered here
- **Copyable verdict** — the summary card can now copy a plain-English winner/check-out/warning bundle with the exact live comparison URL in one tap
- **Whole-package target math** — target mode rounds up to real packages because stores do not sell fractional cereal boxes unless society has changed dramatically

## FAQ highlights

- **Why can the unit-price winner and checkout winner be different?**
  - Because the best per-ounce value can still force you to buy more than you need.
- **Why are some items excluded?**
  - Because mixed measurement families stay separate on purpose.
- **Does it send my prices anywhere?**
  - No. There is no server-side calculator and no account system.
- **What if the shelf tag looks wrong?**
  - Enter the claimed unit price and unit. The app will show whether that label looks normal within rounding or noticeably off versus the math you entered.

## Launch assets

- `assets/launch/split-winner-social-card.png` — the new primary share card and Open Graph preview for the live site, built around the split-winner cereal example where the best unit price is not the cheapest actual checkout.
- `assets/launch/split-winner-proof-shot.png` — the real in-app proof screenshot used inside the share card.
- `assets/launch/reddit-real-use-oats-comparison.jpg` — filled real-use screenshot for launch posts, showing a realistic oats comparison with mixed units, a couponed bundle, target-amount mode, and a shelf-tag warning.
- `assets/favicon-512.png` plus derived app icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and PNG favicons) now power the live favicon/app-icon surface instead of leaving the repo with a nice icon that browsers and homescreens mostly never saw.

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
