// src/app/services/permission-sync.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './http/auth.service';
import { MessageService } from 'primeng/api';
import { interval, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PermissionSyncService implements OnDestroy {
    private pollingSubscription: Subscription | null = null;
    private readonly POLL_INTERVAL = 60 * 1000; // Check every 1 minute
    private lastPermissionHash: string | null = null;

    constructor(
        private authService: AuthService,
        private messageService: MessageService
    ) {
        this.startPolling();
    }

    private startPolling(): void {
        this.pollingSubscription = interval(this.POLL_INTERVAL).pipe(
            switchMap(async () => this.checkForPermissionChanges())
        ).subscribe();
    }

    private async checkForPermissionChanges() {
        if (!this.authService.isLoggedIn()) {
            return;
        }

        // Get current user data fresh from API
        return this.authService.userResolver().subscribe({
            next: (response: any) => {
                if (response.success && response.data.user) {
                    const newPermissions = response.data.user.permissions || [];
                    const currentPermissions = this.authService.getPermissions();
                    
                    // Compare permission arrays
                    const hasChanged = this.hasPermissionsChanged(currentPermissions, newPermissions);
                    
                    if (hasChanged) {
                        console.log('Permission changes detected!');
                        this.notifyUser();
                    }
                }
            },
            error: (error) => {
                console.log('Permission check failed', error);
            }
        });
    }

    private hasPermissionsChanged(oldPerms: string[], newPerms: any[]): boolean {
        // Extract permission names from new permissions
        const newPermNames = newPerms.map(p => {
            if (typeof p === 'object' && p.name) return p.name;
            return p;
        });
        
        if (oldPerms.length !== newPermNames.length) return true;
        
        const sortedOld = [...oldPerms].sort();
        const sortedNew = [...newPermNames].sort();
        
        return !sortedOld.every((value, index) => value === sortedNew[index]);
    }

    private notifyUser(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Permissions Updated',
            detail: 'Your permissions have been updated. Refreshing...',
            life: 5000,
            sticky: true
        });
        
        // Refresh user data
        this.authService.forceRefreshUserData().subscribe({
            next: () => {
                console.log('Permissions refreshed successfully');
                // Reload page to apply new permissions
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    }

    // Manual refresh trigger (call this when you know permissions changed)
    triggerManualRefresh(): void {
        console.log('Manual permission refresh triggered');
        this.checkForPermissionChanges();
    }

    ngOnDestroy(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }
}