// src/app/pages/applications/applications.route.ts
import { Routes } from '@angular/router';
import { AllEndApplicationsComponent } from './endorsementApplications/all-applications/all-applications.component';
import { AllInvesApplicationsComponent } from './investorApplications/all-applications/all-applications.component';
import { AllEntreApplicationsComponent } from './entrepreneurApplications/all-applications/all-applications.component';
import { ViewApplicationComponent } from './view-application/view-application.component';
import { SingleRequestResolver } from '@/resolvers/requestResolvers/singleRequest.resolver';
import { AllExecutiveApplications } from './executiveApplication/all-applications/all-applications';
import { PermissionGuard } from '@/guards/permission.guard';
import { Permission } from '@/enums/permission.enum';

export default [
    {
        path: 'endorsement-applications',
        component: AllEndApplicationsComponent,
        data: {
            permissions: [Permission.VIEW_TALENT],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'entrepreneur-applications',
        component: AllEntreApplicationsComponent,
        data: {
            permissions: [Permission.VIEW_ENTREPRENEUR],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'investor-applications',
        component: AllInvesApplicationsComponent,
        data: {
            permissions: [Permission.VIEW_INVESTOR],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'executive-applications',
        component: AllExecutiveApplications,
        data: {
            permissions: [Permission.VIEW_EXECUTIVE],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'view/:id',
        component: ViewApplicationComponent,
        resolve: {
            singleRequestResolver: SingleRequestResolver
        },
        data: {
            permissions: [Permission.SHOW_TALENT, Permission.SHOW_ENTREPRENEUR, Permission.SHOW_INVESTOR, Permission.SHOW_EXECUTIVE],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    }
] as Routes;
