import { Injectable } from '@angular/core';
import { ConfigurationService } from '@/services/configuration.service';
import { Resolve } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class CategoriesResolver implements Resolve<any> {
    constructor(
        private configuration: ConfigurationService,
        private messageService: MessageService
    ) {}

    resolve() {
        const Categories = new Promise((resolve, reject) => {
            this.configuration.getCategories('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load categories',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        return Promise.all([Categories]);
    }
}
