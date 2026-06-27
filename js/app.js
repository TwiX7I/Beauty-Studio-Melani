"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const { renderServices, renderPromotions, renderGallery, renderFaqs } = window.MelaniRender;
  const { initMenu, initFaqs, initSmoothScroll, initFloatingWhatsApp, initPromotionCarousel, initBusinessInfo, initAnimations } = window.MelaniUI;

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
