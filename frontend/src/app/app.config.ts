import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// CSR via `ng serve` in Docker (no SSR). Default XHR HttpClient stays zone-patched;
// withFetch + hydration left the campaigns list stuck on Loading.
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ],
};

