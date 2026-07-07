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

  function initFloatingWhatsApp() {
    document.querySelector("#floatingWhatsapp")?.setAttribute("data-reserve-id", "general");
    document.querySelector("#coverageButton")?.addEventListener("click", openCoverageQuestion);
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

  window.MelaniUI = { initMenu, initFaqs, initSmoothScroll, initFloatingWhatsApp, initPromotionCarousel, initBusinessInfo, initAnimations };
})();
