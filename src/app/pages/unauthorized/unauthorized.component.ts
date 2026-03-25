import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="flex justify-content-center align-items-center min-h-screen bg-gray-100">
            <div class="text-center p-6 bg-white rounded-lg shadow-lg">
                <i class="pi pi-lock" style="font-size: 4rem; color: #ef4444;"></i>
                <h1 class="text-3xl font-bold mt-4 mb-2">Access Denied</h1>
                <p class="text-gray-600 mb-6">You do not have permission to access this page.</p>
                <button pButton label="Go to Dashboard" icon="pi pi-home" routerLink="/" class="p-button-primary"></button>
            </div>
        </div>
    `
})
export class UnauthorizedComponent {}