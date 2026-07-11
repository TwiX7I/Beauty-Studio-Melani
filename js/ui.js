"use strict";

(function createUiModule() {
  const { BUSINESS_INFO } = window.MelaniData;
  const { openCoverageQuestion } = window.MelaniWhatsApp;

  function initMenu() {
    const button = document.querySelector("#menuButton");
    const menu = document.querySelector("#navMenu");
    if (!button || !menu) return;
    button.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menu.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".header")) {
        menu.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initFaqs() {
    document.querySelectorAll(".faq-item > button").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const willOpen = !item.classList.contains("is-open");
        document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
          openItem.classList.remove("is-open");
          openItem.querySelector("button").setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("is-open", willOpen);
        button.setAttribute("aria-expanded", String(willOpen));
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
      });
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function preferredScrollBehavior() {
    return document.documentElement.dataset.motion === "lite" || prefersReducedMotion() ? "auto" : "smooth";
  }

  function initDirectWhatsappLinks() {
    document.querySelectorAll("[data-direct-whatsapp]").forEach((link) => {
      if (link.dataset.directWhatsappReady === "true") return;
      link.dataset.directWhatsappReady = "true";
      link.addEventListener("click", (event) => {
        if (link.dataset.tapLocked === "true") {
          event.preventDefault();
          return;
        }
        link.dataset.tapLocked = "true";
        window.setTimeout(() => {
          delete link.dataset.tapLocked;
        }, 1200);
      }, { passive: false });
    });
  }

  function initFloatingWhatsApp() {
    const floatingWhatsapp = document.querySelector("#floatingWhatsapp");
    if (floatingWhatsapp && !floatingWhatsapp.matches("[data-direct-whatsapp]")) {
      floatingWhatsapp.setAttribute("data-reserve-id", "general");
    }
    initDirectWhatsappLinks();
    document.querySelector("#coverageButton")?.addEventListener("click", openCoverageQuestion);
  }

  function initPerformanceMode() {
    const root = document.documentElement;
    const params = new URLSearchParams(window.location.search);
    const requestedMotion = params.get("motion");
    const hardwareConcurrency = navigator.hardwareConcurrency;
    const deviceMemory = navigator.deviceMemory;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    const hasLowCpu = typeof hardwareConcurrency === "number" && hardwareConcurrency <= 2;
    const hasLowMemory = typeof deviceMemory === "number" && deviceMemory <= 2;
    const saveData = Boolean(connection && connection.saveData);
    const forceLite = requestedMotion === "lite" || params.get("lite") === "1" || params.get("low") === "1";
    const forceBalanced = requestedMotion === "balanced";
    const forceFull = requestedMotion === "full";
    const performanceDebug = params.get("performance-debug") === "1";
    const fullCandidate = typeof hardwareConcurrency === "number"
      && hardwareConcurrency >= 6
      && (typeof deviceMemory !== "number" || deviceMemory >= 4);
    let motionProfile = "balanced";

    if (forceFull) {
      motionProfile = "full";
    } else if (forceBalanced) {
      motionProfile = "balanced";
    } else if (forceLite || hasLowCpu || hasLowMemory || saveData || prefersReducedMotion()) {
      motionProfile = "lite";
    } else if (fullCandidate) {
      motionProfile = "full";
    }

    root.dataset.motion = motionProfile;
    root.classList.toggle("low-performance", motionProfile === "lite");
    root.classList.toggle("performance-debug", performanceDebug);

    if (performanceDebug && !window.__melaniPerformanceDebugReady) {
      window.__melaniPerformanceDebugReady = true;
      window.__melaniPerformanceErrors = [];
      window.addEventListener("error", (event) => {
        window.__melaniPerformanceErrors.push({
          type: "error",
          message: event.message,
          source: event.filename,
          line: event.lineno
        });
      });
      window.addEventListener("unhandledrejection", (event) => {
        window.__melaniPerformanceErrors.push({
          type: "unhandledrejection",
          message: String(event.reason?.message || event.reason || "Unknown rejection")
        });
      });
    }

    document.addEventListener("visibilitychange", () => {
      root.classList.toggle("page-hidden", document.hidden);
    });
  }

  function initPerformanceDebug() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("performance-debug") !== "1") return;
    const root = document.documentElement;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    const lazyImages = document.querySelectorAll('img[loading="lazy"]').length;
    const eagerImages = document.querySelectorAll('img:not([loading="lazy"])').length;
    const animatedElements = document.querySelectorAll(".motion-enter, .reveal, .hero-motion").length;

    console.log({
      motionProfile: root.dataset.motion || "balanced",
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      saveData: Boolean(connection && connection.saveData),
      effectiveType: connection?.effectiveType,
      reducedMotion: prefersReducedMotion(),
      animatedElements,
      lazyImages,
      eagerImages,
      initialLoadMs: Math.round(performance.now()),
      errorsDetected: window.__melaniPerformanceErrors || []
    });
  }

  function initPromotionCarousel() {
    const track = document.querySelector("#promotionsGrid");
    const nextButton = document.querySelector("#promotionsNext");
    const dots = [...document.querySelectorAll("[data-promotion-dot]")];
    if (!track) return;

    const cards = [...track.querySelectorAll(".promotion-card")];
    if (!cards.length) return;
    let scrollFrame = 0;

    function setActiveDot(index) {
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function currentIndex() {
      const trackLeft = track.getBoundingClientRect().left;
      let activeIndex = 0;
      let shortestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          activeIndex = index;
        }
      });

      return activeIndex;
    }

    function goToPromotion(index) {
      const targetIndex = (index + cards.length) % cards.length;
      cards[targetIndex].scrollIntoView({ behavior: preferredScrollBehavior(), inline: "start", block: "nearest" });
      setActiveDot(targetIndex);
    }

    nextButton?.addEventListener("click", () => {
      goToPromotion(currentIndex() + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goToPromotion(Number(dot.dataset.promotionDot || 0));
      });
    });

    track.addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        setActiveDot(currentIndex());
      });
    }, { passive: true });
  }

  function initBusinessInfo() {
    const zone = document.querySelector("#businessZone");
    if (zone) zone.textContent = BUSINESS_INFO.zone;
  }

  function initAnimations() {
    const root = document.documentElement;
    const staggerGroups = document.querySelectorAll(".benefits, .steps, .services-grid, .promotions-grid, .gallery-grid, .faq-list");
    const motionProfile = root.dataset.motion || "balanced";
    const staggerStep = motionProfile === "full" ? 55 : motionProfile === "balanced" ? 35 : 12;
    const staggerMax = motionProfile === "full" ? 180 : motionProfile === "balanced" ? 120 : 20;
    const runningDuration = motionProfile === "full" ? 520 : motionProfile === "balanced" ? 400 : 220;
    let revealFrame = 0;

    function markMotionRunning(element) {
      element.classList.add("motion-running");
      window.setTimeout(() => element.classList.remove("motion-running"), runningDuration);
    }

    function revealElement(element) {
      element.classList.add("is-visible");
      element.style.removeProperty("visibility");
      element.style.removeProperty("opacity");
      markMotionRunning(element);
    }

    function revealAllContent() {
      document
        .querySelectorAll(".reveal, .hero-reveal, .hero-motion, .motion-enter, [data-reveal]")
        .forEach(revealElement);
    }

    function isNearViewport(element, margin = 140) {
      const rect = element.getBoundingClientRect();
      return rect.bottom >= -margin && rect.top <= window.innerHeight + margin;
    }

    function revealVisibleContent() {
      document
        .querySelectorAll(".reveal:not(.is-visible), .hero-reveal:not(.is-visible), .hero-motion:not(.is-visible), .motion-enter:not(.is-visible), [data-reveal]:not(.is-visible)")
        .forEach((element) => {
          if (isNearViewport(element)) revealElement(element);
        });
    }

    function scheduleRevealCheck() {
      if (revealFrame) return;
      revealFrame = window.requestAnimationFrame(() => {
        revealFrame = 0;
        revealVisibleContent();
      });
    }

    document.querySelectorAll(".section, .benefits, .about-card, .final-cta, .sweet-footer, .footer-premium, .zone-card, .hero-benefits").forEach((section) => {
      section.classList.add("reveal", "motion-enter");
      section.dataset.reveal = "";
    });

    staggerGroups.forEach((group) => {
      [...group.children].forEach((child, index) => {
        child.classList.add("reveal", "reveal-card", "motion-enter");
        child.dataset.reveal = "";
        child.style.setProperty("--reveal-delay", `${Math.min(index * staggerStep, staggerMax)}ms`);
      });
    });

    const heroItems = [
      document.querySelector(".brand"),
      document.querySelector(".hero__copy"),
      document.querySelector(".hero__eyebrow"),
      document.querySelector(".hero__copy h1"),
      document.querySelector(".hero__copy p:not(.hero__eyebrow)"),
      document.querySelector(".hero__actions"),
      document.querySelector(".hero__model-wrap"),
      document.querySelector(".quick-benefits-card, .benefits")
    ].filter(Boolean);

    heroItems.forEach((element, index) => {
      element.classList.add("hero-motion", "motion-enter");
      element.style.setProperty("--reveal-delay", `${Math.min(index * staggerStep, staggerMax)}ms`);
    });

    root.classList.add("motion-ready");

    window.requestAnimationFrame(() => {
      document
        .querySelectorAll(".hero .reveal, .hero-reveal, .hero [data-reveal], .hero .motion-enter")
        .forEach(revealElement);
      heroItems.forEach(revealElement);
    });

    window.setTimeout(revealVisibleContent, 1200);
    window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
    window.addEventListener("resize", scheduleRevealCheck, { passive: true });

    const elements = document.querySelectorAll(".reveal, .hero-reveal, .motion-enter, [data-reveal]");
    if (!("IntersectionObserver" in window)) {
      revealAllContent();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.01, rootMargin: "80px 0px 80px 0px" });
    elements.forEach((element) => observer.observe(element));
  }

  window.MelaniUI = { initMenu, initFaqs, initSmoothScroll, initFloatingWhatsApp, initPerformanceMode, initPromotionCarousel, initBusinessInfo, initAnimations, initPerformanceDebug };
})();
