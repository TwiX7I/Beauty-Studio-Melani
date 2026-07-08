"use strict";

(function createBookingModule() {
  const { BUSINESS_INFO, serviceCategories, services, promotions } = window.MelaniData;
  const { openBookingWhatsApp, buildBookingMessage } = window.MelaniWhatsApp;
  const reservableItems = [...services, ...promotions];

  const messages = {
    name: "Cu\u00e9ntanos tu nombre para coordinar tu cita.",
    serviceId: "Selecciona el servicio que deseas.",
    district: "Selecciona tu distrito para coordinar la atenci\u00f3n.",
    date: "Elige una fecha para tu atenci\u00f3n.",
    time: "Selecciona una hora disponible.",
    address: "Agrega una direcci\u00f3n o referencia para llegar a tu domicilio."
  };

  const fallbackItem = {
    id: "general",
    name: "Asesor\u00eda personalizada",
    price: "A consultar",
    priceShort: "A consultar",
    duration: "A coordinar",
    modality: "A domicilio",
    image: "assets/images/unas-acrilicas.webp",
    imageWidth: 1024,
    imageHeight: 1536,
    note: "Melani te ayudar\u00e1 a elegir el servicio ideal."
  };

  function findItem(id) {
    if (id === "general") return fallbackItem;
    return reservableItems.find((item) => item.id === id) || fallbackItem;
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(`${value}T12:00:00`).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function formatDateField(value) {
    if (!value) return "dd/mm/aaaa";
    const [year = "", month = "", day = ""] = value.split("-");
    return day && month && year ? `${day}/${month}/${year}` : "dd/mm/aaaa";
  }

  function toDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromValue(value) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  function capitalizeText(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  const timePickerHours = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  const timePickerMinutes = ["00", "15", "30", "45"];
  const timePickerPeriods = [
    { value: "AM", label: "a. m." },
    { value: "PM", label: "p. m." }
  ];

  const districtPickerOptions = [
    {
      value: "Comas",
      label: "Comas",
      note: "Zona principal de atenci\u00f3n",
      help: "Por ahora atendemos principalmente en Comas."
    },
    {
      value: "Otro distrito (consultar disponibilidad)",
      label: "Otro distrito",
      note: "Consultar por WhatsApp",
      help: "La disponibilidad fuera de Comas se coordina por WhatsApp."
    }
  ];

  function formatTime(value) {
    if (!value) return "";
    const [hour = "", minute = ""] = value.split(":");
    if (!hour || !minute) return value;
    const hourNumber = Number(hour);
    const hour12 = hourNumber % 12 || 12;
    const period = hourNumber >= 12 ? "p.m." : "a.m.";
    return `${String(hour12).padStart(2, "0")}:${minute} ${period}`;
  }

  function parseTimeValue(value) {
    if (!value) return { hour: "10", minute: "00", period: "AM" };
    const [rawHour = "10", rawMinute = "00"] = value.split(":");
    const hourNumber = Number(rawHour);
    const hour12 = hourNumber % 12 || 12;
    const roundedMinute = timePickerMinutes.includes(rawMinute) ? rawMinute : "00";
    return {
      hour: String(hour12).padStart(2, "0"),
      minute: roundedMinute,
      period: hourNumber >= 12 ? "PM" : "AM"
    };
  }

  function timeDraftToValue(draft) {
    let hour = Number(draft.hour);
    if (draft.period === "PM" && hour < 12) hour += 12;
    if (draft.period === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${draft.minute}`;
  }

  function buildServiceOptions() {
    const realCategories = serviceCategories.filter((category) => category.id !== "todos");
    const categoryGroups = realCategories.map((category) => {
      const options = services
        .filter((item) => item.category === category.id)
        .sort((a, b) => (a.catalogRank || 99) - (b.catalogRank || 99))
        .map((item) => `<option value="${item.id}">${item.name}</option>`)
        .join("");
      return `<optgroup label="${category.label}">${options}</optgroup>`;
    }).join("");

    const promotionOptions = promotions
      .map((item) => `<option value="${item.id}">Promoci\u00f3n ${item.name}</option>`)
      .join("");

    return [
      '<option value="">Selecciona tu servicio</option>',
      categoryGroups,
      `<optgroup label="Promociones">${promotionOptions}</optgroup>`,
      '<option value="general">Quiero que me asesoren</option>'
    ].join("");
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form));
  }

  function createIconUse(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${name}`);
    svg.append(use);
    return svg;
  }

  function initBooking() {
    const modal = document.querySelector("#bookingModal");
    const form = document.querySelector("#bookingForm");
    const serviceSelect = document.querySelector("#bookingService");
    const serviceTrigger = document.querySelector("#servicePickerTrigger");
    const serviceLabel = document.querySelector("#bookingServiceLabel");
    const servicePicker = document.querySelector("#servicePicker");
    const servicePickerList = document.querySelector("#servicePickerList");
    const dateInput = document.querySelector("#bookingDate");
    const dateTrigger = document.querySelector("#datePickerTrigger");
    const dateLabel = document.querySelector("#bookingDateLabel");
    const datePicker = document.querySelector("#datePicker");
    const datePickerMonth = document.querySelector("#datePickerMonth");
    const datePickerGrid = document.querySelector("#datePickerGrid");
    const timeInput = document.querySelector("#bookingTime");
    const timeTrigger = document.querySelector("#timePickerTrigger");
    const timeLabel = document.querySelector("#bookingTimeLabel");
    const timePicker = document.querySelector("#timePicker");
    const timePickerValue = document.querySelector("#timePickerValue");
    const confirmTimeButton = document.querySelector("#confirmTimePicker");
    const districtSelect = document.querySelector("#bookingDistrict");
    const districtTrigger = document.querySelector("#districtPickerTrigger");
    const districtLabel = document.querySelector("#bookingDistrictLabel");
    const districtHelp = document.querySelector("#bookingDistrictHelp");
    const districtPicker = document.querySelector("#districtPicker");
    const districtPickerList = document.querySelector("#districtPickerList");
    const thanks = document.querySelector("#bookingThanks");
    const preview = document.querySelector("#whatsappPreview");
    const previewEditor = document.querySelector("#whatsappPreviewEditor");
    const editPreviewButton = document.querySelector("#editPreviewButton");
    if (!modal || !form || !serviceSelect) return;

    [servicePicker, datePicker, timePicker, districtPicker].forEach((picker) => {
      if (picker && picker.parentElement !== document.body) {
        document.body.append(picker);
      }
    });

    serviceSelect.innerHTML = buildServiceOptions();
    if (districtSelect && !districtSelect.value) districtSelect.value = BUSINESS_INFO.zone;

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayValue = toDateValue(today);
    const minDateValue = todayValue;
    if (dateInput) dateInput.min = minDateValue;
    let visibleMonth = dateFromValue(dateInput?.value || "") || new Date(today.getFullYear(), today.getMonth(), 1, 12);
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12);
    let timeDraft = parseTimeValue(timeInput?.value || "");
    let lastDateRenderKey = "";
    let timePickerRendered = false;
    let districtPickerRendered = false;
    let pageScrollLock = null;
    let touchStartY = 0;

    function lockPageScroll() {
      if (pageScrollLock) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const main = document.querySelector(".mobile-page") || document.querySelector("main");
      const targets = [document.documentElement, document.body, main].filter(Boolean);
      pageScrollLock = {
        scrollY,
        main,
        styles: targets.map((element) => ({
          element,
          position: element.style.position,
          top: element.style.top,
          left: element.style.left,
          right: element.style.right,
          width: element.style.width,
          overflow: element.style.overflow,
          overflowY: element.style.overflowY,
          touchAction: element.style.touchAction,
          overscrollBehavior: element.style.overscrollBehavior,
        })),
      };

      document.documentElement.classList.add("booking-open", "page-scroll-locked");
      document.body.classList.add("booking-open", "page-scroll-locked");
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
      document.documentElement.style.touchAction = "none";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      document.body.style.touchAction = "none";
      if (main) {
        main.style.overflow = "hidden";
        main.style.overflowY = "hidden";
        main.style.overscrollBehavior = "none";
        main.style.touchAction = "none";
      }
    }

    function unlockPageScroll() {
      if (!pageScrollLock) return;
      const { scrollY, styles } = pageScrollLock;
      styles.forEach(({ element, ...saved }) => {
        Object.entries(saved).forEach(([property, value]) => {
          element.style[property] = value;
        });
      });
      document.documentElement.classList.remove("booking-open", "page-scroll-locked");
      document.body.classList.remove("booking-open", "page-scroll-locked");
      pageScrollLock = null;
      window.scrollTo(0, scrollY);
    }

    function scrollablePickerTarget(target) {
      return target.closest(".booking-sheet, .service-picker__panel, .date-picker__panel, .time-picker__panel, .district-picker__panel");
    }

    function preventBackgroundTouchMove(event) {
      if (!pageScrollLock) return;
      const scrollable = scrollablePickerTarget(event.target);
      if (!scrollable) {
        event.preventDefault();
        return;
      }

      const currentY = event.touches?.[0]?.clientY ?? touchStartY;
      const deltaY = currentY - touchStartY;
      const atTop = scrollable.scrollTop <= 0;
      const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
      const cannotScroll = scrollable.scrollHeight <= scrollable.clientHeight + 1;

      if (cannotScroll || (atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        event.preventDefault();
      }
    }

    document.addEventListener("touchstart", (event) => {
      touchStartY = event.touches?.[0]?.clientY || 0;
    }, { passive: true });

    document.addEventListener("touchmove", preventBackgroundTouchMove, { passive: false });

    function hasOpenSecondaryPicker() {
      return [servicePicker, datePicker, timePicker, districtPicker].some((picker) => picker?.classList.contains("is-open"));
    }

    function markSecondaryPickerOpen(picker) {
      if (!picker) return;
      picker.hidden = false;
      document.body.classList.add("picker-open");
    }

    function markSecondaryPickerClosed(picker) {
      window.setTimeout(() => {
        if (picker && !picker.classList.contains("is-open")) picker.hidden = true;
        document.body.classList.toggle("picker-open", hasOpenSecondaryPicker());
      }, 180);
    }

    function selectedItem() {
      return findItem(serviceSelect.value || "general");
    }

    function bookingPayload() {
      const data = formData(form);
      const item = selectedItem();
      return {
        name: data.name,
        serviceName: item.name,
        price: item.priceShort || item.price,
        district: data.district || BUSINESS_INFO.zone,
        date: formatDate(data.date),
        time: formatTime(data.time),
        address: data.address,
        comment: data.comment,
        customMessage: previewEditor && !previewEditor.hidden ? previewEditor.value.trim() : ""
      };
    }

    function updateServiceTrigger() {
      if (!serviceLabel) return;
      const item = selectedItem();
      serviceLabel.textContent = serviceSelect.value ? item.name : "Selecciona tu servicio";
      serviceTrigger?.setAttribute("aria-label", `Servicio seleccionado: ${item.name}`);
      servicePickerList?.querySelectorAll("[data-service-option]").forEach((button) => {
        button.classList.toggle("is-selected", button.dataset.serviceOption === serviceSelect.value);
      });
    }

    function updateSummary() {
      const data = formData(form);
      const item = selectedItem();
      const summary = {
        name: data.name,
        service: item.name,
        price: item.priceShort || item.price,
        date: formatDate(data.date),
        time: formatTime(data.time),
        district: data.district || BUSINESS_INFO.zone,
        address: data.address,
        comment: data.comment
      };

      Object.entries(summary).forEach(([key, value]) => {
        document.querySelectorAll(`[data-booking-summary="${key}"]`).forEach((target) => {
          target.textContent = value || "\u2014";
        });
      });

      const image = document.querySelector("#bookingSummaryImage");
      if (image) {
        image.src = item.image || fallbackItem.image;
        image.alt = `${item.name} seleccionado para reserva`;
      }

      const modality = document.querySelector("#bookingSummaryModality");
      if (modality) modality.textContent = `${item.modality || "A domicilio"} en ${summary.district || BUSINESS_INFO.zone}`;

      updateServiceTrigger();
      updateDateTrigger();
      updateTimeTrigger();
      updateDistrictTrigger();

      const previewText = buildBookingMessage(bookingPayload());
      if (preview) preview.textContent = previewText;
      if (previewEditor && previewEditor.hidden) previewEditor.value = previewText;
    }

    function setCompletedState(field) {
      const label = field.closest("label");
      if (!label) return;
      const hasValue = field.value.trim() !== "";
      label.classList.toggle("is-complete", hasValue);
    }

    function validate(field) {
      const label = field.closest("label");
      if (!label) return true;
      if (field.dataset.optional === "true") {
        label.classList.remove("is-invalid");
        setCompletedState(field);
        return true;
      }

      let valid = field.value.trim() !== "";
      if (field.name === "date" && field.value) valid = field.value >= minDateValue;

      label.classList.toggle("is-complete", valid);
      label.classList.toggle("is-invalid", !valid);
      const small = label.querySelector("small");
      if (small) small.textContent = valid ? "" : messages[field.name] || "Completa este dato para continuar.";
      return valid;
    }

    function renderServicePicker() {
      if (!servicePickerList) return;
      servicePickerList.textContent = "";

      const realCategories = serviceCategories.filter((category) => category.id !== "todos");
      realCategories.forEach((category) => {
        const items = services
          .filter((item) => item.category === category.id)
          .sort((a, b) => (a.catalogRank || 99) - (b.catalogRank || 99));
        if (!items.length) return;

        const group = document.createElement("div");
        group.className = "service-picker__group";
        const heading = document.createElement("h4");
        heading.textContent = category.label;
        group.append(heading);

        items.forEach((item) => group.append(createServiceOption(item)));
        servicePickerList.append(group);
      });

      if (promotions.length) {
        const group = document.createElement("div");
        group.className = "service-picker__group service-picker__group--promos";
        const heading = document.createElement("h4");
        heading.textContent = "Promociones";
        group.append(heading);
        promotions.forEach((item) => group.append(createServiceOption(item, "Promo")));
        servicePickerList.append(group);
      }

      const advice = createServiceOption(fallbackItem, "Asesor\u00eda");
      const adviceGroup = document.createElement("div");
      adviceGroup.className = "service-picker__group";
      const heading = document.createElement("h4");
      heading.textContent = "No estoy segura";
      adviceGroup.append(heading, advice);
      servicePickerList.append(adviceGroup);

      updateServiceTrigger();
    }

    function createServiceOption(item, eyebrow = "") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "service-picker__option";
      button.dataset.serviceOption = item.id;

      const content = document.createElement("span");
      content.className = "service-picker__option-content";

      const title = document.createElement("strong");
      title.textContent = eyebrow ? `${eyebrow} ${item.name}` : item.name;

      const meta = document.createElement("small");
      const price = item.priceShort || item.price || "A consultar";
      const duration = item.duration || "A coordinar";
      meta.textContent = `${price} \u00b7 ${duration} \u00b7 ${item.modality || "A domicilio"}`;

      content.append(title, meta);
      const check = createIconUse("icon-check");
      button.append(content, check);
      return button;
    }

    function openServicePicker() {
      if (!servicePicker) return;
      markSecondaryPickerOpen(servicePicker);
      requestAnimationFrame(() => {
        servicePicker.classList.add("is-open");
        serviceTrigger?.setAttribute("aria-expanded", "true");
      });
    }

    function closeServicePicker() {
      if (!servicePicker) return;
      servicePicker.classList.remove("is-open");
      serviceTrigger?.setAttribute("aria-expanded", "false");
      markSecondaryPickerClosed(servicePicker);
    }

    function selectService(id) {
      serviceSelect.value = findItem(id) ? id : "general";
      validate(serviceSelect);
      updateSummary();
      closeServicePicker();
      serviceTrigger?.focus({ preventScroll: true });
    }

    function updateDateTrigger() {
      if (!dateLabel || !dateInput) return;
      dateLabel.textContent = formatDateField(dateInput.value);
      dateTrigger?.setAttribute("aria-label", dateInput.value ? `Fecha seleccionada: ${formatDate(dateInput.value)}` : "Seleccionar fecha");
    }

    function monthTitle(date) {
      return capitalizeText(date.toLocaleDateString("es-PE", { month: "long", year: "numeric" }));
    }

    function renderDatePicker(force = false) {
      if (!datePickerGrid || !datePickerMonth) return;
      const year = visibleMonth.getFullYear();
      const month = visibleMonth.getMonth();
      const firstDay = new Date(year, month, 1, 12);
      const startOffset = firstDay.getDay();
      const calendarStart = new Date(year, month, 1 - startOffset, 12);
      const selectedValue = dateInput?.value || "";
      const renderKey = `${year}-${month}-${selectedValue}-${minDateValue}`;

      if (!force && renderKey === lastDateRenderKey) return;
      lastDateRenderKey = renderKey;

      datePickerMonth.textContent = monthTitle(visibleMonth);
      const fragment = document.createDocumentFragment();

      for (let index = 0; index < 42; index += 1) {
        const date = new Date(calendarStart);
        date.setDate(calendarStart.getDate() + index);
        date.setHours(12, 0, 0, 0);
        const value = toDateValue(date);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "date-picker__day";
        button.dataset.dateValue = value;
        button.textContent = String(date.getDate());
        button.classList.toggle("is-muted", date.getMonth() !== month);
        button.classList.toggle("is-today", value === todayValue);
        button.classList.toggle("is-selected", value === selectedValue);
        if (value < minDateValue) {
          button.disabled = true;
          button.classList.add("is-disabled");
        }
        fragment.append(button);
      }

      datePickerGrid.replaceChildren(fragment);
    }

    function openDatePicker() {
      if (!datePicker) return;
      const selectedDate = dateFromValue(dateInput?.value || "");
      visibleMonth = selectedDate
        ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12)
        : new Date(today.getFullYear(), today.getMonth(), 1, 12);
      renderDatePicker();
      markSecondaryPickerOpen(datePicker);
      requestAnimationFrame(() => {
        datePicker.classList.add("is-open");
        dateTrigger?.setAttribute("aria-expanded", "true");
      });
    }

    function closeDatePicker() {
      if (!datePicker) return;
      datePicker.classList.remove("is-open");
      dateTrigger?.setAttribute("aria-expanded", "false");
      markSecondaryPickerClosed(datePicker);
    }

    function selectDate(value) {
      if (!dateInput || !value || value < minDateValue) return;
      dateInput.value = value;
      validate(dateInput);
      updateSummary();
      closeDatePicker();
      dateTrigger?.focus({ preventScroll: true });
    }

    function updateDateMonth(step) {
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + step, 1, 12);
      renderDatePicker(true);
    }

    function clearDatePicker() {
      if (!dateInput) return;
      dateInput.value = "";
      validate(dateInput);
      updateSummary();
      renderDatePicker();
      dateTrigger?.focus({ preventScroll: true });
    }

    function chooseToday() {
      selectDate(todayValue);
    }

    function updateTimeTrigger() {
      if (!timeLabel || !timeInput) return;
      timeLabel.textContent = timeInput.value ? formatTime(timeInput.value) : "--:-- ----";
      timeTrigger?.setAttribute("aria-label", timeInput.value ? `Hora seleccionada: ${formatTime(timeInput.value)}` : "Seleccionar hora");
    }

    function renderTimePicker({ scrollSelected = true } = {}) {
      if (!timePicker) return;
      const columns = {
        hour: timePicker.querySelector('[data-time-column="hour"]'),
        minute: timePicker.querySelector('[data-time-column="minute"]'),
        period: timePicker.querySelector('[data-time-column="period"]')
      };
      const groups = {
        hour: timePickerHours.map((value) => ({ value, label: value })),
        minute: timePickerMinutes.map((value) => ({ value, label: value })),
        period: timePickerPeriods.map((item) => item)
      };

      if (!timePickerRendered) {
        Object.entries(columns).forEach(([columnName, column]) => {
          if (!column) return;
          const fragment = document.createDocumentFragment();
          groups[columnName].forEach((item) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "time-picker__option";
            button.dataset.timePart = columnName;
            button.dataset.timeValue = item.value;
            button.textContent = item.label;
            fragment.append(button);
          });
          column.replaceChildren(fragment);
        });
        timePickerRendered = true;
      }

      Object.entries(columns).forEach(([columnName, column]) => {
        column?.querySelectorAll("[data-time-value]").forEach((button) => {
          button.classList.toggle("is-selected", timeDraft[columnName] === button.dataset.timeValue);
        });
      });

      if (timePickerValue) timePickerValue.textContent = formatTime(timeDraftToValue(timeDraft));

      if (scrollSelected) {
        requestAnimationFrame(() => {
          timePicker.querySelectorAll(".time-picker__column").forEach((column) => {
            const selected = column.querySelector(".time-picker__option.is-selected");
            if (!selected) return;
            const targetTop = selected.offsetTop - ((column.clientHeight - selected.offsetHeight) / 2);
            column.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
          });
        });
      }
    }

    function openTimePicker() {
      if (!timePicker || !timeInput) return;
      timeDraft = parseTimeValue(timeInput.value);
      renderTimePicker();
      markSecondaryPickerOpen(timePicker);
      requestAnimationFrame(() => {
        timePicker.classList.add("is-open");
        timeTrigger?.setAttribute("aria-expanded", "true");
      });
    }

    function closeTimePicker() {
      if (!timePicker) return;
      timePicker.classList.remove("is-open");
      timeTrigger?.setAttribute("aria-expanded", "false");
      markSecondaryPickerClosed(timePicker);
    }

    function selectTimePart(part, value) {
      if (!part || !value || !(part in timeDraft)) return;
      timeDraft = { ...timeDraft, [part]: value };
      renderTimePicker({ scrollSelected: true });
    }

    function confirmTimePicker() {
      if (!timeInput) return;
      timeInput.value = timeDraftToValue(timeDraft);
      validate(timeInput);
      updateSummary();
      closeTimePicker();
      timeTrigger?.focus({ preventScroll: true });
    }

    function selectedDistrictOption() {
      return districtPickerOptions.find((option) => option.value === districtSelect?.value) || districtPickerOptions[0];
    }

    function updateDistrictTrigger() {
      if (!districtLabel || !districtSelect) return;
      const option = selectedDistrictOption();
      districtLabel.textContent = option.label;
      if (districtHelp) districtHelp.textContent = option.help;
      districtTrigger?.setAttribute("aria-label", `Distrito seleccionado: ${option.label}`);
      districtPickerList?.querySelectorAll("[data-district-value]").forEach((button) => {
        button.classList.toggle("is-selected", button.dataset.districtValue === districtSelect.value);
      });
    }

    function renderDistrictPicker(force = false) {
      if (!districtPickerList) return;
      if (districtPickerRendered && !force) {
        updateDistrictTrigger();
        return;
      }

      const fragment = document.createDocumentFragment();
      districtPickerOptions.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "district-picker__option";
        button.dataset.districtValue = option.value;

        const content = document.createElement("span");
        content.className = "district-picker__option-content";
        const title = document.createElement("strong");
        title.textContent = option.label;
        const note = document.createElement("small");
        note.textContent = option.note;
        content.append(title, note);

        const check = createIconUse("icon-check");
        button.append(content, check);
        button.classList.toggle("is-selected", option.value === districtSelect?.value);
        fragment.append(button);
      });

      districtPickerList.replaceChildren(fragment);
      districtPickerRendered = true;
      updateDistrictTrigger();
    }

    function openDistrictPicker() {
      if (!districtPicker) return;
      renderDistrictPicker();
      markSecondaryPickerOpen(districtPicker);
      requestAnimationFrame(() => {
        districtPicker.classList.add("is-open");
        districtTrigger?.setAttribute("aria-expanded", "true");
      });
    }

    function closeDistrictPicker() {
      if (!districtPicker) return;
      districtPicker.classList.remove("is-open");
      districtTrigger?.setAttribute("aria-expanded", "false");
      markSecondaryPickerClosed(districtPicker);
    }

    function selectDistrict(value) {
      if (!districtSelect || !value) return;
      districtSelect.value = value;
      validate(districtSelect);
      updateSummary();
      closeDistrictPicker();
      districtTrigger?.focus({ preventScroll: true });
    }

    function open(id = "general") {
      serviceSelect.value = findItem(id) ? id : "general";
      if (thanks) thanks.hidden = true;
      if (previewEditor) previewEditor.hidden = true;
      if (editPreviewButton) editPreviewButton.textContent = "Editar mensaje";
      lockPageScroll();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      updateSummary();
      window.setTimeout(() => form.elements.name.focus(), 320);
    }

    function close() {
      closeServicePicker();
      closeDatePicker();
      closeTimePicker();
      closeDistrictPicker();
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("picker-open");
      unlockPageScroll();
    }

    renderServicePicker();
    updateDateTrigger();
    updateTimeTrigger();
    updateDistrictTrigger();

    serviceTrigger?.addEventListener("click", (event) => {
      event.preventDefault();
      openServicePicker();
    });

    servicePickerList?.addEventListener("click", (event) => {
      const option = event.target.closest("[data-service-option]");
      if (!option) return;
      selectService(option.dataset.serviceOption);
    });

    dateTrigger?.addEventListener("click", (event) => {
      event.preventDefault();
      openDatePicker();
    });

    datePicker?.addEventListener("click", (event) => {
      const day = event.target.closest("[data-date-value]");
      if (day) {
        selectDate(day.dataset.dateValue);
        return;
      }
      if (event.target.closest("[data-date-prev]")) updateDateMonth(-1);
      if (event.target.closest("[data-date-next]")) updateDateMonth(1);
      if (event.target.closest("[data-date-clear]")) clearDatePicker();
      if (event.target.closest("[data-date-today]")) chooseToday();
    });

    timeTrigger?.addEventListener("click", (event) => {
      event.preventDefault();
      openTimePicker();
    });

    timePicker?.addEventListener("click", (event) => {
      const option = event.target.closest("[data-time-part]");
      if (!option) return;
      selectTimePart(option.dataset.timePart, option.dataset.timeValue);
    });

    confirmTimeButton?.addEventListener("click", confirmTimePicker);

    districtTrigger?.addEventListener("click", (event) => {
      event.preventDefault();
      openDistrictPicker();
    });

    districtPickerList?.addEventListener("click", (event) => {
      const option = event.target.closest("[data-district-value]");
      if (!option) return;
      selectDistrict(option.dataset.districtValue);
    });

    document.addEventListener("click", (event) => {
      const reserveButton = event.target.closest("[data-reserve-id]");
      if (reserveButton && !reserveButton.matches("[data-direct-whatsapp]")) {
        event.preventDefault();
        open(reserveButton.dataset.reserveId || "general");
      }
      if (event.target.closest("[data-close-booking]")) close();
      if (event.target.closest("[data-close-service-picker]")) closeServicePicker();
      if (event.target.closest("[data-close-date-picker]")) closeDatePicker();
      if (event.target.closest("[data-close-time-picker]")) closeTimePicker();
      if (event.target.closest("[data-close-district-picker]")) closeDistrictPicker();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (datePicker?.classList.contains("is-open")) {
        closeDatePicker();
        return;
      }
      if (timePicker?.classList.contains("is-open")) {
        closeTimePicker();
        return;
      }
      if (districtPicker?.classList.contains("is-open")) {
        closeDistrictPicker();
        return;
      }
      if (servicePicker?.classList.contains("is-open")) {
        closeServicePicker();
        return;
      }
      if (modal.classList.contains("is-open")) close();
    });

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.closest("label")?.classList.contains("is-invalid")) validate(field);
        setCompletedState(field);
        updateSummary();
      });
      field.addEventListener("change", () => {
        validate(field);
        updateSummary();
      });
    });

    editPreviewButton?.addEventListener("click", () => {
      if (!previewEditor) return;
      previewEditor.hidden = !previewEditor.hidden;
      if (!previewEditor.hidden) {
        previewEditor.value = preview?.textContent || buildBookingMessage(bookingPayload());
        previewEditor.focus();
      }
      editPreviewButton.textContent = previewEditor.hidden ? "Editar mensaje" : "Usar mensaje editado";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll("input, select, textarea")]
        .filter((field) => field.name && field.name !== "messageOverride");
      if (!fields.map(validate).every(Boolean)) {
        const invalidLabel = form.querySelector(".is-invalid");
        invalidLabel?.querySelector("button, input, select:not(.booking-service-native), textarea")?.focus();
        return;
      }

      if (thanks) thanks.hidden = false;
      openBookingWhatsApp(bookingPayload());
    });

    updateSummary();
  }

  window.MelaniBooking = { initBooking };
})();
