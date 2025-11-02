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

export default [
    {
        path: 'categories',
        component: CategoriesComponent,
        resolve: {
            categoriesResolver: CategoriesResolver
        }
    },
    {
        path: 'sub-categories',
        component: SubCategoriesComponent,
        resolve: {
            subCategoriesResolver: SubCategoriesResolver
        }
    },
    {
        path: 'sectors',
        component: SectorsComponent,
        resolve: {
            sectorsResolver: SectorsResolver
        }
    },
    {
        path: 'activities',
        component: ActivitiesComponent,
        resolve: {
            activitiesResolver: ActivitiesResolver
        }
    },
    {
        path: 'sub-activities',
        component: SubActivitiesComponent,
        resolve: {
            subActivitiesResolver: SubActivitiesResolver
        }
    },
    {
        path: 'extra-fields',
        component: ExtraFormFieldsComponent,
        resolve: {
            formFieldsResolver: FormFieldsResolver
        }
        
    },
    {
        path: 'authorities',
        component: AuthoritiesComponent,
        resolve: {
            entityResolver: EntitiesResolver
        }
    },
    {
        path: 'incubators',
        component: IncubatorsComponent,
        resolve: {
            incubatorsResolver: IncubatorsResolver
        }
    }
] as Routes;
