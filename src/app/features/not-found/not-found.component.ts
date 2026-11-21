import { Router } from '@angular/router';
import { inject } from '@angular/core';

export class NotFoundComponent {

  private router = inject(Router);

  goBack() {
    const token = localStorage.getItem('token');

    if (token) {
      this.router.navigate(['/feed']);
    } else {
      this.router.navigate(['/login']);
    }
  }

}