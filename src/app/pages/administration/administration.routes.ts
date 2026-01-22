import { Routes } from '@angular/router';  
import { AdminUsers } from './admin-users/admin-users';
import { ApplicantUsers } from './applicant-users/applicant-users';
import { EntityUsers } from './entity-users/entity-users';

export default [
    {
        path: 'admin-users',
        component: AdminUsers,
        resolve: {
            // categoriesResolver: CategoriesResolver
        },
        
    }, 
    {
        path: 'applicant-users',
        component: ApplicantUsers,
        resolve: {
            // categoriesResolver: CategoriesResolver
        },
        
    }, 
    {
        path: 'entity-users',
        component: EntityUsers,
        resolve: {
            // categoriesResolver: CategoriesResolver
        },
        
    }, 
    { path: '**', redirectTo: '/admin-users' }
] as Routes;
