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
        return this.cookieService.get(appVars.env['auth_cookie']) || null;
    }

    clearToken(): void {
        const appVars = AppVars;
        this.cookieService.delete(appVars.env['auth_cookie']);
    }
}