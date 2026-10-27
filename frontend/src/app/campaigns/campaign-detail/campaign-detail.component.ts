import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, SecurityContext, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CampaignDetail } from '../campaign.models';
import { CampaignService } from '../campaign.service';

/** How often the detail view re-reads a campaign the worker is still sending. */
const REFRESH_MS = 3000;

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.scss',
})
export class CampaignDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly campaignsApi = inject(CampaignService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly campaign = signal<CampaignDetail | null>(null);
  readonly safeBodyHtml = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopRefresh());
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.error.set('Invalid campaign id.');
      return;
    }

    this.load(id);
  }

  private load(id: number): void {
    this.stopRefresh();

    this.campaignsApi.get(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (campaign) => {
        this.campaign.set(campaign);
        // Use Angular sanitization only — never bypassSecurityTrustHtml.
        this.safeBodyHtml.set(
          this.sanitizer.sanitize(SecurityContext.HTML, campaign.body)
        );
        this.loading.set(false);

        if (campaign.status !== 'done') {
          this.refreshTimer = setTimeout(() => this.load(id), REFRESH_MS);
        }
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  private stopRefresh(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
