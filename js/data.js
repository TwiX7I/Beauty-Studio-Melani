"use strict";

/**
 * Datos editables del negocio.
 * Cambia aquí precios, textos, imágenes, zona y número de WhatsApp.
 */
window.MelaniData = {
  BUSINESS_INFO: {
    name: "Beauty Studio Melani",
    zone: "Comas",
    modality: "A domicilio",
    whatsappNumber: "51999999999"
  },

  services: [
    {
      id: "unas-acrilicas",
      name: "Uñas acrílicas",
      price: "Desde S/ 50",
      duration: "1h 30min",
      modality: "A domicilio",
      image: "assets/images/unas-acrilicas.jpg",
      featured: true
    },
    {
      id: "manicure-gel",
      name: "Manicure gel",
      price: "Desde S/ 35",
      duration: "1h",
      modality: "A domicilio",
      image: "assets/images/manicure-gel.jpg",
      featured: false
    },
    {
      id: "diseno-cejas",
      name: "Diseño de cejas",
      price: "Desde S/ 25",
      duration: "30min",
      modality: "A domicilio",
      image: "assets/images/cejas.jpg",
      featured: false
    }
  ],

  promotions: [
    {
      id: "promo-pinky",
      name: "Pinky",
      description: "Uñas acrílicas + esmaltado",
      price: "S/ 60",
      image: "assets/images/unas-acrilicas.jpg"
    },
    {
      id: "combo-mirada",
      name: "Mirada",
      description: "Lifting de pestañas + diseño de cejas",
      price: "S/ 55",
      image: "assets/images/pestanas.jpg"
    }
  ],

  galleryItems: [
    {
      title: "Uñas acrílicas",
      image: "assets/images/unas-acrilicas.jpg"
    },
    {
      title: "Manicure",
      image: "assets/images/manicure-gel.jpg"
    },
    {
      title: "Cejas",
      image: "assets/images/cejas.jpg"
    },
    {
      title: "Pestañas",
      image: "assets/images/pestanas.jpg"
    }
  ],

  faqs: [
    {
      question: "¿Atiendes a domicilio?",
      answer: "Sí, la atención es a domicilio por el momento en Comas."
    },
    {
      question: "¿Qué métodos de pago aceptas?",
      answer: "Puedes consultar los métodos de pago disponibles al confirmar tu reserva por WhatsApp."
    },
    {
      question: "¿Cómo reservo una cita?",
      answer: "Elige un servicio y presiona reservar. Se abrirá WhatsApp con el mensaje listo para confirmar tu atención."
    }
  ]
};
