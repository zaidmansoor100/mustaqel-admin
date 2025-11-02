import { Routes } from '@angular/router';
import { AppLayoutComponent } from '@/layout/component/app-layout/app-layout.component';
import { DashboardComponent } from '@/pages/dashboard/dashboard.component';
import { AuthGuard } from '@/guards/auth.guard';
import { UserResolver } from '@/resolvers/userResolver.resolver';
// import { Documentation } from './app/pages/documentation/documentation';
// import { Landing } from './app/pages/landing/landing';
// import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        resolve: {
            userResolver: UserResolver
        },
        children: [
            { path: '', component: DashboardComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    {
        path: 'auth',
        canActivate: [AuthGuard],
        loadChildren: () => import('./app/pages/auth/auth.routes')
    }

    // { path: '**', redirectTo: '/notfound' }
];
