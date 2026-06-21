(() => {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navBackdrop = document.getElementById("navBackdrop");
  const navIndicator = document.getElementById("navIndicator");
  const scrollProgress = document.getElementById("scrollProgress");
  const heroMark = document.querySelector(".hero-mark");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = () => {
    navLinks?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", navToggle?.dataset.openLabel || "Open menu");
    navBackdrop?.classList.remove("is-visible");
    navBackdrop?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    navLinks?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    navToggle?.setAttribute("aria-label", navToggle?.dataset.closeLabel || "Close menu");
    navBackdrop?.classList.add("is-visible");
    navBackdrop?.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  const setNavState = () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > 24);
  };

  const backToTop = document.getElementById("backToTop");

  const setBackToTopState = () => {
    backToTop?.classList.toggle("is-visible", window.scrollY > 480);
  };

  const setScrollProgress = () => {
    if (!scrollProgress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  };

  const setHeroParallax = () => {
    if (!heroMark) return;
    if (prefersReducedMotion || window.innerWidth < 900) {
      heroMark.style.transform = "";
      return;
    }
    const offset = Math.min(window.scrollY * 0.15, 80);
    heroMark.style.transform = `translateY(${offset}px)`;
  };

  const updateNavIndicator = () => {
    if (!navLinks || !navIndicator || window.innerWidth < 900) {
      navIndicator?.style.setProperty("opacity", "0");
      return;
    }

    const active = navLinks.querySelector("a.active");
    if (!active) {
      navIndicator.style.opacity = "0";
      return;
    }

    navIndicator.style.width = `${active.offsetWidth}px`;
    navIndicator.style.left = `${active.offsetLeft}px`;
    navIndicator.style.opacity = "1";
  };

  const onScroll = () => {
    setNavState();
    setBackToTopState();
    setScrollProgress();
    setHeroParallax();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    updateNavIndicator();
    setHeroParallax();
  });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  navToggle?.addEventListener("click", () => {
    if (navLinks?.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navBackdrop?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  const sections = document.querySelectorAll("[data-section]");
  const navItems = document.querySelectorAll("[data-nav]");
  const sectionBreaks = document.querySelectorAll(".section-break");
  const projectJumpLinks = document.querySelectorAll(".project-jump a");
  const projectAnchors = ["project-recycle", "project-tradeflow", "project-clients"];
  const currentPage = document.body.dataset.page;

  if (currentPage) {
    navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.nav === currentPage);
    });
    updateNavIndicator();
  }

  const sectionInViewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );

  sections.forEach((section) => sectionInViewObserver.observe(section));
  sectionBreaks.forEach((el) => sectionInViewObserver.observe(el));

  if (projectJumpLinks.length) {
    const jumpObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            projectJumpLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    projectAnchors.forEach((id) => {
      const el = document.getElementById(id);
      if (el) jumpObserver.observe(el);
    });
  }

  updateNavIndicator();

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal, .section-break").forEach((el) => {
      el.classList.add("is-visible", "is-inview");
    });
    sections.forEach((section) => section.classList.add("is-inview"));
  }

  const form = document.getElementById("contactForm");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const subject = encodeURIComponent(`KASPERA Inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:alimiatdhe9@gmail.com?subject=${subject}&body=${body}`;
  });
})();
