# Steady Hand ✨ (Mini-Maze Prank Game)

A lightweight, mobile-responsive mini-maze game disguised as a cute, bespoke editorial steady-hand test, hosted on **GitHub Pages**.

---

## 🖋 Aesthetic & Visual Direction (Zero AI Slop)

1. **Stationery & Tactile Paper Texture**:
   - Warm off-white / cream paper background (`#f6f3ee`) with a subtle radial vignette.
   - Inline SVG `feTurbulence` noise overlay providing fine tactile paper grain.
   - Sparse, soft dusty-rose watercolor accents around the perimeter (12–16% opacity).
2. **Editorial Typography**:
   - Google Fonts **Playfair Display** (regular & italic) and **Inter**.
   - Minimal single instruction line at the top.
3. **Ultra-Minimal Full-Viewport Layout**:
   - Zero cards, zero boxes, zero clutter.
   - Clean, tactile canvas with `touch-action: none` so mobile touchscreens never scroll, pull-to-refresh, or pinch while playing.

---

## 🎮 Gameplay & Progressive Levels

- **Mechanics**:
  - Drag the blush-pink dot from the "start" circle to the cute heart without touching the lines.
  - Supports smooth touch dragging on mobile (`touchstart`, `touchmove`) and mouse dragging on desktop.
  - Automatically unlocks audio on the player's very first touch/click.
- **Level 1**: Wide, easy vertical path.  
  *Caption:* `"Level 1 — guide the dot to the heart."` (`20px`, deep ink)
- **Level 2**: Medium winding path with turns.  
  *Caption:* `"Level 2 — a little narrower now."` (`15px`, muted ink)
- **Level 3**: Extremely narrow corridor tapering down to `13px`, with caption shrinking to `10px` faint light gray (`"Level 3 — almost there, focus closely..."`) so the player leans right into the screen.
- **The Jumpscare Trigger**:
  - In Level 3, when the player gets ~70% through the narrow corridor (or touches a wall in the narrow stretch), the game instantly vanishes.
  - Full-screen **Reze jumps out screaming "Boo!" at Denji** (`scare.mp4`) with 100% volume, mobile haptic vibration (`navigator.vibrate`), screen flash, and camera shake.
  - At 3.3s, pauses to reveal the floating tease pill: **"Darr gayi na? 😛"** with a **"Play Again"** button.

---

## 🚀 Live Site
🔗 **https://daiskiii143.github.io/adfjkad/**
