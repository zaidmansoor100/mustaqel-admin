import { Injectable } from '@angular/core';
import { ConfigurationService } from '@/services/configuration.service';
import { Resolve } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class EntitiesResolver implements Resolve<any> {
    constructor(
        private configuration: ConfigurationService,
        private messageService: MessageService
    ) {}

    resolve() {
        const Entities = new Promise((resolve, reject) => {
            this.configuration.getEntities('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Entities',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        const Activities = new Promise((resolve, reject) => {
            this.configuration.getActivities('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Activities',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        return Promise.all([Entities, Activities]);
    }
}
