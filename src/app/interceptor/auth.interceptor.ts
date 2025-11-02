import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/http/auth.service';
import * as CryptoJS from 'crypto-js';
import { catchError, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AppVars } from '@/vars/vars.const';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
    const cookie = inject(CookieService);
    const auth = inject(AuthService);
    const router = inject(Router);
    const appVars = AppVars;

    const headersConfig: Record<string, string> = {};

    const token = cookie.get(appVars.env['auth_cookie'])
    // console.log('token', token);
    
    if (token) {
        headersConfig['Authorization'] = `Bearer ${token}`;
    }

    // Detect JSON payload (skip FormData/files)
    const isJson = req.body && !(req.body instanceof FormData);

    if (isJson) {
        headersConfig['Content-Type'] = 'application/json';

        const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const hmac = CryptoJS.HmacSHA256(bodyString, 'UPv0:C(K)mYCgM)').toString();
        headersConfig['X-Data-Integrity'] = hmac;
    }

    const authReq = req.clone({
        setHeaders: headersConfig,
        withCredentials: true // MUST for Sanctum SPA auth
    });

    // console.log('[AuthInterceptor] Outgoing request:', authReq);

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                auth.logout();
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        })
    );
};
