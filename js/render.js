"use strict";

(function createRenderModule() {
  const { serviceCategories, services, promotions, galleryItems, faqs } = window.MelaniData;
  let activeServiceCategory = "todos";

  function categoryLabel(id) {
    return serviceCategories.find((category) => category.id === id)?.label || "Servicio";
  }

  function serviceAlt(service) {
    return `${service.name} profesional a domicilio en Comas`;
  }

  function sortedServices(list) {
    return [...list].sort((a, b) => (a.catalogRank || 99) - (b.catalogRank || 99));
  }

  function visibleServices() {
    if (activeServiceCategory === "todos") return sortedServices(services).slice(0, 8);
    return sortedServices(services.filter((service) => service.category === activeServiceCategory));
  }

  function preferredScrollBehavior() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return document.documentElement.dataset.motion === "lite" || reducedMotion ? "auto" : "smooth";
  }

  function renderServiceCategoryChips() {
    const container = document.querySelector("#serviceCategories");
    if (!container) return;

    container.innerHTML = serviceCategories.map((category) => `
      <button class="catalog-chip${category.id === activeServiceCategory ? " is-active" : ""}" type="button" data-service-category="${category.id}" aria-pressed="${category.id === activeServiceCategory}">${category.label}</button>
    `).join("");

    container.querySelectorAll("[data-service-category]").forEach((button) => {
      button.addEventListener("click", () => {
        activeServiceCategory = button.dataset.serviceCategory || "todos";
        renderServices();
      });
    });
  }

  function renderServiceCards() {
    const container = document.querySelector("#servicesGrid");
    if (!container) return;

    const cards = visibleServices();
    container.innerHTML = cards.map((service, index) => `
      <article class="service-card reveal reveal-card is-visible${service.featured ? " service-card--featured" : ""}">
        <div class="service-card__media">
          <img src="${service.image}" alt="${serviceAlt(service)}" width="${service.imageWidth}" height="${service.imageHeight}" loading="lazy" decoding="async">
          ${service.popular || index === 0 && activeServiceCategory === "todos" ? '<span class="service-card__badge">M\u00e1s pedido</span>' : ''}
        </div>
        <div class="service-card__body">
          <span class="service-card__category">${categoryLabel(service.category)}</span>
          <h3>${service.name}</h3>
          <div class="service-price"><small>Desde</small><strong>${service.priceShort || service.price}</strong></div>
          <ul class="service-card__meta">
            <li><svg aria-hidden="true"><use href="#icon-clock"></use></svg>${service.duration}</li>
            <li><svg aria-hidden="true"><use href="#icon-home"></use></svg>${service.modality}</li>
          </ul>
          <button class="card-button service-button" type="button" data-reserve-id="${service.id}"><span>Quiero este servicio</span><i aria-hidden="true"><svg><use href="#icon-arrow-right"></use></svg></i></button>
        </div>
      </article>
    `).join("");

    container.scrollTo?.({ left: 0, behavior: preferredScrollBehavior() });
  }

  function renderServices() {
    renderServiceCategoryChips();
    renderServiceCards();
  }

  function renderPromotions() {
    const container = document.querySelector("#promotionsGrid");
    if (!container) return;

    container.innerHTML = promotions.map((promotion, index) => `
      <article class="promotion-card reveal" data-promotion-index="${index}">
        <div class="promotion-card__body">
          <span class="promotion-card__label">${promotion.label}</span>
          <h3>${promotion.name} <span aria-hidden="true">\u2726</span></h3>
          <p>${promotion.description}</p>
          <strong>${promotion.price}</strong>
          <button class="card-button card-button--compact" type="button" data-reserve-id="${promotion.id}">Reservar promoci\u00f3n</button>
        </div>
        <img src="${promotion.image}" alt="Promoci\u00f3n ${promotion.name} de Beauty Studio Melani" width="${promotion.imageWidth}" height="${promotion.imageHeight}" loading="lazy" decoding="async">
      </article>
    `).join("");

    const dots = document.querySelector("#promotionsDots");
    if (dots) {
      dots.innerHTML = promotions.map((promotion, index) => `
        <button class="promotions-dot${index === 0 ? " is-active" : ""}" type="button" aria-label="Ver promoci\u00f3n ${promotion.name}" data-promotion-dot="${index}"></button>
      `).join("");
    }
  }

  function renderGallery() {
    const container = document.querySelector("#galleryGrid");
    if (!container) return;

    container.innerHTML = galleryItems.map((item) => `
      <figure class="gallery-card reveal">
        <img src="${item.image}" alt="${item.title} realizado por Beauty Studio Melani" width="${item.imageWidth}" height="${item.imageHeight}" loading="lazy" decoding="async">
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
          <span>${faq.question}</span>
          <svg aria-hidden="true"><use href="#icon-chevron-down"></use></svg>
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
