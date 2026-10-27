import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CampaignSummary } from '../campaign.models';
import { CampaignService } from '../campaign.service';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.scss',
})
export class CampaignListComponent implements OnInit {
  private readonly campaignsApi = inject(CampaignService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly campaigns = signal<CampaignSummary[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.campaigns().length === 0) {
      this.loading.set(true);
    }
    this.error.set(null);

    this.campaignsApi.list().subscribe({
      next: (campaigns) => {
        this.campaigns.set(campaigns);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loading.set(false);
        if (this.campaigns().length === 0) {
          this.error.set(error.message);
        }
      },
    });
  }
}
