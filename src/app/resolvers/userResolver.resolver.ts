// src/app/resolvers/userResolver.resolver.ts
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/services/http/auth.service';
import { TokenService } from '@/services/token.service';
import { tap, catchError, map, first } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserResolver {
    constructor(
        private auth: AuthService,
        private messageService: MessageService,
        private tokenService: TokenService,
        private router: Router
    ) {}

    resolve(): Observable<any> | Promise<any> {
        console.log('UserResolver started');
        
        // Check if user is on auth route (login, register, etc.)
        const currentUrl = this.router.url;
        const isAuthRoute = currentUrl.includes('/auth');
        
        // Skip resolver for auth routes
        if (isAuthRoute) {
            console.log('UserResolver - Skipping for auth route');
            return of({ success: true, data: { user: null } });
        }
        
        // Check if token exists
        const hasToken = this.tokenService.hasToken();
        if (!hasToken) {
            console.log('UserResolver - No token found, skipping');
            return of({ success: true, data: { user: null } });
        }
        
        // Let AuthService handle caching logic
        return this.auth.ensureUserDataLoaded().pipe(
            map((user) => {
                console.log('UserResolver - user data resolved');
                return { success: true, data: { user } };
            }),
            catchError((err: any) => {
                console.error('UserResolver error:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Failed to load user data',
                    detail: err.error?.message || 'Error loading user data',
                    life: 3000
                });
                return of({ success: false, data: { user: null } });
            })
        );
    }
}