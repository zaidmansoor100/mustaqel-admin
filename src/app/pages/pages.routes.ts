import { Routes } from '@angular/router';

export default [
    { path: 'configurations', loadChildren: () => import('./configuration/configurations.routes') },
    { path: 'applications', loadChildren: () => import('./applications/applications.route') },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
