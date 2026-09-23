import { Injectable } from '@angular/core';

export interface ApplicationRequest {
  position: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  availableFrom: string;
  profileUrl: string;
  message: string;
  /** Selected documents; only names and sizes are logged until a backend exists. */
  documents: File[];
}

/**
 * Placeholder until a backend exists. Replace `send` with a multipart upload
 * (e.g. POST /api/applications with FormData) once the endpoint is available.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationService {
  send(request: ApplicationRequest): Promise<void> {
    console.info('[ApplicationService] Kein Backend angebunden, Bewerbung nicht versendet:', {
      ...request,
      documents: request.documents.map((file) => `${file.name} (${Math.round(file.size / 1024)} kB)`),
    });
    return new Promise((resolve) => setTimeout(resolve, 900));
  }
}
