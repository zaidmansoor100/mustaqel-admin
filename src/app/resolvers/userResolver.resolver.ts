import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/services/http/auth.service';

@Injectable({ providedIn: 'root' })
export class UserResolver {
    constructor(
        private auth: AuthService,
        private messageService: MessageService
    ) {}

    resolve() {
        const userResolver = new Promise((resolve, reject) => {
            this.auth.userResolver().subscribe({
                next: (res: any) => resolve(res),
                error: (err: any) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed to load user Resolver',
                        detail: err.error.message,
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        return Promise.all([userResolver]);
    }
}
