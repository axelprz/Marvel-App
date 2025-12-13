# MovieApp 🎬

Una aplicación moderna y responsiva hecha con **Angular (Standalone)**, **Firebase** y la **API pública de The Movie Database (TMDB)**. Permite descubrir películas, aplicar filtros avanzados (categoría, rating, año), marcar títulos como favoritos y ver detalles individuales. Incluye autenticación de usuario y almacenamiento de favoritos en Firestore.

---

## ✨ Características Principales

- **Base de Datos:** Consumo de datos en tiempo real de la API de TMDB.
- **Autenticación:** Registro e inicio de sesión seguro con Firebase Auth.
- **Búsqueda y Filtros:** Búsqueda por título, paginación, y filtrado avanzado por **Categoría (Género)**, Rating y Año de estreno.
- **Favoritos:** Sistema de favoritos persistente y único por usuario (Firestore).
- **Diseño:** Interfaz moderna, responsiva, y con estética de "Modo Oscuro Cinematográfico" utilizando Tailwind CSS.

---

## 🚀 Tecnologías y Herramientas

- **Frontend:** Angular (Standalone Components)
- **Base de Datos/Auth:** Firebase Authentication y Cloud Firestore
- **Estilos:** Tailwind CSS (con estilos profesionales customizados)
- **API:** The Movie Database (TMDB)
- **Lenguaje:** TypeScript

---

## 📦 Requisitos previos

Asegurate de tener instalado:

- [Node.js](https://nodejs.org/) (recomendado: v18 o superior)
- [Angular CLI](https://angular.io/cli):
```bash
npm install -g @angular/cli
```

- Una cuenta de Firebase (https://firebase.google.com/)
- Una cuenta en [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api) para obtener tu clave de API.
- [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
 npm install -g firebase-tools
```

---

## ⚙️ Instalación y configuración

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

Crea y/o edita el archivo `src/environments/environment.ts` y añade tus claves de TMDB y Firebase:

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    // 🔑 Reemplazar con tu config de Firebase
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
  },
  // 🔑 Clave de API de TMDB
  tmdbApiKey: 'TU_CLAVE_DE_TMDB_AQUÍ', 
};
```

Podés obtener estos datos desde el panel de tu proyecto en Firebase.

---

## ▶️ Ejecutar en desarrollo

```bash
ng serve
```

Abrí en el navegador: http://localhost:4200/peliculas

---

## 🌐 Deploy en Firebase Hosting

Asegúrate de que la carpeta pública en `firebase.json` sea la correcta para Angular:

1. Build del proyecto (genera los archivos estáticos)

```bash
ng build
```

2. Verificar Configuración: Abre `firebase.json` y asegúrate de que la sección hosting apunte a tu carpeta de build:

```bash
"hosting": {
    "public": "dist/movie-app/browser",  // RUTA ESTÁNDAR PARA ANGULAR STANDALONE
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
}
```

3. Deploy

```bash
firebase deploy --only hosting
```

---

## 📚 Estructura general del proyecto

```
src/
├── app/
│   ├── pages/
│   │   ├── peliculas-page.component.ts ⬅️ (Grid de Películas)
│   │   ├── pelicula-detalle.component.ts ⬅️ (Detalle)
│   │   └── favoritos.component.ts
│   ├── movie.service.ts ⬅️ (API de TMDB)
│   ├── auth.service.ts
│   └── toast.service.ts
├── environments/
└── styles.css (Estilos globales)
```

---

## 👥 Autores

- [Axel Perez] - Desarrollo principal, migración a TMDB y configuración de dependencias

- [Agustín Clavijo] - Diseño UI y sistema de filtros

- [Leonardo Pelaytay] - Coordinación y autenticación

---

## 🧪 Enlaces útiles

- API de TMDB: https://www.themoviedb.org/documentation/api
- Firebase Console: https://console.firebase.google.com/
- Angular: https://angular.io/
- TailwindCSS: https://tailwindcss.com/

---

## 🗃️ Licencia

Este proyecto es de uso académico y libre distribución con fines educativos.

