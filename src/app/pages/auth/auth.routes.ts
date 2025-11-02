import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AssessComponent } from './assess/assess.component';
import { ErrorComponent } from './error/error.component';
import { OtpComponent } from './otp/otp.component';

export default [
    { path: 'access', component: AssessComponent },
    { path: 'error', component: ErrorComponent },
    { path: 'login', component: LoginComponent },
    { path: 'otp', component: OtpComponent },
    {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
] as Routes;
