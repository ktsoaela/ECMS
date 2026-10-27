import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthDetailsError } from '../auth.models';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});
  readonly formError = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  submit(): void {
    this.formError.set(null);
    this.fieldErrors.set({});
    this.form.markAllAsTouched();

    if (this.form.controls.password.value !== this.form.controls.password_confirmation.value) {
      this.fieldErrors.set({ password_confirmation: 'Password confirmation does not match' });
      return;
    }

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.auth
      .register({
        name: this.form.controls.name.value.trim(),
        email: this.form.controls.email.value.trim(),
        password: this.form.controls.password.value,
        password_confirmation: this.form.controls.password_confirmation.value,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          void this.router.navigate(['/campaigns']);
        },
        error: (error: AuthDetailsError | Error) => {
          this.loading.set(false);
          if ('details' in error) {
            this.fieldErrors.set(error.details);
            this.formError.set(error.error);
            return;
          }
          this.formError.set(error.message);
        },
      });
  }
}
