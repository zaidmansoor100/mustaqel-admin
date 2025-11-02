import { Injectable } from '@angular/core';
import { ConfigurationService } from '@/services/configuration.service';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class FormFieldsResolver {
    constructor(
        private configuration: ConfigurationService,
        private messageService: MessageService
    ) {}

    resolve() {
        const FormField = new Promise((resolve, reject) => {
            this.configuration.getFormFields('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Form Fields',
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

        return Promise.all([FormField, Categories]);
    }
}
