// src/app/guards/auth.guard.ts
import { AppVars } from '@/vars/vars.const';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/http/auth.service';
import { filter, first, map, tap, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    readonly appVars = AppVars;
    constructor(
        private router: Router,
        private cookieService: CookieService,
        private authService: AuthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        console.log('AuthGuard checking route:', route.routeConfig?.path);

        // First, wait for loading to complete
        return this.authService.isLoading$.pipe(
            tap((isLoading) => console.log('AuthGuard isLoading:', isLoading)),
            filter((isLoading) => !isLoading),
            first(),
            switchMap(() => {
                // Ensure user data is loaded (this will wait for resolver if needed)
                return this.authService.ensureUserDataLoaded().pipe(
                    map(() => {
                        const isLoggedIn = this.cookieService.check(this.appVars.env['auth_cookie']);
                        const isAuthRoute = route.routeConfig?.path?.startsWith('auth');

                        console.log('AuthGuard - isLoggedIn:', isLoggedIn, 'isAuthRoute:', isAuthRoute);

                        if (isLoggedIn && isAuthRoute) {
                            console.log('Redirecting from auth to home');
                            this.router.navigate(['/']);
                            return false;
                        }

                        if (!isLoggedIn && !isAuthRoute) {
                            console.log('Redirecting to login');
                            this.router.navigate(['/auth/login']);
                            return false;
                        }

                        console.log('AuthGuard allowing access');
                        return true;
                    })
                );
            })
        );
    }
}
