// src/app/resolvers/userResolver.resolver.ts
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/services/http/auth.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserResolver {
    constructor(
        private auth: AuthService,
        private messageService: MessageService
    ) {}

    resolve() {
        return new Promise((resolve, reject) => {
            this.auth.userResolver().subscribe({
                next: (res: any) => {
                    if (res.success && res.data.user) {
                        const user = res.data.user;
                        const permissions = res.data.permissions || [];
                        
                        // Store in localStorage
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        localStorage.setItem('permissions', JSON.stringify(permissions));
                        
                        // Update auth service subjects
                        this.auth['currentUserSubject'].next(user);
                        this.auth['permissionsSubject'].next(permissions);
                    }
                    resolve(res);
                },
                error: (err: any) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed to load user Resolver',
                        detail: err.error?.message || 'Error loading user data',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });
    }
}