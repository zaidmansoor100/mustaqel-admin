import { Injectable } from '@angular/core';
import { ConfigurationService } from '@/services/configuration.service';
import { Resolve } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class StageStatusesResolver implements Resolve<any> {
    constructor(
        private configuration: ConfigurationService,
        private messageService: MessageService
    ) {}

    resolve() {

        const stages = new Promise((resolve, reject) => {
            this.configuration.getAllStages('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Stages',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });


        const stageStatuses = new Promise((resolve, reject) => {
            this.configuration.getAllStageStatuses('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Stages',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        return Promise.all([stageStatuses, stages]);
    }
}
