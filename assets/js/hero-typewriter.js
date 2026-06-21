(() => {
  const textEl = document.getElementById("heroTypewriterText");
  const sizerEl = document.querySelector(".hero-typewriter-sizer");
  if (!textEl) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const phrasesEl = document.getElementById("heroTypewriterPhrases");
  let phrases = [
    "Software that ships.",
    "Platforms that scale.",
    "Brands that grow.",
  ];

  if (phrasesEl) {
    try {
      const parsed = JSON.parse(phrasesEl.textContent);
      if (Array.isArray(parsed) && parsed.length) {
        phrases = parsed;
      }
    } catch (_) {
      /* keep defaults */
    }
  }

  if (sizerEl) {
    sizerEl.textContent = phrases.reduce((longest, phrase) => (
      phrase.length > longest.length ? phrase : longest
    ), phrases[0]);
  }

  const typeSpeed = 54;
  const deleteSpeed = 26;
  const pauseEnd = 2600;
  const pauseStart = 420;

  const initial = textEl.textContent.trim();
  let phraseIndex = phrases.indexOf(initial);
  if (phraseIndex < 0) phraseIndex = 0;

  let charIndex = initial.length;
  let deleting = false;
  let timer = null;

  const setText = (text) => {
    textEl.textContent = text || "\u00a0";
  };

  const schedule = (fn, delay) => {
    timer = window.setTimeout(fn, delay);
  };

  const tick = () => {
    const current = phrases[phraseIndex];

    if (!deleting) {
      if (charIndex < current.length) {
        charIndex += 1;
        setText(current.slice(0, charIndex));
        schedule(tick, typeSpeed + Math.random() * 28);
        return;
      }

      schedule(() => {
        deleting = true;
        tick();
      }, pauseEnd);
      return;
    }

    if (charIndex > 0) {
      charIndex -= 1;
      setText(current.slice(0, charIndex));
      schedule(tick, deleteSpeed);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    schedule(tick, pauseStart);
  };

  schedule(() => {
    deleting = true;
    tick();
  }, pauseEnd);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && timer) {
      window.clearTimeout(timer);
      timer = null;
    } else if (!document.hidden && !timer) {
      schedule(() => {
        deleting = true;
        tick();
      }, 800);
    }
  });
})();
