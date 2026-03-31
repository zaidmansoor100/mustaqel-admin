// src/app/guards/permission.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, take, filter, first, switchMap, tap } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/http/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate, CanActivateChild {
    constructor(
        private permissionService: PermissionService,
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        console.log('PermissionGuard checking route:', state.url);
        return this.checkPermissions(route, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        console.log('PermissionGuard checking child route:', state.url);
        return this.checkPermissions(route, state);
    }

    private checkPermissions(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const permissions = route.data['permissions'] as string[];
        const mode = route.data['permissionMode'] || 'any';
        const redirectTo = route.data['redirectTo'] || '/unauthorized';
        const showMessage = route.data['showMessage'] !== false;
        const skipPermissionCheck = route.data['skipPermissionCheck'] === true;

        if (skipPermissionCheck) {
            console.log('Skipping permission check for this route');
            return of(true);
        }

        if (!permissions || permissions.length === 0) {
            console.log('No permissions required for this route');
            return of(true);
        }

        console.log('Required permissions:', permissions);
        console.log('Mode:', mode);

        // First, ensure user data is loaded
        return this.authService.ensureUserDataLoaded().pipe(
            switchMap(() => {
                // Then wait for user data and permissions
                return combineLatest([
                    this.authService.currentUser$.pipe(
                        tap((user) => console.log('Current user:', user?.name || 'null')),
                        filter((user) => user !== null),
                        first()
                    ),
                    this.authService.permissions$.pipe(
                        tap((userPermissions) => console.log('Current permissions count:', userPermissions.length)),
                        first()
                    )
                ]).pipe(
                    take(1),
                    map(([user, userPermissions]) => {
                        console.log('Checking permissions for user:', user?.name);
                        console.log('User permissions (first 10):', userPermissions.slice(0, 10));
                        console.log('Required permissions:', permissions);

                        let hasPermission = false;

                        if (mode === 'all') {
                            hasPermission = permissions.every((p) => userPermissions.includes(p));
                            console.log('All permissions check result:', hasPermission);
                        } else {
                            hasPermission = permissions.some((p) => userPermissions.includes(p));
                            console.log('Any permissions check result:', hasPermission);
                        }

                        if (!hasPermission) {
                            console.log('Permission denied for route:', state.url);
                            if (showMessage) {
                                this.messageService?.add({
                                    severity: 'error',
                                    summary: 'Access Denied',
                                    detail: 'You do not have permission to access this page'
                                });
                            }
                            this.router.navigate([redirectTo]);
                            return false;
                        }
                        console.log('Permission granted for route:', state.url);
                        return true;
                    }),
                    catchError((error) => {
                        console.error('Permission guard error:', error);
                        this.router.navigate([redirectTo]);
                        return of(false);
                    })
                );
            })
        );
    }
}
