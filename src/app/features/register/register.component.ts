import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,

  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  msgError = signal<string>('');
  loading = signal<boolean>(false);

  registerSubscribe : Subscription = new Subscription ;


  confirmPassword (group : AbstractControl){
const password = group.get("password")?.value
const rePassword = group.get("rePassword")?.value

if(password != rePassword && rePassword !== ""){
  group.get("rePassword")?.setErrors({mismatch: true})
  return {mismatch: true}
}
return null
  }


  registerForm: FormGroup = this.fb.group({
    name : ["" , [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(15),
    ]],


    username : [""],
    email : ["" ,  [
      Validators.required,
      Validators.email,
    ]],

    dateOfBirth : ["" , [Validators.required]],
    gender : ["" , [Validators.required]],
    password : ["" , [
      Validators.required,
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    ]],
    rePassword : ["" , [
      Validators.required
    ]]
  } , {validators : [this.confirmPassword]})




  sendData(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.msgError.set('');

      this.registerSubscribe.unsubscribe();

      this.registerSubscribe = this.authService.signUp(this.registerForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigate(["/login"])
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