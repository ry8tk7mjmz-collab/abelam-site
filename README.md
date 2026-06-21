# Abe Lam Realty — website

White-light cinematic luxury rebuild of abelam.com. Self-contained static site (plain HTML/CSS/JS). No build step. Drop it on any host and point a domain at it.

## Pages
`index.html` (home) · `about.html` · `services.html` · `gallery.html` · `invest.html` · `contact.html` · `blog.html` · `case-studies.html` · `faqs.html` · `disclaimer.html`
Shared: `styles.css` (design system) · `main.js` (nav, animations, integrations).

## Go live in 3 edits
Open `main.js`, edit the `ABELAM` config block at the top:

1. **`bookingUrl`** — paste the Calendly / Cal.com link. Every "Book a Call" button uses it. If left as `REPLACE`, those buttons fall back to the phone number.
2. **`contactEndpoint`** — create a free form at [formspree.io](https://formspree.io), paste its endpoint (`https://formspree.io/f/xxxx`). The contact form then emails every submission to wherever Formspree is set to deliver.
3. **`ebookEndpoint`** + **`ebookFile`** — a second Formspree endpoint for the ebook list, and the path to the PDF (drop it in `/assets`). After signup the PDF opens automatically.

Also update `phone` and `email` in the same block if they change. Until the endpoints are set, forms show a friendly "connect an endpoint" message instead of failing.

> Forms post directly to Formspree (no server needed), which is what keeps this a static, drop-anywhere site. Swap to any other form backend by changing the two endpoints.

## Images
All photos are Unsplash placeholders chosen for the cinematic look. Replace with Abraham's own property photography: put files in `/assets` and swap the `src` paths (mainly in `index.html`, `gallery.html`, `about.html`, `invest.html`). Broken images hide themselves, so nothing looks broken mid-swap.

## Deploy + custom domain
Any static host works. Easiest:

**Netlify / Vercel / Cloudflare Pages**
1. Drag this folder into the host's dashboard (or `git push` and connect the repo).
2. It deploys instantly at a temporary URL.
3. Add the custom domain (e.g. `abelam.com` or a client's domain) in the host's Domains panel.
4. At the domain's DNS, add the records the host shows you (usually an `A`/`ALIAS` record for the apex and a `CNAME` for `www`). SSL is automatic.

Because it's static, it can sit on the client's existing domain regardless of who registered it. You only need DNS access (or the registrar can point the records for you).

## Notes
- Native scroll + GSAP ScrollTrigger (no Lenis, so the page never locks). GSAP loads from CDN; if it fails, the site still works, just without parallax.
- Honors `prefers-reduced-motion`. Text reveals on load as a fallback.
- OKLCH color, no pure black/white. Re-theme the whole palette by changing `--hue` in `styles.css`.
- Case-study and blog article pages are placeholders pointing at contact/invest. Wire to a CMS or replace links when real content exists.
- Disclaimer is general template language. Have a lawyer finalize before publishing an investment site.
