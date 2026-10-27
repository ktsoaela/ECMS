import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CampaignCreateComponent } from './campaigns/campaign-create/campaign-create.component';
import { CampaignDetailComponent } from './campaigns/campaign-detail/campaign-detail.component';
import { CampaignListComponent } from './campaigns/campaign-list/campaign-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'campaigns' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'campaigns', component: CampaignListComponent, canActivate: [authGuard] },
  { path: 'campaigns/new', component: CampaignCreateComponent, canActivate: [authGuard] },
  { path: 'campaigns/:id', component: CampaignDetailComponent, canActivate: [authGuard] },
];
