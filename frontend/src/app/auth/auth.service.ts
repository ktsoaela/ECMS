import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthDetailsError, AuthResponse } from './auth.models';

const TOKEN_KEY = 'auth_token';
const NAME_KEY = 'auth_name';

function browserStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = browserStorage();

  readonly token = signal<string | null>(this.storage?.getItem(TOKEN_KEY) ?? null);
  readonly userName = signal<string | null>(this.storage?.getItem(NAME_KEY) ?? null);

  isLoggedIn(): boolean {
    return this.token() !== null;
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, payload)
      .pipe(tap((response) => this.remember(response)), catchError((error) => this.handleError(error)));
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, payload)
      .pipe(tap((response) => this.remember(response)), catchError((error) => this.handleError(error)));
  }

  logout(): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/logout`, {}).pipe(
      tap(() => this.clear()),
      catchError((error) => {
        this.clear();
        return throwError(() => error);
      }),
    );
  }

  clear(): void {
    this.storage?.removeItem(TOKEN_KEY);
    this.storage?.removeItem(NAME_KEY);
    this.token.set(null);
    this.userName.set(null);
  }

  private remember(response: AuthResponse): void {
    this.storage?.setItem(TOKEN_KEY, response.token);
    this.storage?.setItem(NAME_KEY, response.name);
    this.token.set(response.token);
    this.userName.set(response.name);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 422 && error.error?.details) {
      return throwError(() => error.error as AuthDetailsError);
    }

    const message =
      error.status === 0
        ? 'Unable to reach the API. Is the backend running?'
        : error.error?.error || error.message || 'Request failed';

    return throwError(() => new Error(message));
  }
}
