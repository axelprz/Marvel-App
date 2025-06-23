# Marvel App 🔥

Una aplicación hecha con Angular, Firebase y la API pública de Marvel. Permite buscar personajes, marcarlos como favoritos y ver detalles individuales. Incluye autenticación, filtros, paginación y sistema de favoritos por usuario.

---

## 🚀 Tecnologías usadas

- Angular (standalone)
- Firebase Auth + Firestore
- TailwindCSS
- Marvel API
- TypeScript

---

## 📦 Requisitos previos

Asegurate de tener instalado:

- [Node.js](https://nodejs.org/) (recomendado: v18 o superior)
- [Angular CLI](https://angular.io/cli):

```bash
npm install -g @angular/cli
```

- Una cuenta de Firebase (https://firebase.google.com/)
- Una cuenta en https://developer.marvel.com para obtener las API Keys
- [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
 npm install -g firebase-tools
```

---

## 📁 Instalación y configuración

1. Clonar el repositorio

```bash
git clone https://github.com/axelprz/Marvel-App.git
cd marvel-app
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar credenciales de Firebase

En `src/app/app.config.ts`, reemplazá con tu configuración de Firebase:

```ts
provideFirebaseApp(() =>
  initializeApp({
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_BUCKET",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID",
  })
);
```

Podés obtener estos datos desde el panel de tu proyecto en Firebase.

4. Configurar las claves de Marvel API

En `src/app/marvel.service.ts`:

```ts
private publicKey = 'TU_PUBLIC_KEY';
private privateKey = 'TU_PRIVATE_KEY';
```

📌 Estas claves se obtienen desde https://developer.marvel.com una vez que creás una cuenta.

---

## ▶️ Ejecutar en desarrollo

```bash
ng serve
```

Abrí en el navegador: http://localhost:4200

---

## 🔐 Funcionalidades clave

- ✅ Registro e inicio de sesión con Firebase Auth
- ✅ Buscador de personajes usando nameStartsWith
- ✅ Paginación de resultados (10 por página)
- ✅ Sistema de favoritos único por usuario (Firestore)
- ✅ Filtros avanzados: ordenar por nombre o fecha, solo con descripción, modificado desde
- ✅ Vista detallada del personaje
- ✅ Toasts de feedback para agregar/quitar favoritos
- ✅ Responsivo y moderno con Tailwind

---

## 🌐 Deploy en Firebase Hosting

1. Login e inicialización

```bash
firebase login
firebase init hosting
```

- Elegí `dist/marvel-app` como carpeta pública
- Activá el modo SPA (Single Page Application) seleccionando `Sí` a "rewrite all urls to /index.html"

2. Build del proyecto

```bash
ng build
```

3. Deploy

```bash
firebase deploy
```

---

## 📚 Estructura general del proyecto

```
src/
├── app/
│   ├── pages/
│   │   ├── login.ts / register.ts / marvel.ts / favoritos.ts / personaje.ts
│   ├── marvel.service.ts
│   ├── auth.service.ts
│   └── toast.service.ts
├── environments/
├── assets/
├── index.html
```

---

## 👥 Autores

- [Axel Perez] - Desarrollo, Firebase y configuración de dependencias

- [Agustín Clavijo] - Diseño UI y filtrado

- [Leonardo Pelaytay] - Coordinación y autenticación

---

## 🧪 Enlaces útiles

- API de Marvel: https://developer.marvel.com/
- Firebase Console: https://console.firebase.google.com/
- Angular: https://angular.io/
- TailwindCSS: https://tailwindcss.com/

---

## 📷 Informe

Este proyecto cuenta con un informe detallado en PDF explicando paso a paso el desarrollo, tecnologías utilizadas, estructura, capturas, y más.

---

## 🗃️ Licencia

Este proyecto es de uso académico y libre distribución con fines educativos.
