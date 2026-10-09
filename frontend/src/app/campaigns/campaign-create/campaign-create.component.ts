import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmailComposerComponent } from '../../email-blocks/email-composer/email-composer.component';
import { ApiValidationError } from '../campaign.models';
import { CampaignService } from '../campaign.service';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EmailComposerComponent],
  templateUrl: './campaign-create.component.html',
  styleUrl: './campaign-create.component.scss',
})
export class CampaignCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly campaigns = inject(CampaignService);

  @ViewChild(EmailComposerComponent) private composer?: EmailComposerComponent;

  readonly loading = signal(false);
  readonly success = signal<{ campaignId: number; recipientCount: number } | null>(null);
  readonly apiError = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});
  readonly clientError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    subject: ['', [Validators.required, Validators.maxLength(255)]],
    body: ['', [Validators.required, Validators.maxLength(10000)]],
    recipients: ['', [Validators.required]],
  });

  onBodyChange(body: string): void {
    this.form.controls.body.setValue(body);
    this.form.controls.body.markAsDirty();
  }

  submit(): void {
    this.success.set(null);
    this.apiError.set(null);
    this.fieldErrors.set({});
    this.clientError.set(null);
    this.form.markAllAsTouched();

    const composerError = this.composer?.validationError() ?? null;
    if (composerError) {
      this.clientError.set(composerError);
      return;
    }

    if (this.form.invalid) {
      this.clientError.set('Please fill in all required fields.');
      return;
    }

    const emails = this.parseEmails(this.form.controls.recipients.value);
    const emailError = this.validateEmails(emails);
    if (emailError) {
      this.clientError.set(emailError);
      return;
    }

    this.loading.set(true);

    this.campaigns
      .create({
        name: this.form.controls.name.value.trim(),
        subject: this.form.controls.subject.value.trim(),
        body: this.form.controls.body.value,
        recipient_emails: emails,
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.success.set({
            campaignId: response.campaign_id,
            recipientCount: response.recipient_count,
          });
          this.form.patchValue({ name: '', subject: '', recipients: '' });
        },
        error: (error: ApiValidationError | Error) => {
          this.loading.set(false);
          if ('details' in error) {
            this.fieldErrors.set(error.details);
            this.apiError.set(error.error);
            return;
          }
          this.apiError.set(error.message);
        },
      });
  }

  private parseEmails(value: string): string[] {
    return value
      .split(/[\n,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);
  }

  private validateEmails(emails: string[]): string | null {
    if (emails.length === 0) {
      return 'At least one recipient email is required.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emails.some((email) => !emailPattern.test(email))) {
      return 'Each recipient must be a valid email address.';
    }

    if (new Set(emails).size !== emails.length) {
      return 'Duplicate email addresses are not accepted.';
    }

    return null;
  }
}
