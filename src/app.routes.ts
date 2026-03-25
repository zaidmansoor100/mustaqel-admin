// src/app/app.routes.ts (or wherever appRoutes is defined)
import { Routes } from '@angular/router';
import { AppLayoutComponent } from '@/layout/component/app-layout/app-layout.component';
import { DashboardComponent } from '@/pages/dashboard/dashboard.component';
import { AuthGuard } from '@/guards/auth.guard';
import { PermissionGuard } from '@/guards/permission.guard';
import { UserResolver } from '@/resolvers/userResolver.resolver';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        resolve: {
            userResolver: UserResolver
        },
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'pages',
                loadChildren: () => import('./app/pages/pages.routes'),
                canActivateChild: [PermissionGuard] // This will protect all child routes
            }
        ]
    },
    {
        path: 'auth',
        canActivate: [AuthGuard],
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./app/pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent)
    }
];
