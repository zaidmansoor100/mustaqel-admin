import { Routes } from '@angular/router';  
import { AdminUsers } from './admin-users/admin-users';
import { ApplicantUsers } from './applicant-users/applicant-users';
import { EntityUsers } from './entity-users/entity-users';

export default [
    {
        path: 'admin-users',
        component: AdminUsers, 
        
    }, 
    {
        path: 'applicant-users',
        component: ApplicantUsers, 
        
    }, 
    {
        path: 'entity-users',
        component: EntityUsers, 
        
    }, 
    { path: '**', redirectTo: '/admin-users' }
] as Routes;
