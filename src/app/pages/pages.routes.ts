// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';

export default [
    {
        path: 'configurations',
        loadChildren: () => import('./configuration/configurations.routes'),
        data: {
            permissions: ['view-categories', 'view-sectors', 'view-activities'],
            permissionMode: 'any'
        }
    },
    {
        path: 'applications',
        loadChildren: () => import('./applications/applications.route'),
        data: {
            permissions: ['view-talent-applications', 'view-entrepreneur-applications', 'view-investor-applications', 'view-executive-applications'],
            permissionMode: 'any'
        }
    },
    {
        path: 'administration',
        loadChildren: () => import('./administration/administration.routes'),
        data: {
            permissions: ['view-admin-users', 'view-applicant-users', 'view-entity-users', 'view-roles'],
            permissionMode: 'any'
        }
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
