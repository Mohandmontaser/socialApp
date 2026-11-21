
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const gustGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (localStorage.getItem('socialToken')) {
    return router.parseUrl('/timeline/feed');
  }

  return true;
};
