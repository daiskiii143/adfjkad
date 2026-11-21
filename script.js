/**
 * Steady Hand ✨ - Bespoke Editorial Mini-Maze Prank
 * Tactile stationery paper aesthetic + classic scary maze progression
 */

(function () {
  'use strict';

  // --- Virtual Coordinate Space (380 x 500) ---
  const V_WIDTH = 380;
  const V_HEIGHT = 500;

  // --- Levels Configuration ---
  const levels = [
    {
      level: 1,
      caption: "Level 1 — guide the dot to the heart.",
      captionClass: "step-1",
      helper: "drag the dot to the heart without touching the lines",
      start: { x: 190, y: 75 },
      goal: { x: 190, y: 425 },
      playerRadius: 11,
      goalRadius: 28,
      corridorWidth: 68,
      points: [
        { x: 190, y: 75 },
        { x: 190, y: 425 }
      ]
    },
    {
      level: 2,
      caption: "Level 2 — a little narrower now.",
      captionClass: "step-2",
      helper: "stay inside the lines...",
      start: { x: 80, y: 80 },
      goal: { x: 140, y: 420 },
      playerRadius: 9,
      goalRadius: 24,
      corridorWidth: 40,
      points: [
        { x: 80, y: 80 },
        { x: 80, y: 230 },
        { x: 300, y: 230 },
        { x: 300, y: 420 },
        { x: 140, y: 420 }
      ]
    },
    {
      level: 3,
      // Level 3: Corridor narrows down to 13px, caption shrinks to 10px light gray
      caption: "Level 3 — almost there, focus closely...",
      captionClass: "step-3",
      helper: "take a breath... steady...",
      start: { x: 70, y: 65 },
      goal: { x: 180, y: 435 },
      playerRadius: 5,
      goalRadius: 18,
      corridorWidth: 16,
      points: [
        { x: 70, y: 65 },
        { x: 310, y: 65 },
        { x: 310, y: 190 },
        { x: 70, y: 190 },
        { x: 70, y: 320 },
        { x: 310, y: 320 },
        { x: 310, y: 435 },
        { x: 180, y: 435 }
      ],
      // Segment specific widths (tapers down drastically to 13px)
      segmentWidths: [24, 22, 20, 18, 14, 13, 13]
    }
  ];

  let currentLevelIndex = 0;
  let playerPos = { x: 190, y: 75 };
  let isDragging = false;
  let jumpscareTriggered = false;
  let teaseTimeout = null;
  let audioUnlocked = false;

  // --- DOM Elements ---
  const gameStage = document.getElementById('gameStage');
  const levelCaption = document.getElementById('levelCaption');
  const helperText = document.getElementById('helperText');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const scareContainer = document.getElementById('scareContainer');
  const scareVideo = document.getElementById('scareVideo');
  const ytPlayerContainer = document.getElementById('ytPlayerContainer');
  const screenFlash = document.getElementById('screenFlash');
  const teaseOverlay = document.getElementById('teaseOverlay');
  const replayBtn = document.getElementById('replayBtn');
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('toast');

  // Query parameter support: ?source=youtube vs local scare.mp4
  const urlParams = new URLSearchParams(window.location.search);
  const preferYouTube = urlParams.get('source') === 'youtube';

  // --- YouTube IFrame API Fallback Setup ---
  let ytPlayer = null;
  let ytReady = false;

  window.onYouTubeIframeAPIReady = function () {
    try {
      ytPlayer = new YT.Player('ytPlayer', {
        height: '100%',
        width: '100%',
        videoId: '4HvMw7eY-IQ',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
          start: 8
        },
        events: {
          onReady: function (event) {
            ytReady = true;
            try {
              event.target.mute();
              event.target.seekTo(8.2, true);
            } catch (err) {}
          }
        }
      });
    } catch (e) {}
  };

  // --- Canvas Coordinate Mapping & Responsive Sizing ---
  let viewScale = 1;
  let viewOffsetX = 0;
  let viewOffsetY = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    // Fit 380x500 aspect ratio nicely within parent
    const targetW = Math.min(rect.width, 420);
    const targetH = Math.min(rect.height, 560);
    
    viewScale = Math.min(targetW / V_WIDTH, targetH / V_HEIGHT);
    const displayW = Math.round(V_WIDTH * viewScale);
    const displayH = Math.round(V_HEIGHT * viewScale);
    
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr * viewScale, dpr * viewScale);
    
    draw();
  }

  window.addEventListener('resize', resizeCanvas);

  function clientToVirtual(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const vx = (clientX - rect.left) / viewScale;
    const vy = (clientY - rect.top) / viewScale;
    return { x: vx, y: vy };
  }

  // --- Audio Unlock & Pre-warm Video Decoder on First Gesture ---
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    if (scareVideo) {
      try {
        scareVideo.muted = true;
        scareVideo.currentTime = 0;
        const p = scareVideo.play();
        if (p) {
          p.then(() => {
            scareVideo.pause();
            scareVideo.currentTime = 0; // Keeps impact frame primed in GPU VRAM
          }).catch(() => {});
        }
      } catch (e) {}
    }
  }

  // --- Geometry Math: Segment Distance & Progress ---
  function getClosestPointOnSegment(p, a, b) {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby;
    if (lenSq === 0) return { x: a.x, y: a.y, t: 0, dist: Math.hypot(p.x - a.x, p.y - a.y) };
    
    const apx = p.x - a.x;
    const apy = p.y - a.y;
    let t = (apx * abx + apy * aby) / lenSq;
    t = Math.max(0, Math.min(1, t));
    
    const cx = a.x + t * abx;
    const cy = a.y + t * aby;
    const dist = Math.hypot(p.x - cx, p.y - cy);
    return { x: cx, y: cy, t: t, dist: dist };
  }

  function checkPathCollision(lvl, p) {
    let minDist = Infinity;
    let activeSegIndex = 0;
    let totalLen = 0;
    let cumLenBefore = 0;
    let activeSegLen = 0;
    let bestT = 0;

    // Calculate total path length
    for (let i = 0; i < lvl.points.length - 1; i++) {
      const p1 = lvl.points[i];
      const p2 = lvl.points[i + 1];
      const slen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      totalLen += slen;
    }

    let runningLen = 0;
    for (let i = 0; i < lvl.points.length - 1; i++) {
      const p1 = lvl.points[i];
      const p2 = lvl.points[i + 1];
      const slen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const res = getClosestPointOnSegment(p, p1, p2);
      
      if (res.dist < minDist) {
        minDist = res.dist;
        activeSegIndex = i;
        cumLenBefore = runningLen;
        activeSegLen = slen;
        bestT = res.t;
      }
      runningLen += slen;
    }

    const progress = totalLen > 0 ? (cumLenBefore + bestT * activeSegLen) / totalLen : 0;
    
    // Corridor width for this segment
    let cWidth = lvl.corridorWidth;
    if (lvl.segmentWidths && lvl.segmentWidths[activeSegIndex] !== undefined) {
      cWidth = lvl.segmentWidths[activeSegIndex];
    }

    const isInside = (minDist + lvl.playerRadius) <= (cWidth / 2);
    return {
      dist: minDist,
      progress: progress,
      segmentIndex: activeSegIndex,
      corridorWidth: cWidth,
      isInside: isInside
    };
  }

  // --- Level Management ---
  function initLevel(index) {
    currentLevelIndex = index;
    const lvl = levels[currentLevelIndex];
    playerPos = { x: lvl.start.x, y: lvl.start.y };
    isDragging = false;

    // Update typography caption
    levelCaption.style.opacity = '0';
    setTimeout(() => {
      levelCaption.textContent = lvl.caption;
      levelCaption.className = `level-caption ${lvl.captionClass}`;
      helperText.textContent = lvl.helper;
      levelCaption.style.opacity = '1';
    }, 120);

    draw();
  }

  function advanceLevel() {
    if (currentLevelIndex < levels.length - 1) {
      // Small haptic pulse of success
      if ('vibrate' in navigator) {
        try { navigator.vibrate(30); } catch (e) {}
      }
      initLevel(currentLevelIndex + 1);
    }
  }

  function resetToLevelStart(reason) {
    const lvl = levels[currentLevelIndex];
    playerPos = { x: lvl.start.x, y: lvl.start.y };
    isDragging = false;

    if ('vibrate' in navigator) {
      try { navigator.vibrate(40); } catch (e) {}
    }

    helperText.textContent = reason || "steady... try again from start";
    canvas.classList.add('shake-screen');
    setTimeout(() => canvas.classList.remove('shake-screen'), 300);
    draw();
  }

  // --- Rendering ---
  function drawHeart(c, x, y, size, color) {
    c.save();
    c.translate(x, y - size * 0.45);
    c.beginPath();
    const topCurveHeight = size * 0.32;
    c.moveTo(0, topCurveHeight);
    c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.35, 0, size);
    c.bezierCurveTo(0, (size + topCurveHeight) / 1.35, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    c.fillStyle = color;
    c.fill();
    c.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);
    const lvl = levels[currentLevelIndex];

    // 1. Draw Maze Corridor Paths
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // A) Draw Outer Ink Outline
    for (let i = 0; i < lvl.points.length - 1; i++) {
      const p1 = lvl.points[i];
      const p2 = lvl.points[i + 1];
      const cWidth = (lvl.segmentWidths && lvl.segmentWidths[i]) ? lvl.segmentWidths[i] : lvl.corridorWidth;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = cWidth + 2.5;
      ctx.strokeStyle = 'rgba(20, 20, 20, 0.42)'; // Fine dark charcoal ink outline
      ctx.stroke();
    }

    // B) Draw Inner Paper Path Fill (tactile light cream wash)
    for (let i = 0; i < lvl.points.length - 1; i++) {
      const p1 = lvl.points[i];
      const p2 = lvl.points[i + 1];
      const cWidth = (lvl.segmentWidths && lvl.segmentWidths[i]) ? lvl.segmentWidths[i] : lvl.corridorWidth;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = cWidth;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.stroke();
    }

    // 2. Draw Start Indicator
    ctx.beginPath();
    ctx.arc(lvl.start.x, lvl.start.y, lvl.playerRadius * 1.6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(20, 20, 20, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "italic 11px 'Playfair Display', serif";
    ctx.fillStyle = "rgba(20, 20, 20, 0.45)";
    ctx.textAlign = "center";
    ctx.fillText("start", lvl.start.x, lvl.start.y - lvl.playerRadius * 2);

    // 3. Draw Goal (Cute blush-pink heart)
    const heartColor = "#d67988";
    const heartSize = lvl.level === 3 ? 16 : 22;
    drawHeart(ctx, lvl.goal.x, lvl.goal.y, heartSize, heartColor);

    // 4. Draw Player Dot (Blush-pink orb with soft tactile halo)
    const pr = lvl.playerRadius;

    // Faint halo
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y, pr * 1.7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(214, 121, 136, 0.22)";
    ctx.fill();

    // Solid orb with subtle highlight
    const grad = ctx.createRadialGradient(
      playerPos.x - pr * 0.3,
      playerPos.y - pr * 0.3,
      pr * 0.2,
      playerPos.x,
      playerPos.y,
      pr
    );
    grad.addColorStop(0, '#f2a8b3');
    grad.addColorStop(1, '#d67988');

    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(20, 20, 20, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // --- Interaction: Touch & Mouse Navigation ---
  function handlePointerStart(clientX, clientY) {
    unlockAudio();
    if (jumpscareTriggered) return;

    const pos = clientToVirtual(clientX, clientY);
    const lvl = levels[currentLevelIndex];
    
    // Check if touch is near player or start circle
    const distToPlayer = Math.hypot(pos.x - playerPos.x, pos.y - playerPos.y);
    const distToStart = Math.hypot(pos.x - lvl.start.x, pos.y - lvl.start.y);

    if (distToPlayer <= lvl.playerRadius * 2.5 || distToStart <= lvl.playerRadius * 2.5) {
      isDragging = true;
      playerPos = { x: pos.x, y: pos.y };
      helperText.textContent = "keep going... don't touch the lines";
      draw();
    }
  }

  function handlePointerMove(clientX, clientY) {
    if (!isDragging || jumpscareTriggered) return;

    const pos = clientToVirtual(clientX, clientY);
    playerPos = { x: pos.x, y: pos.y };

    const lvl = levels[currentLevelIndex];
    const check = checkPathCollision(lvl, playerPos);

    // --- LEVEL 3: JUMPSCARE MECHANIC ---
    if (lvl.level === 3) {
      // If player reaches >= 70% of the narrow corridor (right in the hardest passage)
      // OR touches a wall after making substantial progress (progress >= 0.25):
      if (check.progress >= 0.68 || (!check.isInside && check.progress >= 0.25)) {
        triggerJumpscare();
        return;
      }
      
      // If early wall touch, just reset
      if (!check.isInside) {
        resetToLevelStart("too close to the edge... restart from start");
        return;
      }
    } 
    // --- LEVEL 1 & LEVEL 2: NORMAL WALL COLLISION ---
    else {
      if (!check.isInside) {
        resetToLevelStart("oops! touched the line... restart from start");
        return;
      }

      // Check if Goal reached!
      const distToGoal = Math.hypot(playerPos.x - lvl.goal.x, playerPos.y - lvl.goal.y);
      if (distToGoal <= lvl.goalRadius * 0.9) {
        isDragging = false;
        advanceLevel();
        return;
      }
    }

    draw();
  }

  function handlePointerEnd() {
    isDragging = false;
  }

  // Touch Event Listeners (passive: false for touch-action: none)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    handlePointerEnd();
  });

  window.addEventListener('touchcancel', (e) => {
    handlePointerEnd();
  });

  // Mouse Event Listeners (Desktop)
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handlePointerStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handlePointerMove(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    handlePointerEnd();
  });

  // --- JUMPSCARE LAUNCH (Instant 0ms Zero-Latency Execution) ---
  function triggerJumpscare() {
    if (jumpscareTriggered) return;
    jumpscareTriggered = true;
    isDragging = false;

    // 1. Synchronously execute audio unmuting and video play in user gesture callstack
    if (scareVideo && !preferYouTube) {
      scareVideo.muted = false;
      scareVideo.volume = 1.0;
      scareVideo.currentTime = 0;
      const playPromise = scareVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay error fallback:", err);
          scareVideo.muted = true;
          scareVideo.play();
        });
      }
    }

    // 2. Mobile haptic vibration pattern
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 200, 50, 400, 50, 500]);
      } catch (e) {}
    }

    // 3. Immediately snap fullscreen video on screen (0ms visual switch)
    gameStage.style.display = 'none';
    scareContainer.classList.add('active');
    document.body.classList.add('shake-screen');
    screenFlash.classList.add('flash-anim');

    // 4. Request fullscreen if available
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch (e) {}

    // 5. YouTube fallback branch if explicitly selected via ?source=youtube
    const useYT = preferYouTube && ytReady && ytPlayer;
    if (useYT) {
      ytPlayerContainer.classList.remove('hidden');
      scareVideo.classList.add('hidden');
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
        ytPlayer.seekTo(9.5, true);
        ytPlayer.playVideo();
      } catch (err) {
        playLocalVideo();
      }
    }

    // 6. Post-scare tease after impact clip plays out (1.8s)
    teaseTimeout = setTimeout(() => {
      endJumpscareAndShowTease(useYT);
    }, 1800);
  }

  function playLocalVideo() {
    if (!scareVideo) return;
    scareVideo.currentTime = 0;
    scareVideo.volume = 1.0;
    scareVideo.muted = false;

    const playPromise = scareVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        scareVideo.muted = true;
        scareVideo.play();
      });
    }
  }

  // --- Post-Scare Tease: "Darr gayi na? 😛" ---
  function endJumpscareAndShowTease(usedYT) {
    if (usedYT && ytPlayer) {
      try { ytPlayer.pauseVideo(); } catch (e) {}
    } else if (scareVideo) {
      scareVideo.pause();
    }

    document.body.classList.remove('shake-screen');

    teaseOverlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      teaseOverlay.classList.add('visible');
    });
  }

  // --- Replay / Play Again Button ---
  replayBtn.addEventListener('click', function () {
    if (teaseTimeout) clearTimeout(teaseTimeout);

    jumpscareTriggered = false;
    isDragging = false;

    teaseOverlay.classList.remove('visible');
    setTimeout(() => {
      teaseOverlay.classList.add('hidden');
    }, 300);

    scareContainer.classList.remove('active');
    screenFlash.classList.remove('flash-anim');
    document.body.classList.remove('shake-screen');

    if (scareVideo) {
      scareVideo.pause();
      scareVideo.currentTime = 0;
      scareVideo.classList.remove('hidden');
    }
    if (ytPlayerContainer) {
      ytPlayerContainer.classList.add('hidden');
      if (ytPlayer && ytReady) {
        try {
          ytPlayer.pauseVideo();
          ytPlayer.seekTo(8.2, true);
        } catch (e) {}
      }
    }

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch (e) {}
    }

    gameStage.style.display = 'flex';
    initLevel(0);
    resizeCanvas();
  });

  // --- Share Button ---
  shareBtn.addEventListener('click', async function () {
    const shareData = {
      title: 'Steady Hand ✨',
      text: 'A cute 30-second focus check. How steady is your hand?',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard. Send it to your next victim 😈");
    } catch (e) {
      const temp = document.createElement('input');
      temp.value = window.location.href;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast("Link copied to clipboard. Send it to your next victim 😈");
    }
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 300);
    }, 2800);
  }

  // --- Initialize Game ---
  initLevel(0);
  resizeCanvas();

})();
