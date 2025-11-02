import { AppVars } from '@/vars/vars.const';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    readonly appVars = AppVars;
    constructor(
        private router: Router,
        private cookieService: CookieService
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const isLoggedIn = this.cookieService.check(this.appVars.env['auth_cookie']);
        const isAuthRoute = route.routeConfig?.path?.startsWith('auth');

        if (isLoggedIn && isAuthRoute) {
            this.router.navigate(['/']);
            return false;
        }

        if (!isLoggedIn && !isAuthRoute) {
            this.router.navigate(['/auth/login']);
            return false;
        }

        return true;
    }
}
