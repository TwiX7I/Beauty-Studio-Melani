# Beauty Studio Melani

Landing page mobile-first para un servicio de cosmetología a domicilio en Comas. El proyecto es únicamente frontend y utiliza HTML, CSS y JavaScript puro.

## Estructura

```text
beauty-studio-melani/
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── whatsapp.js
│   ├── render.js
│   └── ui.js
└── assets/
    ├── images/
    └── icons/
```

## Cambiar servicios, precios o promociones

Edita `js/data.js`. Los servicios, promociones, galería, preguntas frecuentes y datos del negocio están centralizados en ese archivo. Las tarjetas se actualizan automáticamente al recargar la página.

## Cambiar el número de WhatsApp

En `js/data.js`, modifica:

```js
whatsappNumber: "51914992356"
```

Usa el código de país y el número, sin espacios ni símbolos.

## Cambiar imágenes

1. Guarda la nueva imagen dentro de `assets/images/`.
2. Actualiza su ruta en `js/data.js`.
3. Para el hero o el perfil de Melani, cambia directamente las rutas correspondientes en `index.html`.

## Ejecutar localmente

Puedes abrir `index.html` directamente en un navegador. Para una experiencia más cercana a producción, también puedes usar cualquier servidor estático local.

No requiere instalación, backend, base de datos ni proceso de compilación.

## Publicación

El proyecto está preparado para alojarse como sitio estático en GitHub Pages, Netlify o Vercel.
