# Вафла (Waffle)

Македонска Вафла (Macedonian Waffle) is a clone of the popular [Waffle](https://wafflegame.net) word game, specifically tailored for the Macedonian language. The goal is to rearrange the letters on the waffle grid to form valid 5-letter words horizontally and vertically, using as few swaps as possible.

## How to Play

- The grid shows a waffle-shaped pattern with letters
- Drag letters to swap their positions
- Green tiles are in the correct position
- Yellow tiles are in the word but wrong position
- Gray tiles are not in the current row/column's word
- Solve the puzzle in 15 swaps or fewer to earn stars
- A new puzzle is available every day at midnight (Amsterdam time)

## Features

- Daily puzzles with consistent generation
- Star rating system (0-5 stars based on swaps remaining)
- Statistics tracking (games played, streaks, star distribution)
- Share your results with friends
- Dark mode support
- Fully offline-capable (IndexedDB storage)

## Local Development Setup

This project uses `conda`/`mamba` to manage both Python and Node.js environments.

### 1. Environment Installation

To set up the environment, run:

```bash
mamba env create -f environment.yaml
mamba activate mkbee
```

### 2. Project Installation

Once the environment is active, install the Node dependencies:

```bash
npm install
```

### 3. Running the App

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Running Tests

To execute the unit tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To generate coverage report:

```bash
npm run test:coverage
```

### 5. Linting

To check the code for potential issues:

```bash
npm run lint
```

To auto-fix linting issues:

```bash
npm run lint:fix
```

### 6. Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

> **Note:** All `npm` or `npx` commands should be run within the active `mkbee` environment. If you prefer using your own Node.js version manager (like `nvm` or `fnm`), you can skip the mamba setup and run the standard Node commands directly.

## Dictionary

The Macedonian dictionary used in this app contains 5-letter Macedonian words suitable for the waffle grid puzzle. Words are validated to ensure they can form valid intersecting patterns.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **Vitest** - Testing framework
- **IndexedDB** - Client-side data persistence
