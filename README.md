# Kontur — space editorial dashboard

React + Vite implementation of the supplied Kontur visual mockup, without the phone panel on the right.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Visual notes

- The desktop composition is intentionally dense and follows the supplied mockup proportions.
- The Earth image is bundled locally in `src/assets/earth.jpg`.
- The background stars are CSS-generated, so there is no extra background image to load.
- The display wordmark uses Jura with Cyrillic support and an outlined neon treatment. Jura supports Cyrillic according to its Google Fonts metadata. 
- The right-hand phone mockup is intentionally not part of this implementation.
