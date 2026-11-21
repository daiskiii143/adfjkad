/**
 * Quick Vibe Check ✨ - Bespoke Editorial Edition
 * Tactile stationery canvas + progressive shrinking psychological mechanic
 */

(function () {
  'use strict';

  // --- Questions (Editorial Playfair Typography with natural italic accents) ---
  const questions = [
    {
      step: 1,
      html: "Hey. Quick question — how was your <em>day</em> today?",
      placeholder: "write here...",
      stepClass: "step-1"
    },
    {
      step: 2,
      html: "Nice. What is one random thing that made you <em>smile</em> recently?",
      placeholder: "a memory, a thought...",
      stepClass: "step-2"
    },
    {
      step: 3,
      // Progressive shrinking trap: 9px font size & faint ink
      // Compels the user to physically lean right up to the screen!
      html: "Wait, lean in a bit closer... tell me a tiny <em>secret</em> nobody knows:",
      placeholder: "whisper it here...",
      stepClass: "step-3"
    }
  ];

  let currentStep = 0;
  let jumpscareTriggered = false;
  let teaseTimeout = null;

  // --- DOM Elements ---
  const quizStage = document.getElementById('quizStage');
  const quizForm = document.getElementById('quizForm');
  const questionLabel = document.getElementById('questionLabel');
  const answerInput = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitBtn');

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

  // Pre-warm local video immediately
  if (scareVideo) {
    scareVideo.load();
  }

  // --- Render Question Step ---
  function renderStep(index) {
    const q = questions[index];
    if (!q) return;

    // Gentle fade transition
    questionLabel.style.opacity = '0';

    setTimeout(() => {
      questionLabel.innerHTML = q.html;
      questionLabel.className = `question-text ${q.stepClass}`;
      answerInput.placeholder = q.placeholder;
      answerInput.value = '';
      answerInput.focus();
      questionLabel.style.opacity = '1';
    }, 120);

    // Warm video buffers during step progression
    if (scareVideo) {
      try { scareVideo.load(); } catch (e) {}
    }
    if (ytReady && ytPlayer) {
      try { ytPlayer.seekTo(8.2, true); } catch (e) {}
    }
  }

  // --- Form & Input Navigation ---
  function handleNext() {
    // If empty on Q1 or Q2, gentle nudge
    if (currentStep < 2 && !answerInput.value.trim()) {
      answerInput.classList.add('shake-screen');
      setTimeout(() => answerInput.classList.remove('shake-screen'), 400);
      answerInput.focus();
      return;
    }

    if (currentStep < 2) {
      currentStep++;
      renderStep(currentStep);
    } else {
      // Step 3 submitted -> JUMPSCARE TRIGGER
      triggerJumpscare();
    }
  }

  quizForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleNext();
  });

  answerInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  });

  // --- JUMPSCARE LAUNCH (Instant zero-latency trigger) ---
  function triggerJumpscare() {
    if (jumpscareTriggered) return;
    jumpscareTriggered = true;

    // 1. Immediately hide quiz stage (0ms delay)
    quizStage.style.display = 'none';

    // 2. Activate full screen scare overlay
    scareContainer.classList.add('active');
    document.body.classList.add('shake-screen');

    // 3. Strobe flash
    screenFlash.classList.add('flash-anim');

    // 4. Mobile haptic vibration
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 200, 50, 400, 50, 500]);
      } catch (e) {}
    }

    // 5. Fullscreen request (within user gesture context)
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch (e) {}

    // 6. Audio/Video Playback
    const useYT = preferYouTube && ytReady && ytPlayer;

    if (useYT) {
      ytPlayerContainer.classList.remove('hidden');
      scareVideo.classList.add('hidden');
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
        ytPlayer.seekTo(8.2, true);
        ytPlayer.playVideo();
      } catch (err) {
        playLocalVideo();
      }
    } else {
      playLocalVideo();
    }

    // 7. Post-Scare Tease at 3.3s (scene ending)
    teaseTimeout = setTimeout(() => {
      endJumpscareAndShowTease(useYT);
    }, 3300);
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

  // --- Replay Reset ---
  replayBtn.addEventListener('click', function () {
    if (teaseTimeout) clearTimeout(teaseTimeout);

    jumpscareTriggered = false;
    currentStep = 0;

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

    quizStage.style.display = 'block';
    renderStep(0);
  });

  // --- Share Prank Link ---
  shareBtn.addEventListener('click', async function () {
    const shareData = {
      title: 'Quick Vibe Check ✨',
      text: 'A quiet 30-second check-in.',
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

  // Initialize
  renderStep(0);

})();
