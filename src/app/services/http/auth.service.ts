// src/app/services/http/auth.service.ts
import { Injectable } from '@angular/core';
import { CoreService } from './core.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

export interface AuthResponse {
    user: any;
}

export interface UserPermissions {
    user: any;
    role: string;
    permissions: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService extends CoreService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();
    
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    permissions$ = this.permissionsSubject.asObservable();
    
    private authToken: string | null = null;

    constructor(http: HttpClient) {
        super(http);
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            const user = JSON.parse(userData);
            this.currentUserSubject.next(user);
            
            const permissions = user.permissions || [];
            this.permissionsSubject.next(permissions);
        }
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.post<AuthResponse>('auth/login', { email, password }).pipe(
            tap((response: any) => {
                if (response.success && response.data.user) {
                    const user = response.data.user;
                    const permissions = response.data.permissions || [];
                    
                    // Store in localStorage
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('permissions', JSON.stringify(permissions));
                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                    }
                    
                    // Update subjects
                    this.currentUserSubject.next(user);
                    this.permissionsSubject.next(permissions);
                }
            })
        );
    }

    signUp(payload: any): Observable<any> {
        return this.post('auth/signup', payload);
    }

    verifyEmailOtp(email: string, otp: string, pendingToken: string): Observable<any> {
        return this.post('auth/2fa/verify', { email, otp, pendingToken });
    }

    resendOtp(email: string): Observable<any> {
        return this.post('auth/resend-otp', { email });
    }

    resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
        return this.post('auth/reset-password', { email, otp, newPassword });
    }

    updatePassword(currentPassword: string, newPassword: string): Observable<any> {
        return this.post('auth/update-password', { currentPassword, newPassword });
    }

    logout(): Observable<any> {
        return this.post('auth/logout', {}).pipe(
            tap(() => {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('permissions');
                localStorage.removeItem('token');
                this.currentUserSubject.next(null);
                this.permissionsSubject.next([]);
                this.authToken = null;
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
        return permissions.some(p => userPermissions.includes(p));
    }

    hasAllPermissions(permissions: string[]): boolean {
        const userPermissions = this.getPermissions();
        return permissions.every(p => userPermissions.includes(p));
    }

    userResolver(): Observable<any> {
        return this.get('user/resolve').pipe(
            tap((response: any) => {
                if (response.success && response.data.user) {
                    const user = response.data.user;
                    const permissions = response.data.permissions || [];
                    
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('permissions', JSON.stringify(permissions));
                    
                    this.currentUserSubject.next(user);
                    this.permissionsSubject.next(permissions);
                }
            })
        );
    }
}