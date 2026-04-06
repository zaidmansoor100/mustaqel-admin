// src/app/services/token.service.ts
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AppVars } from '@/vars/vars.const';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    constructor(private cookieService: CookieService) {}

    getToken(): string | null {
        const appVars = AppVars;
        const token = this.cookieService.get(appVars.env['auth_cookie']);
        console.log('[TokenService] Getting token:', !!token);
        return token || null;
    }

    setToken(token: string): void {
        const appVars = AppVars;
        this.cookieService.set(appVars.env['auth_cookie'], token, {
            path: '/',
            secure: false, // Set to true in production with HTTPS
            sameSite: 'Lax'
        });
        console.log('[TokenService] Token set');
    }

    clearToken(): void {
        const appVars = AppVars;
        this.cookieService.delete(appVars.env['auth_cookie'], '/');
        console.log('[TokenService] Token cleared');
    }

    hasToken(): boolean {
        return !!this.getToken();
    }
}