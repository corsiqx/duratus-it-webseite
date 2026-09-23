import { Injectable } from '@angular/core';

export interface ContactRequest {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  topic: string;
  message: string;
}

/**
 * Placeholder until a backend exists. Replace `send` with an HttpClient call
 * (e.g. POST /api/contact) once the endpoint is available.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  send(request: ContactRequest): Promise<void> {
    console.info('[ContactService] Kein Backend angebunden, Anfrage nicht versendet:', request);
    return new Promise((resolve) => setTimeout(resolve, 900));
  }
}
