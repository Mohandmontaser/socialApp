import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  msgError = signal<string>('');
  loading = signal<boolean>(false);

  registerSubscribe : Subscription = new Subscription ;


  registerForm: FormGroup = this.fb.nonNullable.group({
    login : ["" , [
      Validators.required,
      Validators.email,
    ]],
    password : ["" , [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ] ]
  })
translate: any;



  sendData(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.msgError.set('');

      this.registerSubscribe.unsubscribe();

      this.registerSubscribe = this.authService.signIn(this.registerForm.value).subscribe({
        next: (res) => {
          console.log(res);

          localStorage.setItem("socialToken" , res.data.token)
          localStorage.setItem("socialUser" , JSON.stringify(res.data.user))



          this.router.navigate(["/timeline"])
        },

        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.msgError.set(err.error.message);
          this.loading.set(false);
        },

        complete: () => {
          this.loading.set(false);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
