// src/app/guards/auth.guard.ts
import { AppVars } from '@/vars/vars.const';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/http/auth.service';
import { TokenService } from '../services/token.service';
import { filter, first, map, tap, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    readonly appVars = AppVars;
    constructor(
        private router: Router,
        private authService: AuthService,
        private tokenService: TokenService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        console.log('AuthGuard checking route:', route.routeConfig?.path);
        
        const isAuthRoute = route.routeConfig?.path?.startsWith('auth');
        
        // For auth routes, always allow access without checking user data
        if (isAuthRoute) {
            console.log('Auth route detected, allowing access without user data');
            return true;
        }
        
        // Check if we have a token
        const hasToken = this.tokenService.hasToken();
        
        console.log('AuthGuard - hasToken:', hasToken);

        // If no token and trying to access protected route, redirect to login
        if (!hasToken) {
            console.log('No token, redirecting to login');
            this.router.navigate(['/auth/login']);
            return false;
        }

        // For protected routes with token, wait for user data to load
        console.log('Waiting for user data to load...');
        
        return this.authService.isLoading$.pipe(
            tap((isLoading) => console.log('AuthGuard isLoading:', isLoading)),
            filter((isLoading) => !isLoading),
            first(),
            switchMap(() => {
                return this.authService.ensureUserDataLoaded().pipe(
                    map(() => {
                        const isLoggedIn = this.authService.isLoggedIn();
                        console.log('AuthGuard - isLoggedIn:', isLoggedIn);
                        
                        if (!isLoggedIn) {
                            console.log('Not logged in, redirecting to login');
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