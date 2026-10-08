import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiValidationError,
  CampaignCreatePayload,
  CampaignCreateResponse,
  CampaignDetail,
  CampaignSummary,
} from './campaign.models';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  list(): Observable<CampaignSummary[]> {
    return this.http.get<CampaignSummary[]>(`${this.baseUrl}/campaigns`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  get(id: number): Observable<CampaignDetail> {
    return this.http.get<CampaignDetail>(`${this.baseUrl}/campaigns/${id}`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  create(payload: CampaignCreatePayload): Observable<CampaignCreateResponse> {
    return this.http
      .post<CampaignCreateResponse>(`${this.baseUrl}/campaigns`, payload)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 422 && error.error?.details) {
      return throwError(() => error.error as ApiValidationError);
    }

    const message =
      error.status === 0
        ? 'Unable to reach the API. Is the backend running?'
        : error.error?.error || error.message || 'Request failed';

    return throwError(() => new Error(message));
  }
}
