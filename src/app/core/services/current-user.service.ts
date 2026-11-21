import { inject, Injectable, signal } from '@angular/core';
import { UsersService } from '../../features/profile/services/users.service'; // عدّل المسار
import { ProfileUser } from '../../features/profile/models/profile-user.interface'; // عدّل المسار

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly usersService = inject(UsersService);

  readonly user = signal<ProfileUser | null>(null);

  load(): void {
    this.usersService.getMyProfile().subscribe({
      next: (res) => this.user.set(res.data.user),
      error: (err) => console.log(err),
    });
  }

  updatePhoto(photo: string): void {
    this.user.update((u) => (u ? { ...u, photo } : u));
  }
}