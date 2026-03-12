# Unit Price Checker launch / distribution bundle

## Core positioning
Unit Price Checker is a fast, no-signup web tool for the eternal grocery-store argument: **is the bigger one actually cheaper, or is the shelf tag doing performance art again?**

It is strongest when framed as:
- a genuinely useful consumer utility
- dead simple to understand in one sentence
- better than store shelf labels because it handles the annoying real-world cases

## Best hooks
- **Grocery aisle math is annoying.**
- **Shelf labels often leave out the real comparison.**
- **Pack deals and coupons break most quick price-per-unit math.**
- **This tool handles mixed units, pack counts, and discounts without making people do fractions in public.**

## Key proof points
- mixed-unit conversion: oz vs lb, mL vs L, etc.
- pack deals like 3 for $5
- coupon / discount math
- compare up to 3 options side by side
- shareable URL state
- localStorage persistence
- static site, no backend, no sign-in

## Links
Use these once the repo is public:
- Live: https://garytalbot.github.io/unit-price-checker/
- GitHub: https://github.com/garytalbot/unit-price-checker

---

## X

### Recommended post
I shipped **Unit Price Checker** — a free tool for grocery aisle math.

It handles:
- oz vs lb / mL vs L
- pack deals like 3 for $5
- coupons and discounts

So you can see the real cheapest option without doing fractions next to a wall of peanut butter.

Live: https://garytalbot.github.io/unit-price-checker/

### Tighter alt
Shipped: **Unit Price Checker**

A free no-signup tool for the classic “is the bigger one actually cheaper?” problem.

It handles mixed units, pack deals, and coupon math.

https://garytalbot.github.io/unit-price-checker/

### Optional reply with repo
Code: https://github.com/garytalbot/unit-price-checker

---

## Discord / community

### Recommended post
Built and shipped a small utility this morning: **Unit Price Checker**.

It’s for the annoying store-aisle question of whether the bigger size is actually a better deal.

What it handles:
- mixed units like **oz vs lb** or **mL vs L**
- **pack deals** like 3 for $5
- **coupon / discount math**
- side-by-side comparison for up to 3 options
- shareable link if you want to send the comparison to somebody else

Live: https://garytalbot.github.io/unit-price-checker/
GitHub: https://github.com/garytalbot/unit-price-checker

I wanted this to be dead simple, fast on mobile, and useful in real shopping situations instead of just being another calculator with the charisma of a tax form.

If you try it, I’d love to know what edge cases I should add next.

### Shorter alt
Shipped a new utility: **Unit Price Checker**

Free, no-signup, mobile-friendly, and built for the classic “is the giant one actually cheaper?” problem.

It handles mixed units, pack deals, and coupon math:
https://garytalbot.github.io/unit-price-checker/

---

## Indie Hackers

### Suggested title
I shipped Unit Price Checker, a no-signup tool for comparing grocery sizes, pack deals, and coupon-adjusted prices

### Post body
Shipped a new small utility today: **Unit Price Checker**.

It solves a very boring but very real problem: figuring out which grocery or household item is actually the best deal once you factor in size differences, pack counts, and coupons.

Live:
https://garytalbot.github.io/unit-price-checker/

GitHub:
https://github.com/garytalbot/unit-price-checker

What it does:
- compares up to 3 options side by side
- handles mixed units like **oz vs lb** and **mL vs L**
- handles **pack deals** like 3 for $5
- handles **coupon / discount math**
- gives a clear winner plus match-price context
- saves state locally and supports shareable comparison links

Why I made it:
- this is one of those tiny recurring annoyances people deal with constantly
- shelf labels often don’t help once discounts or pack counts get weird
- I wanted a tool that was fast, mobile-friendly, and useful immediately with no account or backend

A thing I like about this project is that the pitch is obvious in one sentence, but the utility is still real. You can open it on your phone in a store, plug in a couple numbers, and get an answer fast.

What I’d love feedback on:
- what other unit or packaging edge cases come up in real life?
- would you add anything beyond the current compare/share flow, or keep it aggressively simple?

---

## Hacker News

### Suggested title
Show HN: Unit Price Checker — compare grocery sizes, pack deals, and coupons

### Submission text
I built a small web app called Unit Price Checker.

It’s for a very ordinary problem: comparing grocery or household items when the sizes don’t line up cleanly and the sale math gets annoying.

The tool lets you compare up to three options side by side and handles:
- mixed units like oz vs lb and mL vs L
- pack counts for deals like 3 for $5
- coupon / discount math
- a shareable URL for the current comparison

I wanted it to be fast on mobile, require no sign-in, and stay simple enough that you could actually use it in a store instead of meaning to use it and then giving up.

Live demo: https://garytalbot.github.io/unit-price-checker/
GitHub: https://github.com/garytalbot/unit-price-checker

I’d especially love feedback on missing real-world edge cases, additional unit support, and whether the current UI feels clear enough on a phone.

### Optional first comment
One thing I wanted to avoid was fake precision that falls apart the second a deal gets slightly weird.

A lot of quick unit-price tools are fine until you hit something like:
- one item is 32 oz
- one item is 2 lb
- the cheaper-looking one is actually part of a pack deal
- there’s also a coupon involved

That’s the exact kind of mildly infuriating consumer math I wanted this to absorb.

---

## Posting notes

### Ready-made real-use screenshot
Use `assets/launch/reddit-real-use-oats-comparison.jpg` for the Reddit / community proof shot.

What it shows:
- a realistic oats comparison instead of empty demo chrome
- mixed units (`oz` vs `lb`)
- a couponed 2-pack sale bundle
- target-amount mode set to `64 oz`
- both winner states visible
- one shelf-tag discrepancy warning

### Best screenshot
Use a filled-in comparison state that shows:
- at least 2 comparable items
- one mixed-unit example
- one coupon or pack-count example
- the winner card visible

That makes the value obvious in a single image.

### Best distribution angle by platform
- **X:** quick pain-point + usefulness
- **Discord/community:** practical utility + ask for edge cases
- **Indie Hackers:** build-in-public + why this specific small utility matters
- **HN:** direct maker tone, no hype, emphasize the real-world problem

### Tone guardrails
- lead with the problem, not the stack
- call out real examples like 3 for $5 or oz vs lb
- keep it grounded and useful
- do not call it a platform, solution, or ecosystem unless you want to be haunted by your own copy forever
