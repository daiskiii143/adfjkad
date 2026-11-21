# Quick Vibe Check ✨ (Prank Web Application)

A lightweight, mobile-responsive prank web application disguised as an aesthetic mood/vibe assessment quiz, optimized for **GitHub Pages**.

---

## 🎯 The Psychology & User Flow

1. **Innocent Aesthetic UI**:
   - Styled with a soft pastel gradient background, animated ambient blobs, frosted-glass card (`backdrop-filter: blur`), and clean typography.
   - Branded as `"Quick Vibe Check ✨"` with a 30s mood badge and progress indicator.
   - Social media previews (Open Graph meta tags) make shared links look 100% genuine and innocent on WhatsApp, iMessage, Instagram, Discord, etc.

2. **The Progressive Shrinking Trap**:
   - **Question 1**: `"Hey! Quick question... how was your day today? ☀️"`  
     *Font size:* `22px` (normal, readable, warm dark `#1e293b`).
   - **Question 2**: `"Nice. What's one random thing that made you smile recently?"`  
     *Font size:* `14px` (noticeably smaller, muted slate `#64748b`).
   - **Question 3**: `"Wait, lean in a bit closer... tell me a tiny secret nobody knows:"`  
     *Font size:* `9px` (tiny, faint gray `#94a3b8`).  
     *Psychological Effect:* The user naturally brings their phone right up to their face or leans in close to the screen to read the text.
   - **Mobile Viewport Protection**: The text input field is strictly fixed at `16px` font-size so iOS Safari and Android Chrome will **not** auto-zoom the page viewport when typing.

3. **Instant Zero-Latency Jumpscare**:
   - As soon as the user presses `Enter` or clicks `Submit ✨`, the quiz card vanishes with `0ms` delay.
   - The screen flashes and violently shakes with a full-viewport video of **Reze jumping out screaming "Boo!" at Denji** (Chainsaw Man).
   - Local `scare.mp4` (~360KB) is preloaded with `preload="auto"` and `faststart` metadata for instant playback with 100% audio volume on the user's submit touch gesture.
   - Triggers mobile haptic vibration (`navigator.vibrate`) with an intense pulsing pattern.
   - `pointer-events: none` prevents the victim from pausing or scrubbing the video.
   - Supports background preloaded YouTube IFrame API as a synchronized alternative.

4. **Post-Scare Tease**:
   - At the end of the scare moment (3.3s), the video pauses.
   - A floating glassmorphic pill glides up at the bottom:  
     **"Darr gayi na? 😛"**
   - Includes a **Replay** button (resets the quiz back to Question 1 with fresh inputs) and a **Share Prank** button (copies the link or opens native mobile share sheet).

---

## 🚀 How to Deploy on GitHub Pages

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "feat: Quick Vibe Check prank app"
   ```

2. **Push to GitHub**:
   - Create a new public repository on GitHub (e.g., `vibe-check` or `aura-check`).
   - Link your local repo and push:
     ```bash
     git branch -M main
     git remote add origin https://github.com/<your-username>/<your-repo-name>.git
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment**:
     - **Source**: `Deploy from a branch`
     - **Branch**: `main` / `root`
   - Click **Save**.
   - Your site will be live at `https://<your-username>.github.io/<your-repo-name>/` in about 60 seconds!

---

## ⚙️ Advanced Settings / Query Options

- **Default Mode (Fastest, zero buffer)**: Uses bundled `scare.mp4`.
- **Force YouTube IFrame Mode**: Append `?source=youtube` to the URL:
  `https://your-username.github.io/vibe-check/?source=youtube`
