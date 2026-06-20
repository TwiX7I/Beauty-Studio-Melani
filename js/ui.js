"use strict";

(function createUiModule() {
  const { BUSINESS_INFO } = window.MelaniData;
  const { openWhatsApp, openCoverageQuestion } = window.MelaniWhatsApp;

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
    document.querySelector("#floatingWhatsapp")?.addEventListener("click", () => openWhatsApp("Consulta de servicios", "A consultar"));
    document.querySelector("#coverageButton")?.addEventListener("click", openCoverageQuestion);
  }

  function initBusinessInfo() {
    const zone = document.querySelector("#businessZone");
    if (zone) zone.textContent = BUSINESS_INFO.zone;
  }

  function initAnimations() {
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
    }, { threshold: 0.08 });
    elements.forEach((element) => observer.observe(element));
  }

  window.MelaniUI = { initMenu, initFaqs, initSmoothScroll, initFloatingWhatsApp, initBusinessInfo, initAnimations };
})();
