const beats = Array.from(document.querySelectorAll(".beat"));
const spiral = document.getElementById("spiral");
const spiralPath = document.getElementById("spiralPath");
const storyPanel = document.getElementById("storyPanel");
const storyPanelContent = document.getElementById("storyPanelContent");
const closePanelButton = document.getElementById("closePanel");
const bgMusic = document.getElementById("bgMusic");
const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginChat = document.getElementById("loginChat");
const loginError = document.getElementById("loginError");
const nameCodeInput = document.getElementById("nameCode");
const dayCodeInput = document.getElementById("dayCode");
const loginNext = document.getElementById("loginNext");
const loginSubmit = document.getElementById("loginSubmit");
const loginStepOne = document.querySelector('.login-step[data-step="1"]');
const loginStepTwo = document.querySelector('.login-step[data-step="2"]');
const startConnection = document.getElementById("startConnection");
const syncStatus = document.getElementById("syncStatus");
const syncValue = document.getElementById("syncValue");
const syncSub = document.getElementById("syncSub");
const syncFoot = document.getElementById("syncFoot");
const spiralCore = document.getElementById("spiralCore");
const spiralPathWrap = document.getElementById("spiralPathWrap");
const starfield = document.getElementById("starfield");
const footer = document.getElementById("footer");
const sfxOk = document.getElementById("sfxOk");
const sfxKo = document.getElementById("sfxKo");
const valentineOverlay = document.getElementById("valentineOverlay");
const valentineOverlayText = document.getElementById("valentineOverlayText");
const valentineOverlayBack = document.getElementById("valentineOverlayBack");
let musicPlaying = false;
let carouselTimers = [];
let wasMusicPlayingBeforeVideo = false;
let valentineAccepted = false;
let overlayTypeTimer = null;

const TIMINGS = {
  overlayTypeMs: 80,
  sceneStepMs: 420,
  overlayDelayMs: 200,
  loginLineFirstMs: 28,
  loginLineNextMs: 24,
};

const LOGIN_COPY = {
  intro: [
    "[SYSTEM] Hey Yi, ready for Jon's Valentine gift?",
    "[SYSTEM] First I need to check that it's really you.",
    "[SYSTEM] Let me think........ This one should be easy.",
    "[SYSTEM] Which spanish word I use to call you?",
  ],
  stepTwo: [
    "[SYSTEM] That was kind of easy for you...",
    "[SYSTEM] Somebody could have heard it around.",
    "[SYSTEM] Let's think about something more private then.",
    "[SYSTEM] Tell me Jon's birthday day (just the number) to unlock the page.",
  ],
};

const valentineMessage =
  "Happy Valentine Yi! I am really happy to have been able to meet such an amazing girl like you in my life, in such a far away place like Taiwan. I hope we can make our relation stronger day by day, and be able to make a future together where the opportunities are infinite, more than the stars in the universe. I hope you like this gift I made for you <3";

const tryPlayMusic = async () => {
  try {
    await bgMusic.play();
    musicPlaying = true;
  } catch (error) {
    musicPlaying = false;
  }
};

const MUSIC_TRACKS = {
  login: "audio/chinese.mp3",
  main: "audio/edgerunners_theme.mp3",
  yes: "audio/badbunny.mp3",
};

const setMusicTrack = (src, shouldPlay = true) => {
  if (!bgMusic) {
    return;
  }
  bgMusic.pause();
  wasMusicPlayingBeforeVideo = false;
  bgMusic.src = src;
  bgMusic.load();
  if (shouldPlay) {
    tryPlayMusic();
  }
};

const isAnyVideoPlaying = () =>
  Array.from(document.querySelectorAll(".spiral__panel video")).some(
    (video) => !video.paused && !video.ended
  );

const handleVideoPlay = () => {
  if (!bgMusic) {
    return;
  }
  if (!bgMusic.paused) {
    wasMusicPlayingBeforeVideo = true;
    bgMusic.pause();
  }
};

const handleVideoStop = () => {
  if (!bgMusic) {
    return;
  }
  if (isAnyVideoPlaying()) {
    return;
  }
  if (wasMusicPlayingBeforeVideo) {
    tryPlayMusic();
  }
  wasMusicPlayingBeforeVideo = false;
};

const attachVideoAudioHandlers = (container) => {
  if (!container) {
    return;
  }
  const videos = Array.from(container.querySelectorAll("video"));
  videos.forEach((video) => {
    if (video.dataset.audioBound === "true") {
      return;
    }
    video.dataset.audioBound = "true";
    video.addEventListener("play", handleVideoPlay);
    video.addEventListener("pause", handleVideoStop);
    video.addEventListener("ended", handleVideoStop);
  });
};

const clearCarouselTimers = () => {
  carouselTimers.forEach((timerId) => {
    window.clearInterval(timerId);
  });
  carouselTimers = [];
};

const playSfx = (audioEl) => {
  if (!audioEl) {
    return;
  }
  audioEl.currentTime = 0;
  const playPromise = audioEl.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
};


const getSceneElements = () =>
  [
    document.querySelector(".bg-grid"),
    document.querySelector(".bg-glow"),
    document.querySelector(".bg-image"),
    document.getElementById("timeline"),
    document.querySelector(".hero__copy"),
    footer,
    syncStatus,
  ].filter(Boolean);

const typeSlowText = (text, target, onComplete) => {
  if (!target) {
    return;
  }
  target.textContent = "";
  let index = 0;
  const step = () => {
    if (index >= text.length) {
      if (typeof onComplete === "function") {
        onComplete();
      }
      return;
    }
    target.textContent += text[index];
    index += 1;
    overlayTypeTimer = window.setTimeout(step, TIMINGS.overlayTypeMs);
  };
  step();
};

const getWrappedText = (text, target) => {
  if (!target) {
    return text;
  }
  const computed = window.getComputedStyle(target);
  const font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
  const maxWidth = target.clientWidth || 600;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return text;
  }
  context.font = font;
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) {
    lines.push(line);
  }
  return lines.join("\n");
};

const showValentineOverlay = () => {
  if (!valentineOverlay || !valentineOverlayText) {
    return;
  }
  if (valentineOverlayBack) {
    valentineOverlayBack.style.display = "none";
  }
  valentineOverlay.classList.remove("stage-hidden");
  valentineOverlay.classList.add("stage-visible");
  valentineOverlay.setAttribute("aria-hidden", "false");
  const wrappedMessage = getWrappedText(valentineMessage, valentineOverlayText);
  typeSlowText(wrappedMessage, valentineOverlayText, () => {
    if (valentineOverlayBack) {
      valentineOverlayBack.style.display = "inline-flex";
    }
  });
};

const hideValentineOverlay = () => {
  if (!valentineOverlay) {
    return;
  }
  if (overlayTypeTimer) {
    window.clearTimeout(overlayTypeTimer);
    overlayTypeTimer = null;
  }
  valentineOverlay.classList.add("stage-hidden");
  valentineOverlay.classList.remove("stage-visible");
  valentineOverlay.setAttribute("aria-hidden", "true");
};

const hideSceneSequence = () => {
  const elements = getSceneElements();
  elements.forEach((element, index) => {
    element.dataset.prevHidden = element.classList.contains("stage-hidden") ? "true" : "false";
    window.setTimeout(() => {
      element.classList.add("stage-hidden");
      element.classList.remove("stage-visible");
    }, index * TIMINGS.sceneStepMs);
  });
  const totalDelay = elements.length * TIMINGS.sceneStepMs;
  window.setTimeout(showValentineOverlay, totalDelay + TIMINGS.overlayDelayMs);
};

const restoreSceneSequence = () => {
  const elements = getSceneElements();
  elements.forEach((element, index) => {
    const wasHidden = element.dataset.prevHidden === "true";
    window.setTimeout(() => {
      if (wasHidden) {
        element.classList.add("stage-hidden");
        element.classList.remove("stage-visible");
      } else {
        element.classList.remove("stage-hidden");
        element.classList.add("stage-visible");
      }
    }, index * TIMINGS.sceneStepMs);
  });
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) {
    return;
  }
  if (
    button.classList.contains("panel__close") ||
    button.classList.contains("beat__pin") ||
    button.classList.contains("valentine__no") ||
    button.classList.contains("valentine__yes") ||
    button.id === "loginNext" ||
    button.id === "loginSubmit"
  ) {
    return;
  }
  playSfx(sfxOk);
});

const lockApp = () => {
  document.body.classList.add("is-locked");
  document.body.classList.remove("is-unlocked");
  if (loginScreen) {
    loginScreen.hidden = false;
  }
  const app = document.getElementById("app");
  if (app) {
    app.setAttribute("aria-hidden", "true");
  }
};

const unlockApp = () => {
  document.body.classList.remove("is-locked");
  document.body.classList.add("is-unlocked");
  const app = document.getElementById("app");
  if (app) {
    app.setAttribute("aria-hidden", "false");
  }
  if (loginScreen) {
    loginScreen.hidden = true;
  }
};

const typeLines = (lines, target, onComplete) => {
  if (!target) {
    return;
  }
  let lineIndex = 0;
  let charIndex = 0;
  target.textContent = "";

  const tick = () => {
    if (lineIndex >= lines.length) {
      if (typeof onComplete === "function") {
        onComplete();
      }
      return;
    }
    const line = lines[lineIndex];
    target.textContent += line[charIndex];
    charIndex += 1;

    if (charIndex >= line.length) {
      target.textContent += "\n";
      lineIndex += 1;
      charIndex = 0;
      if (lineIndex >= lines.length) {
        if (typeof onComplete === "function") {
          onComplete();
        }
        return;
      }
    }

    window.setTimeout(
      tick,
      lineIndex === 0 ? TIMINGS.loginLineFirstMs : TIMINGS.loginLineNextMs
    );
  };

  tick();
};

const revealLoginElements = (container) => {
  if (!container) {
    return;
  }
  const items = Array.from(container.querySelectorAll(".login-label, .login-input, .login-submit"));
  items.forEach((item, index) => {
    item.classList.add("login-reveal");
    window.setTimeout(() => {
      item.classList.add("is-visible");
    }, 1000 + index * 1000);
  });
};

lockApp();
setMusicTrack(MUSIC_TRACKS.login, true);
typeLines(LOGIN_COPY.intro, loginChat, () => revealLoginElements(loginStepOne));

if (loginStepTwo) {
  loginStepTwo.classList.add("is-hidden");
}

if (nameCodeInput && loginNext) {
  nameCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loginNext.click();
    }
  });
}

if (dayCodeInput && loginForm) {
  dayCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (typeof loginForm.requestSubmit === "function") {
        loginForm.requestSubmit();
      } else if (loginSubmit) {
        loginSubmit.click();
      }
    }
  });
}

if (loginNext) {
  loginNext.addEventListener("click", () => {
    if (!nameCodeInput) {
      return;
    }
    const nameValue = nameCodeInput.value.trim().toLowerCase();
    if (nameValue !== "princesa") {
      if (loginError) {
        loginError.textContent = "Access denied. Try again. Hint: 8 letters, starts with P";
      }
      playSfx(sfxKo);
      return;
    }
    playSfx(sfxOk);
    if (loginError) {
      loginError.textContent = "";
    }
    loginNext.classList.remove("is-visible");
    window.setTimeout(() => {
      if (loginStepOne) {
        loginStepOne.classList.add("is-hidden");
      }
      typeLines(
        LOGIN_COPY.stepTwo,
        loginChat,
        () => {
          if (loginStepTwo) {
            loginStepTwo.classList.remove("is-hidden");
            revealLoginElements(loginStepTwo);
          }
        }
      );
    }, 350);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dayCodeInput) {
      return;
    }
    const dayValue = dayCodeInput.value.trim();
    if (dayValue === "26") {
      unlockApp();
      setMusicTrack(MUSIC_TRACKS.main, true);
      playSfx(sfxOk);
      return;
    }
    if (loginError) {
      loginError.textContent = "Access denied. Try again. Hint: September";
    }
    playSfx(sfxKo);
  });
}

const revealStage = (element) => {
  if (!element) {
    return;
  }
  element.classList.remove("stage-hidden");
  element.classList.add("stage-visible");
};

const finalizeConnection = () => {
  if (syncStatus) {
    syncStatus.classList.add("is-connected");
  }
  if (syncValue) {
    syncValue.textContent = "Connected";
  }
  if (syncSub) {
    syncSub.textContent = "Forever yours, Yi";
  }
  if (syncFoot) {
    syncFoot.textContent = "Valentine confirmed.";
  }
  document.body.classList.remove("valentine-celebrate");
  void document.body.offsetWidth;
  document.body.classList.add("valentine-celebrate");
};

const bindValentineActions = () => {
  if (!storyPanelContent) {
    return;
  }
  const yesButton = storyPanelContent.querySelector(".valentine__yes");
  const noButton = storyPanelContent.querySelector(".valentine__no");
  const errorText = storyPanelContent.querySelector(".valentine__error");
  const valentineCard = storyPanelContent.querySelector(".valentine");

  if (valentineAccepted && valentineCard) {
    valentineCard.style.display = "none";
    return;
  }

  if (yesButton) {
    yesButton.addEventListener(
      "click",
      () => {
        playSfx(sfxOk);
        setMusicTrack(MUSIC_TRACKS.yes, true);
        finalizeConnection();
        valentineAccepted = true;
        if (valentineCard) {
          valentineCard.classList.add("is-hidden");
          window.setTimeout(() => {
            valentineCard.style.display = "none";
          }, 350);
        }
        closeStoryPanel();
        hideSceneSequence();
      },
      { once: true }
    );
  }

  if (noButton) {
    noButton.addEventListener("click", () => {
      playSfx(sfxKo);
      noButton.classList.remove("is-glitch");
      void noButton.offsetWidth;
      noButton.classList.add("is-glitch");
      if (errorText) {
        errorText.textContent = "ERROR 0xE1: Permission denied. Love protocol locked.";
      }
    });
  }
};

const setupMediaCarousels = (container) => {
  if (!container) {
    return;
  }
  clearCarouselTimers();
  const grids = Array.from(container.querySelectorAll(".beat__media-grid"));
  grids.forEach((grid) => {
    const items = Array.from(grid.children).filter((child) =>
      child.matches("img, video")
    );
    if (items.length <= 1) {
      return;
    }

    const carousel = document.createElement("div");
    carousel.className = "media-carousel";
    carousel.dataset.index = "0";

    const track = document.createElement("div");
    track.className = "media-carousel__track";

    items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "media-carousel__item";
      wrapper.appendChild(item);
      track.appendChild(wrapper);
    });

    const update = (nextIndex) => {
      const maxIndex = items.length - 1;
      const index = Math.max(0, Math.min(nextIndex, maxIndex));
      carousel.dataset.index = String(index);
      track.style.transform = `translateX(-${index * 100}%)`;
      const wrappers = Array.from(track.querySelectorAll(".media-carousel__item"));
      wrappers.forEach((wrapper, wrapperIndex) => {
        const videos = Array.from(wrapper.querySelectorAll("video"));
        if (wrapperIndex !== index) {
          videos.forEach((video) => video.pause());
        }
      });
    };

    carousel.appendChild(track);
    grid.replaceWith(carousel);

    update(0);

    const timerId = window.setInterval(() => {
      const current = Number.parseInt(carousel.dataset.index || "0", 10);
      const nextIndex = (current + 1) % items.length;
      update(nextIndex);
    }, 5000);
    carouselTimers.push(timerId);
  });
};

if (startConnection) {
  startConnection.addEventListener("click", () => {
    startConnection.disabled = true;
    startConnection.classList.add("stage-hidden");
    if (syncStatus) {
      syncStatus.classList.add("is-connecting");
    }
    if (syncValue) {
      syncValue.textContent = "Connecting";
    }
    if (syncSub) {
      syncSub.textContent = "Keelung → San Sebastian";
    }
    if (syncFoot) {
      syncFoot.textContent = "Signal bridging...";
    }
    const beatsInOrder = Array.from(document.querySelectorAll(".beat"));
    const connectionDuration = 3200;
    window.setTimeout(() => {
      if (syncStatus) {
        syncStatus.classList.remove("is-connecting");
        syncStatus.classList.add("is-connected");
      }
      if (syncValue) {
        syncValue.textContent = "Hearts aligned";
      }
      if (syncSub) {
        syncSub.textContent = "Waiting for Valentine confirmation";
      }
      if (syncFoot) {
        syncFoot.textContent = "Connection locked in.";
      }

      let delay = 0;
      window.setTimeout(() => revealStage(spiralCore), delay);
      delay += 1000;
      beatsInOrder.forEach((beat) => {
        window.setTimeout(() => revealStage(beat), delay);
        delay += 1000;
      });
      window.setTimeout(() => revealStage(spiralPathWrap), delay);
      delay += 1000;
      window.setTimeout(() => revealStage(starfield), delay);
      delay += 1000;
      window.setTimeout(() => revealStage(footer), delay);
    }, connectionDuration);
  });
}

const closeStoryPanel = () => {
  if (!storyPanel || storyPanel.hidden) {
    return;
  }
  clearCarouselTimers();
  handleVideoStop();
  storyPanel.classList.remove("is-opening");
  storyPanel.classList.add("is-closing");
  const onClose = () => {
    storyPanel.hidden = true;
    storyPanel.classList.remove("is-closing");
    document.body.classList.remove("valentine-celebrate");
  };
  storyPanel.addEventListener("animationend", onClose, { once: true });
  window.setTimeout(onClose, 450);
};

const twistScale = 0.06;

const pseudoRandom = (seed) => {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const layoutSpiral = () => {
  if (!spiral) {
    return;
  }

  const rect = spiral.getBoundingClientRect();
  const safeLeft = rect.width * 0.1;
  const safeRight = rect.width * 0.9;
  const safeTop = rect.height * 0.03;
  const safeBottom = rect.height * 0.9;
  const points = [{ x: rect.width / 2, y: rect.height / 2 }];
  const layoutPositions = [
    { x: 0.52, y: 0.00 },
    { x: 0.95, y: 0.14 },
    { x: 0.78, y: 0.42 },
    { x: 0.98, y: 0.87 },
    { x: 0.42, y: 0.94 },
    { x: 0.05, y: 0.53 },
  ];

  beats.forEach((beat, index) => {
    const pos = layoutPositions[index] ?? {
      x: 0.3 + (index % 3) * 0.2,
      y: 0.3 + Math.floor(index / 3) * 0.2,
    };
    const x = safeLeft + pos.x * (safeRight - safeLeft);
    const y = safeTop + pos.y * (safeBottom - safeTop);

    beat.style.left = `${x}px`;
    beat.style.top = `${y}px`;
  });

  beats.forEach((beat) => {
    const dot = beat.querySelector(".beat__dot");
    if (!dot) {
      return;
    }
    const dotRect = dot.getBoundingClientRect();
    const spiralRect = spiral.getBoundingClientRect();
    points.push({
      x: dotRect.left - spiralRect.left + dotRect.width / 2,
      y: dotRect.top - spiralRect.top + dotRect.height / 2,
    });
  });

  if (spiralPath) {
    let d = `M ${points[0].x} ${points[0].y}`;
    const curveAmp = Math.min(rect.width, rect.height) * twistScale;

    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const rand = pseudoRandom((i + 4) * 4311);
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      const offset = (rand() - 0.5) * curveAmp;
      const controlX = midX + nx * offset;
      const controlY = midY + ny * offset;

      d += ` Q ${controlX} ${controlY} ${curr.x} ${curr.y}`;
    }

    spiralPath.setAttribute("d", d);
  }
};

layoutSpiral();
window.addEventListener("resize", layoutSpiral);

beats.forEach((beat) => {
  const pin = beat.querySelector(".beat__pin");
  const story = beat.querySelector(".beat__story");
  if (!pin) {
    return;
  }

  pin.addEventListener("click", () => {
    const isOpen = beat.classList.contains("is-active");
    beats.forEach((item) => {
      item.classList.remove("is-active");
      const button = item.querySelector(".beat__pin");
      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });

    if (isOpen) {
      closeStoryPanel();
      return;
    }

    playSfx(sfxOk);

    if (story && storyPanel && storyPanelContent) {
      beat.classList.add("is-active");
      pin.setAttribute("aria-expanded", "true");
      storyPanelContent.innerHTML = story.innerHTML;
      setupMediaCarousels(storyPanelContent);
      attachVideoAudioHandlers(storyPanelContent);
      bindValentineActions();
      if (storyPanel.hidden) {
        storyPanel.hidden = false;
        storyPanel.classList.remove("is-closing");
        storyPanel.classList.remove("is-opening");
        void storyPanel.offsetWidth;
        storyPanel.classList.add("is-opening");
      }
    }
  });
});

if (closePanelButton) {
  closePanelButton.addEventListener("click", () => {
    beats.forEach((item) => {
      item.classList.remove("is-active");
      const button = item.querySelector(".beat__pin");
      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });

    closeStoryPanel();
  });
}

if (valentineOverlayBack) {
  valentineOverlayBack.addEventListener("click", () => {
    hideValentineOverlay();
    restoreSceneSequence();
  });
}
