import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RequestService } from '@/services/request.service';

@Injectable({ providedIn: 'root' })
export class SingleRequestResolver {
    constructor(
        private requestService: RequestService,
        private messageService: MessageService
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
         const id: any = route.paramMap.get('id');
        const singleRequest = new Promise((resolve, reject) => {
            this.requestService.getSingleRequest(id).subscribe({
                next: (res: any) => resolve(res),
                error: (err: any) => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Failed to load user Request',
                        detail: err.error.message,
                        life: 3000
                    });
                    reject(err);
                }
            });
        });

        return Promise.all([singleRequest]);
    }
}
