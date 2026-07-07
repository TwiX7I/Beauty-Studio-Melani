"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const { renderServices, renderPromotions, renderGallery, renderFaqs } = window.MelaniRender;
  const { initMenu, initFaqs, initSmoothScroll, initFloatingWhatsApp, initPerformanceMode, initPromotionCarousel, initBusinessInfo, initAnimations } = window.MelaniUI;

  initPerformanceMode();
  renderServices();
  renderPromotions();
  renderGallery();
  renderFaqs();

  initBusinessInfo();
  window.MelaniBooking.initBooking();
  initMenu();
  initFaqs();
  initSmoothScroll();
  initFloatingWhatsApp();
  initPromotionCarousel();
  initAnimations();
});
