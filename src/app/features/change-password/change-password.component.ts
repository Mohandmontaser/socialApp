import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  passwordForm = this.fb.group(
    {
      password: ['', [Validators.required]],
      newPassword: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$/)],
      ],
      confirmNewPassword: ['', [Validators.required]],
    },
    { validators: this.matchPasswords },
  );

  matchPasswords(group: any) {
    return group.get('newPassword')?.value === group.get('confirmNewPassword')?.value
      ? null
      : { mismatch: true };
  }

  submit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const { password, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ password, newPassword }).subscribe({
      next: (res) => {
        if (res.data?.token) {
          localStorage.setItem('socialToken', res.data.token);
        }
        this.successMsg = 'Password updated successfully';
        this.passwordForm.reset();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Something went wrong';
        this.isLoading = false;
      },
    });
  }
}
