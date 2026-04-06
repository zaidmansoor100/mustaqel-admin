// src/app/services/http/auth.service.ts
import { Injectable } from '@angular/core';
import { CoreService } from './core.service';
import { Observable, BehaviorSubject, combineLatest, interval, of } from 'rxjs';
import { tap, filter, first, map, shareReplay, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../token.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends CoreService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    private permissionsSubject = new BehaviorSubject<string[]>([]);
    permissions$ = this.permissionsSubject.asObservable();

    private isLoadingSubject = new BehaviorSubject<boolean>(true);
    isLoading$ = this.isLoadingSubject.asObservable();

    private isInitializedSubject = new BehaviorSubject<boolean>(false);
    isInitialized$ = this.isInitializedSubject.asObservable();

    private userResolverPromise: Promise<any> | null = null;
    private authToken: string | null = null;

    private readonly CACHE_DURATION = 2 * 60 * 1000;
    private lastCacheCheck = 0;

    constructor(
        http: HttpClient,
        private tokenService: TokenService,
        private cookieService: CookieService
    ) {
        super(http);
        this.loadStoredUser();
        this.startAutoRefresh();
    }

    // Auto-refresh permissions every 2 minutes
    private startAutoRefresh(): void {
        interval(2 * 60 * 1000)
            .pipe(switchMap(() => this.refreshUserDataIfNeeded()))
            .subscribe();
    }

    private refreshUserDataIfNeeded(): Observable<boolean> {
        if (!this.currentUserSubject.value) {
            return of(false);
        }

        const now = Date.now();
        if (now - this.lastCacheCheck < this.CACHE_DURATION) {
            return of(false);
        }

        this.lastCacheCheck = now;
        console.log('Auto-refreshing user data...');

        return this.userResolver().pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    private loadStoredUser(): void {
        const storedData = this.getStoredData();

        if (storedData) {
            const { user, permissions, timestamp } = storedData;
            const cacheAge = Date.now() - timestamp;

            // Use cached data if less than 2 minutes old
            if (cacheAge < this.CACHE_DURATION) {
                this.currentUserSubject.next(user);
                this.permissionsSubject.next(permissions);
                console.log('Loaded valid cached user with permissions:', permissions.length);
            } else {
                console.log('Cache expired, will fetch fresh data');
                // Don't use expired cache, but keep it as fallback
                this.currentUserSubject.next(user);
                this.permissionsSubject.next(permissions);
                // Refresh in background
                this.userResolver().subscribe();
            }
        } else {
            console.log('No stored user found');
        }

        this.isLoadingSubject.next(false);
        this.isInitializedSubject.next(true);
    }

    private getStoredData(): { user: any; permissions: string[]; timestamp: number } | null {
        try {
            const userData = localStorage.getItem('currentUser');
            const permissionsData = localStorage.getItem('permissions');
            const timestamp = localStorage.getItem('userCacheTimestamp');

            if (userData && permissionsData && timestamp) {
                const user = JSON.parse(userData);
                const permissions = JSON.parse(permissionsData);

                // Store only the essential user data
                const minimalUser = {
                    id: user.id,
                    name: user.name,
                    nameArabic: user.nameArabic,
                    email: user.email,
                    status: user.status,
                    role: user.role
                };

                return {
                    user: minimalUser,
                    permissions: permissions,
                    timestamp: parseInt(timestamp)
                };
            }
            return null;
        } catch (e) {
            console.error('Error reading stored user data:', e);
            return null;
        }
    }

    private storeUserData(user: any, permissions: string[]): void {
        try {
            // Store only essential user data
            const minimalUser = {
                id: user.id,
                name: user.name,
                nameArabic: user.nameArabic,
                email: user.email,
                status: user.status,
                role: user.role
            };

            localStorage.setItem('currentUser', JSON.stringify(minimalUser));
            localStorage.setItem('permissions', JSON.stringify(permissions));
            localStorage.setItem('userCacheTimestamp', Date.now().toString());

            console.log('User data cached successfully');
        } catch (e) {
            console.error('Error storing user data:', e);
        }
    }

    private clearStorage(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('permissions');
        localStorage.removeItem('token');
        localStorage.removeItem('userCacheTimestamp');
        console.log('User cache cleared');
    }

    private extractPermissions(permissionsData: any[]): string[] {
        if (!Array.isArray(permissionsData)) return [];

        return permissionsData.map((p) => {
            if (typeof p === 'object' && p !== null && p.name) {
                return p.name;
            }
            return p;
        });
    }

    login(email: string, password: string): Observable<any> {
        this.isLoadingSubject.next(true);
        return this.post<any>('auth/login', { email, password }).pipe(
            tap((response: any) => {
                if (response.success && response.data.user) {
                    const user = response.data.user;
                    let permissions: string[] = [];

                    if (user.permissions && Array.isArray(user.permissions)) {
                        permissions = this.extractPermissions(user.permissions);
                    } else if (response.data.permissions) {
                        permissions = response.data.permissions;
                    }

                    this.storeUserData(user, permissions);

                    // Use TokenService to store token in cookie
                    if (response.data.token) {
                        this.tokenService.setToken(response.data.token);
                    }

                    this.currentUserSubject.next(user);
                    this.permissionsSubject.next(permissions);
                    console.log('Login successful, permissions loaded:', permissions.length);
                }
                this.isLoadingSubject.next(false);
            })
        );
    }

    signUp(payload: any): Observable<any> {
        return this.post('auth/signup', payload).pipe(
            tap(() => {
                this.clearStorage();
            })
        );
    }

    verifyEmailOtp(email: string, otp: string, pendingToken: string): Observable<any> {
        return this.post('auth/2fa/verify', { email, otp, pendingToken });
    }

    resendOtp(email: string): Observable<any> {
        return this.post('auth/resend-otp', { email });
    }

    resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
        return this.post('auth/reset-password', { email, otp, newPassword }).pipe(
            tap(() => {
                this.clearStorage();
                this.currentUserSubject.next(null);
                this.permissionsSubject.next([]);
            })
        );
    }

    updatePassword(currentPassword: string, newPassword: string): Observable<any> {
        return this.post('auth/update-password', { currentPassword, newPassword }).pipe(
            tap(() => {
                this.clearStorage();
                this.currentUserSubject.next(null);
                this.permissionsSubject.next([]);
            })
        );
    }

    logout(): Observable<any> {
        // Use tokenService instead of cookieService directly
        return this.post('auth/logout', {}).pipe(
            tap(() => {
                this.clearStorage();
                this.currentUserSubject.next(null);
                this.permissionsSubject.next([]);
                this.authToken = null;
                this.isLoadingSubject.next(false);
                this.tokenService.clearToken();
                console.log('Logout successful');
            })
        );
    }

    userResolver(): Observable<any> {
        console.log('UserResolver - fetching from API');
        this.isLoadingSubject.next(true);

        const request$ = this.get('user/resolve').pipe(
            tap((response: any) => {
                if (response.success && response.data.user) {
                    const user = response.data.user;
                    let permissions: string[] = [];

                    if (user.permissions && Array.isArray(user.permissions)) {
                        permissions = this.extractPermissions(user.permissions);
                    } else if (response.data.permissions) {
                        permissions = response.data.permissions;
                    }

                    console.log('UserResolver - loaded permissions from API:', permissions.length);

                    this.storeUserData(user, permissions);

                    this.currentUserSubject.next(user);
                    this.permissionsSubject.next(permissions);
                }
                this.isLoadingSubject.next(false);
            }),
            shareReplay(1)
        );

        this.userResolverPromise = request$.toPromise();
        return request$;
    }

    // Force refresh - Call this after any permission changes
    forceRefreshUserData(): Observable<any> {
        console.log('Force refreshing user data...');
        this.clearStorage();
        return this.userResolver();
    }

    // Add missing getCurrentUser method
    getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    ensureUserDataLoaded(): Observable<any> {
        if (this.currentUserSubject.value) {
            console.log('User data already loaded');
            return this.currentUser$;
        }

        if (this.userResolverPromise) {
            console.log('Waiting for pending resolver');
            return new Observable((subscriber) => {
                this.userResolverPromise!.then(() => {
                    subscriber.next(this.currentUserSubject.value);
                    subscriber.complete();
                }).catch((error) => subscriber.error(error));
            });
        }

        console.log('Running user resolver');
        return this.userResolver();
    }

    waitForUserData(): Observable<{ user: any; permissions: string[] }> {
        return combineLatest([this.currentUser$.pipe(filter((user) => user !== null)), this.permissions$]).pipe(
            first(),
            map(([user, permissions]) => {
                console.log('waitForUserData completed with permissions:', permissions.length);
                return { user, permissions };
            })
        );
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    getPermissions(): string[] {
        return this.permissionsSubject.value;
    }

    hasPermission(permission: string): boolean {
        return this.getPermissions().includes(permission);
    }

    hasAnyPermission(permissions: string[]): boolean {
        const userPermissions = this.getPermissions();
        return permissions.some((p) => userPermissions.includes(p));
    }

    hasAllPermissions(permissions: string[]): boolean {
        const userPermissions = this.getPermissions();
        return permissions.every((p) => userPermissions.includes(p));
    }
}
