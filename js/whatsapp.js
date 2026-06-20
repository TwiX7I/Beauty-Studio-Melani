"use strict";

(function createWhatsAppModule() {
  const { BUSINESS_INFO } = window.MelaniData;

  function buildWhatsAppMessage(serviceName, price) {
    return `Hola Melani, quiero reservar una atención a domicilio.
Servicio: ${serviceName}
Precio: ${price}
Zona: ${BUSINESS_INFO.zone}
Modalidad: ${BUSINESS_INFO.modality}`;
  }

  function openWhatsApp(serviceName, price = "A consultar") {
    const message = encodeURIComponent(buildWhatsAppMessage(serviceName, price));
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`, "_blank", "noopener");
  }

  function buildBookingMessage(booking) {
    return `Hola Melani, quiero reservar una atención a domicilio.

Nombre: ${booking.name}
WhatsApp: ${booking.phone}
Servicio: ${booking.serviceName}
Precio: ${booking.price}
Distrito: ${booking.district}
Fecha: ${booking.date}
Hora: ${booking.time}
Dirección o referencia: ${booking.address}
Modalidad: ${BUSINESS_INFO.modality}

Por favor, confirmar disponibilidad.`;
  }

  function openBookingWhatsApp(booking) {
    const message = encodeURIComponent(buildBookingMessage(booking));
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`, "_blank", "noopener");
  }

  function openCoverageQuestion() {
    const message = encodeURIComponent(`Hola Melani, quisiera consultar si realizas atención a domicilio en mi distrito. Zona principal: ${BUSINESS_INFO.zone}.`);
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
