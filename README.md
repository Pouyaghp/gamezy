# GameZy

A multi-page gaming review & community platform built with **React + Vite + React Router**.
Every game has its own page, content is categorised, reviews/ratings are interactive
(saved in the browser), and the homepage opens with a scroll-scrubbed hero animation.

## Getting started

```bash
npm install
npm run dev      # start the dev server (opens http://localhost:5173)
npm run build    # production build into /dist
npm run preview  # preview the production build
```

Requires Node 18+.

## Project structure

```
gamezy/
├─ index.html            # Vite entry HTML
├─ vite.config.js
├─ public/
│  ├─ favicon.svg        # GameZy shield mark
│  └─ _redirects         # SPA fallback for Netlify
├─ vercel.json           # SPA fallback for Vercel
└─ src/
   ├─ main.jsx           # app entry (BrowserRouter)
   ├─ App.jsx            # routes
   ├─ index.css          # full theme (purple/gold/dark)
   ├─ data/
   │  ├─ games.js        # the 30-game library
   │  ├─ categories.js
   │  └─ platforms.js
   ├─ lib/
   │  ├─ helpers.js
   │  └─ hooks.js        # useReviews, useScrolled, useHeroProgress
   ├─ components/
   │  ├─ Logo.jsx        # SVG brand emblem
   │  ├─ Icons.jsx
   │  ├─ Stars.jsx       # rating display + picker
   │  ├─ GameCard.jsx    # card + poster (placeholder or image)
   │  ├─ Navbar.jsx
   │  ├─ Footer.jsx
   │  ├─ Chrome.jsx      # scroll progress bar + back-to-top
   │  ├─ ScrollHero.jsx  # scroll-driven hero animation
   │  ├─ Reveal.jsx      # fade-in-on-scroll wrapper
   │  └─ blocks.jsx      # reusable sections
   └─ pages/
      ├─ Home.jsx
      ├─ Games.jsx       # search + category/platform filters
      ├─ GameDetail.jsx  # one page per game + reviews
      ├─ Platforms.jsx
      ├─ About.jsx
      └─ NotFound.jsx
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Home (scroll hero) |
| `/games` | Library (supports `?cat=`, `?plat=`, `?q=`) |
| `/game/:slug` | Individual game page |
| `/platforms` | Platforms overview |
| `/about` | About |

## Customising

**Your logo:** drop your real logo at `public/images/logo.png`
(transparent PNG or SVG). The navbar and footer use it automatically; if the file
isn't there, the built-in SVG emblem is shown. (The animated homepage hero keeps
the SVG so it can draw itself on scroll.) Replace `public/favicon.svg` to change
the browser-tab icon.

**Game cover photos:** drop each cover into `public/images/games/` named
`<slug>.jpg` — e.g. `public/images/games/elden-ring.jpg`. They appear
automatically. A full list of the exact filenames is in
`public/images/games/HOW-TO-NAME-IMAGES.txt`. If a file is missing, a
brand-coloured placeholder poster is shown instead. (You can also set an explicit
`image` field on a game in `src/data/games.js`.)

**Add a game:** copy any object in `src/data/games.js`, give it a unique `id`
and `slug`, and pick a `cat` from `src/data/categories.js`.

**Change colours:** edit the CSS variables at the top of `src/index.css`
(`--gold`, `--purple`, `--bg`, …).

## Deploying

The project builds to static files (`npm run build` → `/dist`) and can be hosted
anywhere. SPA fallback configs are included for **Netlify** (`public/_redirects`)
and **Vercel** (`vercel.json`) so deep links like `/game/elden-ring` work on refresh.
