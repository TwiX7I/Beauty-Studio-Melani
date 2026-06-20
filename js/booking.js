"use strict";

(function createBookingModule() {
  const { BUSINESS_INFO, services, promotions } = window.MelaniData;
  const { openBookingWhatsApp } = window.MelaniWhatsApp;
  const reservableItems = [...services, ...promotions];

  const messages = {
    name: "Escribe tu nombre.",
    phone: "Ingresa un WhatsApp válido.",
    serviceId: "Selecciona un servicio.",
    district: "Selecciona el distrito.",
    date: "Selecciona una fecha válida.",
    time: "Selecciona una hora.",
    address: "Agrega una dirección o referencia."
  };

  function findItem(id) {
    if (id === "general") return { id: "general", name: "Consulta personalizada", price: "A consultar" };
    return reservableItems.find((item) => item.id === id);
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(`${value}T12:00:00`).toLocaleDateString("es-PE");
  }

  function initBooking() {
    const modal = document.querySelector("#bookingModal");
    const form = document.querySelector("#bookingForm");
    const serviceSelect = document.querySelector("#bookingService");
    if (!modal || !form || !serviceSelect) return;

    serviceSelect.innerHTML = [
      '<option value="">Selecciona un servicio</option>',
      ...services.map((item) => `<option value="${item.id}">${item.name}</option>`),
      ...promotions.map((item) => `<option value="${item.id}">Promoción ${item.name}</option>`),
      '<option value="general">Consulta personalizada</option>'
    ].join("");

    const dateInput = form.elements.date;
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateInput.min = today.toISOString().split("T")[0];

    function selectedItem() {
      return findItem(serviceSelect.value) || { name: "—", price: "—" };
    }

    function updateSummary() {
      const data = Object.fromEntries(new FormData(form));
      const item = selectedItem();
      const summary = {
        name: data.name,
        phone: data.phone,
        service: item.name,
        price: item.price,
        date: formatDate(data.date),
        time: data.time,
        district: data.district,
        address: data.address
      };
      Object.entries(summary).forEach(([key, value]) => {
        const target = document.querySelector(`[data-booking-summary="${key}"]`);
        if (target) target.textContent = value || "—";
      });
    }

    function validate(field) {
      const label = field.closest("label");
      let valid = field.value.trim() !== "";
      if (field.name === "phone") valid = field.value.replace(/\D/g, "").length >= 9;
      if (field.name === "date" && field.value) valid = field.value >= dateInput.min;
      label.classList.toggle("is-valid", valid);
      label.classList.toggle("is-invalid", !valid);
      label.querySelector("small").textContent = valid ? "" : messages[field.name];
      return valid;
    }

    function open(id = "general") {
      serviceSelect.value = findItem(id) ? id : "general";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("booking-open");
      updateSummary();
      window.setTimeout(() => form.elements.name.focus(), 350);
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("booking-open");
    }

    document.addEventListener("click", (event) => {
      const reserveButton = event.target.closest("[data-reserve-id]");
      if (reserveButton) open(reserveButton.dataset.reserveId);
      if (event.target.closest("[data-close-booking]")) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) close();
    });

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.closest("label").classList.contains("is-invalid")) validate(field);
        updateSummary();
      });
      field.addEventListener("change", () => {
        validate(field);
        updateSummary();
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll("input, select, textarea")];
      if (!fields.map(validate).every(Boolean)) {
        form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea")?.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      const item = selectedItem();
      openBookingWhatsApp({
        name: data.name,
        phone: data.phone,
        serviceName: item.name,
        price: item.price,
        district: data.district || BUSINESS_INFO.zone,
        date: formatDate(data.date),
        time: data.time,
        address: data.address
      });
    });
  }

  window.MelaniBooking = { initBooking };
})();
