"use strict";

(function createWhatsAppModule() {
  const { BUSINESS_INFO } = window.MelaniData;

  const EMOJI = {
    heart: String.fromCodePoint(0x1F496),
    sparkles: String.fromCodePoint(0x2728),
    user: String.fromCodePoint(0x1F464),
    service: String.fromCodePoint(0x1F485),
    money: String.fromCodePoint(0x1F4B0),
    calendar: String.fromCodePoint(0x1F4C5),
    time: String.fromCodePoint(0x1F552),
    pin: String.fromCodePoint(0x1F4CD),
    house: String.fromCodePoint(0x1F3E0),
    comment: String.fromCodePoint(0x1F4AC),
    thanks: String.fromCodePoint(0x2728)
  };

  function clean(value, fallback = "\u2014") {
    return String(value || "").trim() || fallback;
  }

  function sanitizeMessage(message) {
    return String(message || "")
      .replace(/\r\n/g, "\n")
      .replace(/\uFFFD/g, "")
      .trim();
  }

  function joinMessageLines(lines) {
    return sanitizeMessage(lines.filter((line) => line !== null).join("\n"));
  }

  function buildInfoMessage(serviceName, price) {
    return joinMessageLines([
      `Hola Beauty Studio Melani ${EMOJI.heart}`,
      "",
      "Quiero recibir informaci\u00f3n para una atenci\u00f3n a domicilio:",
      "",
      `${EMOJI.service} Servicio: ${clean(serviceName)}`,
      `${EMOJI.money} Precio referencial: ${clean(price, "A consultar")}`,
      `${EMOJI.pin} Distrito: ${BUSINESS_INFO.zone}`,
      `${EMOJI.house} Modalidad: Atenci\u00f3n a domicilio`,
      "",
      `Gracias ${EMOJI.thanks}`
    ]);
  }

  function buildBookingMessage(booking) {
    const comment = String(booking.comment || "").trim();

    return joinMessageLines([
      `Hola Beauty Studio Melani ${EMOJI.heart}`,
      "",
      "Quiero reservar mi servicio a domicilio:",
      "",
      `${EMOJI.user} Nombre: ${clean(booking.name)}`,
      `${EMOJI.service} Servicio: ${clean(booking.serviceName)}`,
      `${EMOJI.money} Precio referencial: ${clean(booking.price, "A consultar")}`,
      `${EMOJI.calendar} Fecha: ${clean(booking.date)}`,
      `${EMOJI.time} Hora: ${clean(booking.time)}`,
      `${EMOJI.pin} Distrito: ${clean(booking.district, BUSINESS_INFO.zone)}`,
      `${EMOJI.house} Direcci\u00f3n: ${clean(booking.address)}`,
      comment ? `${EMOJI.comment} Comentario: ${comment}` : null,
      "",
      "Quedo atenta a su confirmaci\u00f3n.",
      `Gracias ${EMOJI.thanks}`
    ]);
  }

  function buildCoverageMessage() {
    return joinMessageLines([
      `Hola Beauty Studio Melani ${EMOJI.heart}`,
      "",
      "Quisiera consultar si realizan atenci\u00f3n a domicilio en mi zona.",
      `Su zona principal es ${BUSINESS_INFO.zone}.`,
      "",
      `Gracias ${EMOJI.thanks}`
    ]);
  }

  function openWhatsAppUrl(message) {
    const params = new URLSearchParams({
      phone: BUSINESS_INFO.whatsappNumber,
      text: sanitizeMessage(message)
    });
    window.open(`https://api.whatsapp.com/send?${params.toString()}`, "_blank", "noopener");
  }

  function openWhatsApp(serviceName, price = "A consultar") {
    const message = buildInfoMessage(serviceName, price);
    openWhatsAppUrl(message);
  }

  function openBookingWhatsApp(booking) {
    const message = sanitizeMessage(booking.customMessage || buildBookingMessage(booking));
    openWhatsAppUrl(message);
  }

  function openCoverageQuestion() {
    const message = buildCoverageMessage();
    openWhatsAppUrl(message);
  }

  window.MelaniWhatsApp = {
    buildWhatsAppMessage: buildInfoMessage,
    buildBookingMessage,
    openWhatsApp,
    openBookingWhatsApp,
    openCoverageQuestion
  };
})();
