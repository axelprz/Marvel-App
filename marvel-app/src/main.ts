import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Inicialización de la Aplicación (Bootstrapping)
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
