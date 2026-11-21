/**
 * Quick Vibe Check ✨ - Prank Web Application
 * Progressive Shrinking Mechanic + Zero Buffering Jumpscare
 */

(function () {
  'use strict';

  // --- Configuration & Questions ---
  const questions = [
    {
      step: 1,
      title: "Hey! Quick question... how was your day today? ☀️",
      hint: "Be honest, no wrong answers!",
      placeholder: "Type your thoughts here...",
      btnText: "Next",
      stepClass: "step-1",
      progress: "33.3%",
      stepIndicator: "Question 1 of 3"
    },
    {
      step: 2,
      title: "Nice. What's one random thing that made you smile recently?",
      hint: "Even the tiniest little thing counts...",
      placeholder: "A memory, a meme, anything...",
      btnText: "Next",
      stepClass: "step-2",
      progress: "66.6%",
      stepIndicator: "Question 2 of 3"
    },
    {
      step: 3,
      // The progressive shrinking mechanic: 9px font size & faint color
      // Forces the user to physically lean closer to the screen to read!
      title: "Wait, lean in a bit closer... tell me a tiny secret nobody knows:",
      hint: "(whisper it here, promise it stays between us...)",
      placeholder: "whisper your secret here...",
      btnText: "Finish & See Vibe Score ✨",
      stepClass: "step-3",
      progress: "100%",
      stepIndicator: "Question 3 of 3"
    }
  ];

  let currentStep = 0;
  let jumpscareTriggered = false;
  let teaseTimeout = null;

  // --- DOM Elements ---
  const quizCard = document.getElementById('quizCard');
  const quizForm = document.getElementById('quizForm');
  const questionLabel = document.getElementById('questionLabel');
  const questionHint = document.getElementById('questionHint');
  const answerInput = document.getElementById('answerInput');
  const nextBtn = document.getElementById('nextBtn');
  const btnText = document.getElementById('btnText');
  const progressBar = document.getElementById('progressBar');
  const stepIndicator = document.getElementById('stepIndicator');

  const scareContainer = document.getElementById('scareContainer');
  const scareVideo = document.getElementById('scareVideo');
  const ytPlayerContainer = document.getElementById('ytPlayerContainer');
  const screenFlash = document.getElementById('screenFlash');
  const teaseOverlay = document.getElementById('teaseOverlay');
  const replayBtn = document.getElementById('replayBtn');
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('toast');

  // Check URL param for explicit source override: ?source=youtube vs ?source=local (default: local)
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
            // Pre-seek and buffer muted in background
            try {
              event.target.mute();
              event.target.seekTo(8.2, true);
            } catch (err) {
              console.warn("YouTube preload buffer notice:", err);
            }
          }
        }
      });
    } catch (e) {
      console.warn("YouTube API init:", e);
    }
  };

  // Preload & warm local video immediately
  if (scareVideo) {
    scareVideo.load();
  }

  // --- Step Rendering Function ---
  function renderStep(index) {
    const q = questions[index];
    if (!q) return;

    // Smooth transition
    questionLabel.style.opacity = '0';
    questionHint.style.opacity = '0';

    setTimeout(() => {
      // Update text
      questionLabel.textContent = q.title;
      questionHint.textContent = q.hint;
      answerInput.placeholder = q.placeholder;
      btnText.textContent = q.btnText;
      progressBar.style.width = q.progress;
      stepIndicator.textContent = q.stepIndicator;

      // Update progressive shrinking classes
      questionLabel.className = `question-text ${q.stepClass}`;
      questionHint.className = `question-hint ${q.stepClass}`;

      // Clear input and focus
      answerInput.value = '';
      answerInput.focus();

      // Fade in
      questionLabel.style.opacity = '1';
      questionHint.style.opacity = '1';
    }, 150);

    // Warm video buffers during step changes
    if (scareVideo) {
      try {
        scareVideo.load();
      } catch (e) {}
    }
    if (ytReady && ytPlayer) {
      try {
        ytPlayer.seekTo(8.2, true);
      } catch (e) {}
    }
  }

  // --- Advance or Trigger Jumpscare ---
  function handleNext() {
    // If the input is empty on Q1 or Q2, provide a gentle visual nudge
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
      // Step 3 submitted -> TRIGGER JUMPSCARE IMMEDIATELY
      triggerJumpscare();
    }
  }

  // Form submit (handles Enter key & button click)
  quizForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleNext();
  });

  // Enter key handling on input
  answerInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  });

  // --- JUMPSCARE LAUNCH (Zero Latency Execution) ---
  function triggerJumpscare() {
    if (jumpscareTriggered) return;
    jumpscareTriggered = true;

    // 1. Immediately hide quiz card with 0ms transition
    quizCard.style.display = 'none';

    // 2. Show fullscreen scare container
    scareContainer.classList.add('active');
    document.body.classList.add('shake-screen');

    // 3. Screen flash strobe effect
    screenFlash.classList.add('flash-anim');

    // 4. Trigger mobile haptic vibration
    if ('vibrate' in navigator) {
      try {
        // High intensity pulsing vibration pattern
        navigator.vibrate([100, 50, 200, 50, 400, 50, 500]);
      } catch (err) {
        console.warn("Vibration error:", err);
      }
    }

    // 5. Request fullscreen if allowed (user interaction callstack)
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } catch (err) {
      // Fullscreen policy restriction fallback
    }

    // 6. Play the jumpscare video with zero buffering delay
    const useYT = preferYouTube && ytReady && ytPlayer;

    if (useYT) {
      // YouTube Player branch
      ytPlayerContainer.classList.remove('hidden');
      scareVideo.classList.add('hidden');
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
        ytPlayer.seekTo(8.2, true);
        ytPlayer.playVideo();
      } catch (e) {
        console.error("YouTube play error, falling back to local video:", e);
        playLocalVideo();
      }
    } else {
      // Local MP4 branch (Zero buffering delay, instant sound)
      playLocalVideo();
    }

    // 7. Post-Scare Tease at 3.3 seconds (11.5s mark of the scene)
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
      playPromise.catch((err) => {
        console.warn("Autoplay blocked or local video error:", err);
        // If sound blocked, retry with muted fallback or user tap
        scareVideo.muted = true;
        scareVideo.play();
      });
    }
  }

  // --- Post-Scare Tease: "Darr gayi na? 😛" ---
  function endJumpscareAndShowTease(usedYT) {
    // Pause video
    if (usedYT && ytPlayer) {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    } else if (scareVideo) {
      scareVideo.pause();
    }

    // Remove screen shake
    document.body.classList.remove('shake-screen');

    // Reveal floating tease pill
    teaseOverlay.classList.remove('hidden');
    // Allow slight frame delay for CSS transition
    requestAnimationFrame(() => {
      teaseOverlay.classList.add('visible');
    });
  }

  // --- Replay Button: Reset Quiz State ---
  replayBtn.addEventListener('click', function () {
    if (teaseTimeout) clearTimeout(teaseTimeout);

    // Reset flags & state
    jumpscareTriggered = false;
    currentStep = 0;

    // Reset tease overlay
    teaseOverlay.classList.remove('visible');
    setTimeout(() => {
      teaseOverlay.classList.add('hidden');
    }, 300);

    // Reset video & container
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

    // Exit fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch (e) {}
    }

    // Bring back quiz card
    quizCard.style.display = 'block';
    renderStep(0);
  });

  // --- Share Button: Copy link to clipboard / Web Share API ---
  shareBtn.addEventListener('click', async function () {
    const shareData = {
      title: 'Quick Vibe Check ✨',
      text: 'Take this 30-second aesthetic vibe check to see your aura & mood score today!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or unsupported, fallback to copy
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied! Send it to your next victim 😈");
    } catch (e) {
      // Older browser fallback
      const tempInput = document.createElement('input');
      tempInput.value = window.location.href;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast("Link copied! Send it to your next victim 😈");
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

  // --- Initial Render ---
  renderStep(0);

})();
