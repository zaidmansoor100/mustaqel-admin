import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { LoaderService } from '@/services/loader.service';
import { NgIf, AsyncPipe } from '@angular/common'; // 👈 add these

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Toast, ProgressSpinner, NgIf, AsyncPipe],
    template: `
        <div class="loader-overlay" *ngIf="loading$ | async">
            <p-progressSpinner styleClass="loader-spinner" strokeWidth="4" animationDuration=".5s"> </p-progressSpinner>
        </div>
        <p-toast></p-toast>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {
    loading$: Observable<boolean>;

    constructor(private loaderService: LoaderService) {
        this.loading$ = this.loaderService.loading$;
    }
}
