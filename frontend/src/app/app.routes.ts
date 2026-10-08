import { Routes } from '@angular/router';
import { CampaignCreateComponent } from './campaigns/campaign-create/campaign-create.component';
import { CampaignDetailComponent } from './campaigns/campaign-detail/campaign-detail.component';
import { CampaignListComponent } from './campaigns/campaign-list/campaign-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'campaigns' },
  { path: 'campaigns', component: CampaignListComponent },
  { path: 'campaigns/new', component: CampaignCreateComponent },
  { path: 'campaigns/:id', component: CampaignDetailComponent },
];
