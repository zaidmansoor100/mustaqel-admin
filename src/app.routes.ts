// src/app/app.routes.ts
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
        runGuardsAndResolvers: 'always', // 👈 This ensures resolver runs on every navigation
        children: [
            {
                path: '',
                component: DashboardComponent,
                data: {
                    permissions: ['view-talent-application-statistacs', 'view-entrepreneur-application-statistacs', 'view-investor-application-statistacs', 'view-executive-application-statistacs', 'view-monthly-statistacs'],
                    permissionMode: 'any',
                    showMessage: false
                },
                canActivate: [PermissionGuard]
            },
            {
                path: 'pages',
                loadChildren: () => import('./app/pages/pages.routes'),
                canActivateChild: [PermissionGuard]
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
