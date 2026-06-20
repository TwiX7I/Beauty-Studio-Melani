"use strict";

(function createRenderModule() {
  const { services, promotions, galleryItems, faqs } = window.MelaniData;

  function renderServices() {
    const container = document.querySelector("#servicesGrid");
    if (!container) return;

    container.innerHTML = services.map((service) => `
      <article class="service-card reveal${service.featured ? " service-card--featured" : ""}">
        <img src="${service.image}" alt="${service.name}" loading="lazy">
        <div class="service-card__body">
          <h3>${service.name}</h3>
          <strong>${service.price}</strong>
          <p><svg><use href="#icon-clock"></use></svg>${service.duration}</p>
          <p><svg><use href="#icon-home"></use></svg>${service.modality}</p>
          <button class="card-button" type="button" data-reserve-id="${service.id}">Reservar</button>
        </div>
      </article>
    `).join("");
  }

  function renderPromotions() {
    const container = document.querySelector("#promotionsGrid");
    if (!container) return;

    container.innerHTML = promotions.map((promotion) => `
      <article class="promotion-card reveal">
        <div class="promotion-card__body">
          <h3>${promotion.name} <span>✦</span></h3>
          <p>${promotion.description.replace(" + ", "<br>+ ")}</p>
          <strong>${promotion.price}</strong>
          <button class="card-button" type="button" data-reserve-id="${promotion.id}">Reservar promoción</button>
        </div>
        <img src="${promotion.image}" alt="Promoción ${promotion.name}" loading="lazy">
      </article>
    `).join("");
  }

  function renderGallery() {
    const container = document.querySelector("#galleryGrid");
    if (!container) return;

    container.innerHTML = galleryItems.map((item) => `
      <figure class="gallery-card reveal">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <figcaption>${item.title}</figcaption>
      </figure>
    `).join("");
  }

  function renderFaqs() {
    const container = document.querySelector("#faqList");
    if (!container) return;

    container.innerHTML = faqs.map((faq, index) => `
      <article class="faq-item">
        <button type="button" aria-expanded="false" aria-controls="faq-answer-${index}">
          ${faq.question}<b aria-hidden="true">⌄</b>
        </button>
        <div class="faq-item__answer" id="faq-answer-${index}">
          <p>${faq.answer}</p>
        </div>
      </article>
    `).join("");
  }

  window.MelaniRender = {
    renderServices,
    renderPromotions,
    renderGallery,
    renderFaqs
  };
})();
