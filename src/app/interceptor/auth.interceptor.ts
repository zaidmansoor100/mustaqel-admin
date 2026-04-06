// src/app/interceptor/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import * as CryptoJS from 'crypto-js';
import { catchError, throwError } from 'rxjs';
import { AppVars } from '@/vars/vars.const';
import { NavigationService } from '@/services/navigation.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
    const tokenService = inject(TokenService);
    const navigationService = inject(NavigationService);
    const appVars = AppVars;

    const headersConfig: Record<string, string> = {};

    const token = tokenService.getToken();

    if (token) {
        headersConfig['Authorization'] = `Bearer ${token}`;
    }

    const isJson = req.body && !(req.body instanceof FormData);

    if (isJson) {
        headersConfig['Content-Type'] = 'application/json';

        const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const hmac = CryptoJS.HmacSHA256(bodyString, 'UPv0:C(K)mYCgM)').toString();
        headersConfig['X-Data-Integrity'] = hmac;
    }

    const authReq = req.clone({
        setHeaders: headersConfig,
        withCredentials: true
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                tokenService.clearToken();
                setTimeout(() => {
                    navigationService.navigateToLogin();
                }, 100);
            }
            return throwError(() => error);
        })
    );
};
