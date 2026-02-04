import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdministrationService } from '@/services/administration.service';

@Injectable({ providedIn: 'root' })
export class RolesResolver implements Resolve<any> {

    constructor(
        private administrationService: AdministrationService,
        private messageService: MessageService
    ) {}

    resolve(route: ActivatedRouteSnapshot) {

        const roles =  new Promise((resolve, reject) => {
            this.administrationService.getAllRoles('?page=1').subscribe({
                next: (res: any) => resolve(res),
                error: (err: any) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed to load roles',
                        detail: err?.error?.message || 'Unknown error',
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        return Promise.all([roles]);
    }
}
