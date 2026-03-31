// src/app/resolvers/userResolver.resolver.ts
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/services/http/auth.service';
import { tap, catchError, map, first } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserResolver {
    constructor(
        private auth: AuthService,
        private messageService: MessageService
    ) {}

    resolve(): Observable<any> | Promise<any> {
        console.log('UserResolver started');
        
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
                return of(null);
            })
        );
    }
}