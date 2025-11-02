import { Injectable } from '@angular/core';
import { ConfigurationService } from '@/services/configuration.service';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class SectorsResolver {
    constructor(
        private configuration: ConfigurationService,
        private messageService: MessageService
    ) {}

    resolve() {
        const Sectors = new Promise((resolve, reject) => {
            this.configuration.getSectors('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Sectors',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

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

        return Promise.all([Sectors, Categories]);
    }
}
