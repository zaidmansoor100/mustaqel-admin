import { Routes } from '@angular/router';
import { AllEndApplicationsComponent } from './endorsementApplications/all-applications/all-applications.component';
import { AllInvesApplicationsComponent } from './investorApplications/all-applications/all-applications.component';
import { AllEntreApplicationsComponent } from './entrepreneurApplications/all-applications/all-applications.component';
import { ViewApplicationComponent } from './view-application/view-application.component';
import { SingleRequestResolver } from '@/resolvers/requestResolvers/singleRequest.resolver';
import { AllExecutiveApplications } from './executiveApplication/all-applications/all-applications';

export default [
    {
        path: 'endorsement-applications',
        component: AllEndApplicationsComponent,
        
    },{
        path: 'entrepreneur-applications',
        component: AllEntreApplicationsComponent,
        
    },{
        path: 'investor-applications',
        component: AllInvesApplicationsComponent,
        
    },{
        path: 'executive-applications',
        component: AllExecutiveApplications,
        
    },{
        path: 'view/:id',
        component: ViewApplicationComponent,
        resolve: {
            singleRequestResolver: SingleRequestResolver
        }
        
    },
] as Routes;