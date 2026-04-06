// src/app/services/navigation.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    constructor(private router: Router) {}

    navigateToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    navigateToHome(): void {
        this.router.navigate(['/']);
    }

    navigateToUnauthorized(): void {
        this.router.navigate(['/unauthorized']);
    }
}