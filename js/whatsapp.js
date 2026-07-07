"use strict";

(function createWhatsAppModule() {
  const { BUSINESS_INFO } = window.MelaniData;

  function clean(value, fallback = "\u2014") {
    return String(value || "").trim() || fallback;
  }

  function buildWhatsAppMessage(serviceName, price) {
    return `\u00a1Hola Beauty Studio Melani! \ud83d\udc96
Quiero recibir informaci\u00f3n para una atenci\u00f3n a domicilio.

\u2728 Servicio: ${clean(serviceName)}
\ud83d\udc97 Precio referencial: ${clean(price, "A consultar")}
\ud83d\udccd Distrito: ${BUSINESS_INFO.zone}
\ud83c\udfe0 Modalidad: Atenci\u00f3n a domicilio

\u00a1Gracias! \u2728`;
  }

  function openWhatsApp(serviceName, price = "A consultar") {
    const message = encodeURIComponent(buildWhatsAppMessage(serviceName, price));
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`, "_blank", "noopener");
  }

  function buildBookingMessage(booking) {
    const comment = clean(booking.comment, "");
    const commentLine = comment ? `\n\ud83d\udcac Comentario: ${comment}` : "";

    return `\u00a1Hola Beauty Studio Melani! \ud83d\udc96
Quiero reservar mi servicio a domicilio:

\ud83d\udc64 Nombre: ${clean(booking.name)}
\ud83d\udc85 Servicio: ${clean(booking.serviceName)}
\ud83d\udc97 Precio referencial: ${clean(booking.price, "A consultar")}
\ud83d\udcc5 Fecha: ${clean(booking.date)}
\ud83d\udd52 Hora: ${clean(booking.time)}
\ud83d\udccd Distrito: ${clean(booking.district, BUSINESS_INFO.zone)}
\ud83c\udfe0 Direcci\u00f3n: ${clean(booking.address)}${commentLine}

\u00a1Gracias! \u2728`;
  }

  function openBookingWhatsApp(booking) {
    const message = encodeURIComponent(booking.customMessage || buildBookingMessage(booking));
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`, "_blank", "noopener");
  }

  function openCoverageQuestion() {
    const message = encodeURIComponent(`\u00a1Hola Beauty Studio Melani! \ud83d\udc96
Quisiera consultar si realizan atenci\u00f3n a domicilio en mi zona.
Vi que su zona principal es ${BUSINESS_INFO.zone}.

\u00a1Gracias! \u2728`);
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`, "_blank", "noopener");
  }

  window.MelaniWhatsApp = {
    buildWhatsAppMessage,
    buildBookingMessage,
    openWhatsApp,
    openBookingWhatsApp,
    openCoverageQuestion
  };
})();
