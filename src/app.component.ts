// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, NavigationStart, NavigationEnd, Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Observable, combineLatest } from 'rxjs';
import { LoaderService } from '@/services/loader.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { Permission } from '@/enums/permission.enum';
import { map, filter } from 'rxjs/operators';
import { AuthService } from '@/services/http/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Toast, NgIf, AsyncPipe],
    template: `
        <p-toast></p-toast>
        <router-outlet></router-outlet>
    `
})
export class AppComponent implements OnInit {
    loading$: Observable<boolean>;
    authLoading$: Observable<boolean>;
    showLoader$: Observable<boolean>;
    Permission = Permission;

    constructor(
        private loaderService: LoaderService,
        private authService: AuthService,
        private router: Router
    ) {
        this.loading$ = this.loaderService.loading$;
        this.authLoading$ = this.authService.isLoading$;
        
        // Show loader if either HTTP requests are loading OR auth is still loading
        this.showLoader$ = combineLatest([
            this.loading$,
            this.authLoading$
        ]).pipe(
            map(([httpLoading, authLoading]) => httpLoading || authLoading)
        );
    }

    ngOnInit() {
        console.log('AppComponent initialized');
        
        // Log navigation events for debugging
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                console.log('Navigation started to:', event.url);
            }
            if (event instanceof NavigationEnd) {
                console.log('Navigation ended to:', event.url);
            }
        });
        
        // Ensure user data is loaded on app start
        if (this.authService.isLoggedIn()) {
            console.log('User is logged in, ensuring data is loaded');
            this.authService.ensureUserDataLoaded().subscribe({
                next: () => console.log('User data loaded'),
                error: (err) => console.error('Error loading user data:', err)
            });
        }
    }
}