import { Injectable } from '@angular/core';
import { ConfigurationService } from '@/services/configuration.service';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class SubActivitiesResolver {
    constructor(
        private configuration: ConfigurationService,
        private messageService: MessageService
    ) {}

    resolve() {
        const SubActivities = new Promise((resolve, reject) => {
            this.configuration.getSubActivities('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Sub Activities',
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

        return Promise.all([SubActivities, Activities]);
    }
}
