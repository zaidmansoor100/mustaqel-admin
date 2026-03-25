// src/app/pages/administration/administration.routes.ts
import { Routes } from '@angular/router';  
import { AdminUsers } from './admin-users/admin-users';
import { ApplicantUsers } from './applicant-users/applicant-users';
import { EntityUsers } from './entity-users/entity-users';
import { AllUsersResolver } from '@/resolvers/allUsersResolver.resolver';
import { RolesComponent } from './roles/roles.component';
import { RolesResolver } from '@/resolvers/roles.resolver';
import { PermissionGuard } from '@/guards/permission.guard';
import { Permission } from '@/enums/permission.enum';

export default [
    {
        path: 'admin-users',
        component: AdminUsers, 
        resolve: { users: AllUsersResolver },
        data: { 
            userType: 'jusour',
            permissions: [Permission.VIEW_ADMIN_USERS],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    }, 
    {
        path: 'applicant-users',
        component: ApplicantUsers, 
        resolve: { users: AllUsersResolver },
        data: { 
            userType: 'applicant',
            permissions: [Permission.VIEW_APPLICANT_USERS],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    }, 
    {
        path: 'entity-users',
        component: EntityUsers, 
        resolve: { users: AllUsersResolver },
        data: { 
            userType: 'entity',
            permissions: [Permission.VIEW_ENTITY_USERS],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    }, 
    {
        path: 'roles',
        component: RolesComponent, 
        resolve: { roles: RolesResolver },
        data: {
            permissions: [Permission.VIEW_ROLES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    }, 
    { path: '**', redirectTo: '/admin-users' }
] as Routes;