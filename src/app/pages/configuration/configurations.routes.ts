// src/app/pages/configuration/configurations.routes.ts
import { Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { SectorsComponent } from './sectors/sectors.component';
import { ActivitiesComponent } from './activities/activities.component';
import { SubActivitiesComponent } from './subActivities/subActivities.component';
import { AuthoritiesComponent } from './entities/authorities/authorities.component';
import { IncubatorsComponent } from './entities/incubators/incubators.component';
import { SubCategoriesComponent } from './subCategories/subCategories.component';
import { CategoriesResolver } from '@/resolvers/categories.resolver';
import { SubCategoriesResolver } from '@/resolvers/subCategories.resolver';
import { SectorsResolver } from '@/resolvers/sectors.resolver';
import { ActivitiesResolver } from '@/resolvers/activities.resolver';
import { SubActivitiesResolver } from '@/resolvers/subActivities.resolver';
import { EntitiesResolver } from '@/resolvers/entities.resolver';
import { IncubatorsResolver } from '@/resolvers/incubators.resolver';
import { ExtraFormFieldsComponent } from './extraFormFields/extraFormFields.component';
import { FormFieldsResolver } from '@/resolvers/formFields.resolver';
import { StagesComponent } from './stages/stages.component';
import { StageStatusesComponent } from './stage-statuses/stage-statuses.component';
import { StagesResolver } from '@/resolvers/stages.resolver';
import { StageStatusesResolver } from '@/resolvers/stageStatuses.resolver';
import { PermissionGuard } from '@/guards/permission.guard';
import { Permission } from '@/enums/permission.enum';

export default [
    {
        path: 'categories',
        component: CategoriesComponent,
        resolve: {
            categoriesResolver: CategoriesResolver
        },
        data: {
            permissions: [Permission.VIEW_CATEGORIES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'sub-categories',
        component: SubCategoriesComponent,
        resolve: {
            subCategoriesResolver: SubCategoriesResolver
        },
        data: {
            permissions: [Permission.VIEW_SUB_CATEGORIES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'sectors',
        component: SectorsComponent,
        resolve: {
            sectorsResolver: SectorsResolver
        },
        data: {
            permissions: [Permission.VIEW_SECTORS],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'activities',
        component: ActivitiesComponent,
        resolve: {
            activitiesResolver: ActivitiesResolver
        },
        data: {
            permissions: [Permission.VIEW_ACTIVITIES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'sub-activities',
        component: SubActivitiesComponent,
        resolve: {
            subActivitiesResolver: SubActivitiesResolver
        },
        data: {
            permissions: [Permission.VIEW_SUB_ACTIVITIES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'extra-fields',
        component: ExtraFormFieldsComponent,
        resolve: {
            formFieldsResolver: FormFieldsResolver
        },
        data: {
            permissions: [Permission.VIEW_FORM_FIELDS],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'authorities',
        component: AuthoritiesComponent,
        resolve: {
            entityResolver: EntitiesResolver
        },
        data: {
            permissions: [Permission.VIEW_ENTITIES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'incubators',
        component: IncubatorsComponent,
        resolve: {
            incubatorsResolver: IncubatorsResolver
        },
        data: {
            permissions: [Permission.VIEW_INCUBATORS],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'stages',
        component: StagesComponent,
        resolve: {
            stagesResolver: StagesResolver
        },
        data: {
            permissions: [Permission.VIEW_STAGES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    },
    {
        path: 'stage-statuses',
        component: StageStatusesComponent,
        resolve: {
            stageStatusesResolver: StageStatusesResolver
        },
        data: {
            permissions: [Permission.VIEW_STAGE_STATUSES],
            permissionMode: 'any'
        },
        canActivate: [PermissionGuard]
    }
] as Routes;