import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';
import { AppVars } from '../vars/vars.const';
import { AuthService } from './http/auth.service';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class AuthHelperService {
  readonly appVars = AppVars;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService,
  ) {
  }

  forceLogout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        this.forceLogoutClient();
      },
    });
  }

  forceLogoutClient(): void {
    this.deleteCookie(this.appVars.env['cookie'].name);
    this.deleteCookie(this.appVars.env.tokenExpiry);
    this.deleteCookie(this.appVars.env.tokenExpiryMin);

    const isCookie = this.cookieService.check(this.appVars.env['auth_cookie']);
    if (!isCookie) {
      this.router.navigate(['/auth']);
    }
  }

  deleteCookie(name: string) {
    this.cookieService.delete(
      name,
      this.appVars.env['cookie'].path,
      this.appVars.env['cookie'].domain
    );
  }

  addAuthToken(token: string, expiryTime: any): void {
    this.cookieService.set(
      this.appVars.env['cookie'].name,
      token,
      expiryTime,
      this.appVars.env['cookie'].path,
      this.appVars.env['cookie'].domain,
      this.appVars.env['cookie'].secure,
      this.appVars.env['cookie'].same_site
    );
  }
}
