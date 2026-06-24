# ShopWave — E-Commerce Website

A modern, fully functional React e-commerce store with real-time search, category filtering, sorting, and a cart drawer.

## Features

- **Product Search** — Live search across product names, categories, and descriptions (Navbar + Hero search bar)
- **Category Filter** — Filter by Electronics, Footwear, Bags, Home, Clothing
- **Sorting** — Sort by Featured / Price Low-High / Price High-Low / Top Rated
- **Add to Cart** — Add products, adjust quantities, remove items
- **Cart Drawer** — Slide-in cart with full checkout flow
- **Responsive** — Works on mobile, tablet, and desktop

## Setup

### Requirements
- Node.js 16+ and npm

### Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.js       # Sticky nav with search + cart button
│   ├── Hero.js         # Hero section with search
│   ├── ProductCard.js  # Individual product card
│   └── CartDrawer.js   # Slide-in cart panel
├── context/
│   └── CartContext.js  # Global cart state (useReducer)
├── data/
│   └── products.js     # 12 product records + categories
├── App.js              # Main layout, filtering logic
└── App.css             # All styles
```

## Tech Stack

- React 18 (hooks, context, useReducer)
- Vanilla CSS (no UI library)
- Google Fonts (Syne + Inter)
- Unsplash for product images
