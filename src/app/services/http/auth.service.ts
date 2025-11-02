import { Injectable } from '@angular/core';
import { CoreService } from './core.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

export interface AuthResponse {
    user: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService extends CoreService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    private authToken: string | null = null;

    constructor(http: HttpClient) {
        super(http);
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.post<AuthResponse>('auth/login', { email, password });
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
                this.currentUserSubject.next(null);
                this.authToken = null;
            })
        );
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    userResolver(): Observable<any> {
      return this.get('user/resolve');
    }
}
