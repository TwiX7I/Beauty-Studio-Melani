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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
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
    const cores = Number(navigator.hardwareConcurrency || 0);
    const memory = Number(navigator.deviceMemory || 0);
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSmallAndroid = /Android/i.test(navigator.userAgent) && window.matchMedia("(max-width: 560px)").matches;
    const isLowCpu = cores > 0 && cores <= 4;
    const isLowMemory = memory > 0 && memory <= 4;
    const savesData = Boolean(connection && connection.saveData);
    const slowConnection = Boolean(connection && ["slow-2g", "2g", "3g"].includes(connection.effectiveType));
    const reducesMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const manualLite = params.get("lite") === "1" || params.get("low") === "1";

    if (manualLite || isSmallAndroid || isLowCpu || isLowMemory || savesData || slowConnection || reducesMotion) {
      root.classList.add("low-performance");
    }
  }

  function initPromotionCarousel() {
    const track = document.querySelector("#promotionsGrid");
    const nextButton = document.querySelector("#promotionsNext");
    const dots = [...document.querySelectorAll("[data-promotion-dot]")];
    if (!track) return;

    const cards = [...track.querySelectorAll(".promotion-card")];
    if (!cards.length) return;

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
      cards[targetIndex].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
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
      window.requestAnimationFrame(() => setActiveDot(currentIndex()));
    }, { passive: true });
  }

  function initBusinessInfo() {
    const zone = document.querySelector("#businessZone");
    if (zone) zone.textContent = BUSINESS_INFO.zone;
  }

  function initAnimations() {
    const sections = document.querySelectorAll(".section, .benefits, .about-card, .final-cta, .sweet-footer");
    const staggerGroups = document.querySelectorAll(".benefits, .steps, .services-grid, .promotions-grid, .gallery-grid, .faq-list");

    sections.forEach((section) => section.classList.add("reveal"));

    staggerGroups.forEach((group) => {
      [...group.children].forEach((child, index) => {
        child.classList.add("reveal", "reveal-card");
        child.style.setProperty("--reveal-delay", `${Math.min(index * 80, 320)}ms`);
      });
    });

    const elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    elements.forEach((element) => observer.observe(element));
  }

  window.MelaniUI = { initMenu, initFaqs, initSmoothScroll, initFloatingWhatsApp, initPerformanceMode, initPromotionCarousel, initBusinessInfo, initAnimations };
})();
