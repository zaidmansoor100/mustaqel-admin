import { Routes } from '@angular/router';  
import { AdminUsers } from './admin-users/admin-users';
import { ApplicantUsers } from './applicant-users/applicant-users';
import { EntityUsers } from './entity-users/entity-users';
import { AllUsersResolver } from '@/resolvers/allUsersResolver.resolver';
import { RolesComponent } from './roles/roles.component';
import { RolesResolver } from '@/resolvers/roles.resolver';

export default [
    {
        path: 'admin-users',
        component: AdminUsers, 
        resolve: { users: AllUsersResolver },
        data: { userType: 'jusour' }
        
    }, 
    {
        path: 'applicant-users',
        component: ApplicantUsers, 
        resolve: { users: AllUsersResolver },
        data: { userType: 'applicant' }
        
    }, 
    {
        path: 'entity-users',
        component: EntityUsers, 
        resolve: { users: AllUsersResolver },
        data: { userType: 'entity' }
        
    }, 
    {
        path: 'roles',
        component: RolesComponent, 
        resolve: { roles: RolesResolver }
        
    }, 
    { path: '**', redirectTo: '/admin-users' }
] as Routes;
