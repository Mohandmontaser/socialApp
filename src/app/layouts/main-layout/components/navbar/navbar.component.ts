import { AuthService } from './../../../../core/auth/services/auth.service';
import { CurrentUserService } from './../../../../core/services/current-user.service';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref } from "@angular/router";
import { initFlowbite } from 'flowbite';


@Component({
  selector: 'app-navbar',
  imports: [RouterLinkActive, RouterLinkWithHref],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements AfterViewInit {
  private readonly authService = inject(AuthService)
  readonly currentUser = inject(CurrentUserService);

  ngOnInit(): void {
    if (!this.currentUser.user()) {
      this.currentUser.load();
    }
  }
  ngAfterViewInit(): void {
    initFlowbite();
  }
  
  logout():void{
    this.authService.logout()
  }

}
