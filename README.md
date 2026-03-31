# Pixadle (The Disney Pixar Guessing Game)

A comprehensive, front-end-heavy Disney Pixar character guessing game inspired by daily comparison-based puzzles. This repository serves as a fully functional game and a reference architecture for building daily, multi-mode guessing games using React and Cloudflare.

## 📖 Table of Contents
- [Game Mechanics & Modes](#game-mechanics--modes)
- [How It Works (Under the Hood)](#how-it-works-under-the-hood)
- [Technical Stack](#technical-stack)
- [Project Architecture](#project-architecture)
- [Cloudflare Backend & Rankings](#cloudflare-backend--rankings)
- [Local Development Setup](#local-development-setup)
- [Design Philosophy](#design-philosophy)

---

## 🎮 Game Mechanics & Modes

**Pixadle** is built around a daily puzzle format. Every day, the hidden answers reset, and all players globally receive the same puzzles. 

The game features a progression system where completing one mode unlocks the next challenge in the sequence. Progress for the day is continuously saved in the browser.

### The 5 Game Modes
1. **Classic Mode (✨):** The core experience. Players search and guess a Disney Pixar character. Feedback is given via a grid comparing the guessed character's traits (Movie, Species, Gender, Role, etc.) against the hidden character using Green (Match), Yellow (Partial Match), and Red (No Match) tiles.
2. **Emoji Mode (😃):** Players are presented with a series of emojis that represent a specific character's story or traits. They must deduce the character based only on these visual clues.
3. **Silhouette Mode (👤):** An image of a character is completely blacked out. Players must guess whose silhouette it is.
4. **Song Mode (🎵):** An audio challenge. Players listen to small snippets of a Disney Pixar song and must guess the track and its corresponding movie.
5. **Card Mode (🃏):** Featuring Disney Pixar themed trading cards. A portion of the card is shown, and the player guesses who the featured character is.

### Hints & Scoring
- **Hints:** In Classic, Emoji, Silhouette, and Card modes, a "Magical Hint" is unlocked after a certain number of failed attempts (usually 4 or 5).
- **Scoring:** The game calculates a score out of 100 based on the number of guesses it took to find the correct answer. This score can be submitted to the daily leaderboard.

---

## ⚙️ How It Works (Under the Hood)

If you are looking to build a similar daily game, here are the core architectural paradigms used in this project:

### 1. The Daily Seed (Pseudo-Random Generation)
Instead of relying on a backend to tell the frontend what today's character is, the game uses a deterministic algorithm based on the current date (`lib/game.ts`). 
- A unique string (e.g., `YYYY-MM-DD`) is combined with a "salt".
- This string is hashed/converted into an integer.
- This integer is used as an index to pick an item from the static JSON datasets.
- **Result:** Everyone playing on a given day will generate the exact same index and get the exact same puzzles without needing a database.

### 2. State Persistence
All progress is heavily reliant on `localStorage` (`App.tsx`). This allows players to close the tab and return later without losing their guesses.
- State is partitioned by game mode (e.g., `ouag-daily-state-v4`, `ouag-emoji-state-v1`).
- Every time the app loads, it checks if the saved data's date matches `today`. If it doesn't, the storage is wiped, and a new game begins.

### 3. Static Data Archives
All reference data (characters, songs, cards) are stored as static `.json` files in `src/data/`. This makes the bundle slightly larger but entirely eliminates database read costs for the core game loop. A combobox (`SearchCombobox.tsx`) filters these local JSON files for autocompletion during guessing.

---

## 🛠 Technical Stack

The project prioritizes performance, visual excellence, and zero-cost scaling using edge computing.

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Custom Vanilla CSS (deliberate choice over Tailwind to maintain strict art direction)
- **Animations:** Framer Motion (for smooth modal popups, tile flipping, and list transitions)
- **Backend / API:** Cloudflare Pages Functions
- **Database (Leaderboards):** Cloudflare KV (Key-Value Storage)

---

## 📂 Project Architecture

```text
├── functions/
│   └── api/
│       └── rankings.ts        # Serverless API endpoints for the leaderboard
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── GuessBoard.tsx     # The Classic mode tile grid
│   │   ├── SearchCombobox.tsx # Search bar with autocomplete
│   │   ├── RankingModal.tsx   # Leaderboard UI
│   │   └── *Display.tsx       # Mode-specific game boards (Emoji, Song, etc.)
│   ├── data/                  # Static JSON datasets
│   │   ├── disney-pixar-characters.json
│   │   ├── disney-pixar-songs.json
│   │   └── lorcana_pool.json
│   ├── lib/                   # Core business logic
│   │   ├── game.ts            # Daily seeding & selection logic
│   │   ├── ranking.ts         # Score calculation logic
│   │   └── normalize.ts       # Dataset normalization utilities
│   ├── App.tsx                # Main router & global state manager
│   └── styles.css             # Global and component styling
├── public/                    # Audio files, images, branding assets
└── wrangler.toml              # Cloudflare Pages/Workers configuration
```

---

## ☁️ Cloudflare Backend & Rankings

While the core game requires no backend, the **Leaderboard** system uses **Cloudflare Pages Functions** paired with **Cloudflare KV**, creating incredibly fast, globally distributed APIs.

---

## 💻 Local Development Setup

To run this project locally, you will need Node.js and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Running the Frontend Only
If you are only working on UI/UX or game logic and don't need the leaderboard to work:
```bash
npm run dev
```

### 3. Running with the Backend (Cloudflare Wrangler)
If you need to test the API or Leaderboard system, you must run the app through Wrangler, Cloudflare's CLI.
```bash
npm run dev:pages
```

---

## 🎨 Design Philosophy

This app is designed with a **Toy Story-inspired** vibrant aesthetic.

- **Lighting & Depth:** Uses bright, cinematic light with playful shadows.
- **Typography:** Relies on **Fredoka** typography to convey a friendly, animated tone.
- **Layout:** Prefers rounded panels with thick "toy-like" borders.
- **Motion:** Prioritizes soft, bouncy transitions for a magical feel.
- **Branding:** Creates a rich Disney Pixar-adjacent atmosphere.
