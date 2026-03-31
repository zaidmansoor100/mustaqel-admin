// src/app/services/permission.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './http/auth.service';
import { Observable, map, distinctUntilChanged, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permissionCache = new Map<string, boolean>();

    constructor(private authService: AuthService) {}

    /**
     * Check if user has a specific permission (Reactive)
     */
    hasPermission(permission: string): Observable<boolean> {
        return this.authService.permissions$.pipe(
            map((permissions) => {
                const cacheKey = `permission_${permission}`;
                if (this.permissionCache.has(cacheKey)) {
                    return this.permissionCache.get(cacheKey)!;
                }

                const hasPermission = permissions.includes(permission);
                this.permissionCache.set(cacheKey, hasPermission);
                return hasPermission;
            }),
            distinctUntilChanged()
        );
    }

    /**
     * Check if user has any of the given permissions (Reactive)
     */
    hasAnyPermission(permissions: string[]): Observable<boolean> {
        if (!permissions || permissions.length === 0) {
            return of(true);
        }

        return this.authService.permissions$.pipe(
            map((userPermissions) => permissions.some((p) => userPermissions.includes(p))),
            distinctUntilChanged()
        );
    }

    /**
     * Check if user has all of the given permissions (Reactive)
     */
    hasAllPermissions(permissions: string[]): Observable<boolean> {
        if (!permissions || permissions.length === 0) {
            return of(true);
        }

        return this.authService.permissions$.pipe(
            map((userPermissions) => permissions.every((p) => userPermissions.includes(p))),
            distinctUntilChanged()
        );
    }

    /**
     * Sync version for immediate checks (for menu filtering)
     */
    hasPermissionSync(permission: string): boolean {
        const permissions = this.authService.getPermissions();
        return permissions.includes(permission);
    }

    /**
     * Sync version for any permission check
     */
    hasAnyPermissionSync(permissions: string[]): boolean {
        if (!permissions || permissions.length === 0) {
            return true;
        }
        const userPermissions = this.authService.getPermissions();
        return permissions.some((p) => userPermissions.includes(p));
    }

    /**
     * Sync version for all permissions check
     */
    hasAllPermissionsSync(permissions: string[]): boolean {
        if (!permissions || permissions.length === 0) {
            return true;
        }
        const userPermissions = this.authService.getPermissions();
        return permissions.every((p) => userPermissions.includes(p));
    }

    /**
     * Get all permissions as strings
     */
    getPermissions(): string[] {
        return this.authService.getPermissions();
    }

    /**
     * Clear permission cache
     */
    clearCache(): void {
        this.permissionCache.clear();
    }
}
