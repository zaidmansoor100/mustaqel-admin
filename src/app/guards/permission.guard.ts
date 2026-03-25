// src/app/guards/permission.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate, CanActivateChild {
    constructor(
        private permissionService: PermissionService,
        private router: Router,
        private messageService: MessageService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkPermissions(route, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.checkPermissions(route, state);
    }

    private checkPermissions(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const permissions = route.data['permissions'] as string[];
        const mode = route.data['permissionMode'] || 'any';
        const redirectTo = route.data['redirectTo'] || '/unauthorized';
        const showMessage = route.data['showMessage'] !== false;

        if (!permissions || permissions.length === 0) {
            return of(true);
        }

        let check$: Observable<boolean>;

        if (mode === 'all') {
            check$ = this.permissionService.hasAllPermissions(permissions);
        } else {
            check$ = this.permissionService.hasAnyPermission(permissions);
        }

        return check$.pipe(
            take(1),
            map((hasPermission) => {
                if (!hasPermission) {
                    if (showMessage) {
                        this.messageService?.add({ severity: 'error', summary: 'Access Denied', detail: 'You do not have permission to access this page' });
                    }
                    this.router.navigate([redirectTo]);
                    return false;
                }
                return true;
            }),
            catchError(() => {
                this.router.navigate([redirectTo]);
                return of(false);
            })
        );
    }
}
