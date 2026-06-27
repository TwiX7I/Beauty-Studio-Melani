"use strict";

window.MelaniData = {
  BUSINESS_INFO: {
    name: "Beauty Studio Melani",
    zone: "Comas",
    modality: "A domicilio",
    whatsappNumber: "51927377298"
  },

  services: [
    {
      id: "unas-acrilicas",
      name: "U\u00f1as acr\u00edlicas",
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
      name: "Dise\u00f1o de cejas",
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
      label: "Promoci\u00f3n especial",
      name: "Pinky",
      description: "U\u00f1as acr\u00edlicas + dise\u00f1o b\u00e1sico",
      price: "S/ 60",
      image: "assets/images/unas-acrilicas.jpg"
    },
    {
      id: "promo-mirada",
      label: "Promoci\u00f3n especial",
      name: "Mirada",
      description: "Lifting de pesta\u00f1as + dise\u00f1o de cejas",
      price: "S/ 55",
      image: "assets/images/pestanas.jpg"
    }
  ],

  galleryItems: [
    {
      title: "U\u00f1as acr\u00edlicas",
      image: "assets/images/unas-acrilicas.jpg"
    },
    {
      title: "Manicure gel",
      image: "assets/images/manicure-gel.jpg"
    },
    {
      title: "Cejas",
      image: "assets/images/cejas.jpg"
    },
    {
      title: "Pesta\u00f1as",
      image: "assets/images/pestanas.jpg"
    }
  ],

  faqs: [
    {
      question: "\u00bfAtiendes a domicilio?",
      answer: "S\u00ed, por ahora atendemos a domicilio \u00fanicamente en Comas."
    },
    {
      question: "\u00bfQu\u00e9 m\u00e9todos de pago aceptas?",
      answer: "Puedes pagar por Yape, Plin, transferencia o efectivo al confirmar tu reserva."
    },
    {
      question: "\u00bfC\u00f3mo reservo una cita?",
      answer: "Elige tu servicio y confirma por WhatsApp. Te respondemos r\u00e1pido para coordinar."
    }
  ]
};
