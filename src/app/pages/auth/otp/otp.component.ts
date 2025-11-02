import { SharedModule } from '@/common/modules/form.module';
import { AppFloatingConfiguratorComponent } from '@/layout/component/app-floating-configurator/app-floating-configurator.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHelperService } from '../../../services/auth-helper-service';
import { AppVars } from '../../../vars/vars.const';

import * as moment from 'moment';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/http/auth.service';

import { Location } from '@angular/common';

@Component({
    selector: 'app-otp',
    imports: [SharedModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfiguratorComponent],
    providers: [MessageService],

    templateUrl: './otp.component.html',
    styleUrl: './otp.component.scss'
})
export class OtpComponent {
    readonly appVars = AppVars;
    otpForm!: FormGroup;
    email: string = '';
    twoFactorToken: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authHelper: AuthHelperService,
        private auth: AuthService,
        private messageService: MessageService,
        private location: Location
    ) {
        const nav = this.router.getCurrentNavigation();

        if (nav?.extras.state) {
            this.email = nav.extras.state['email'];
            this.twoFactorToken = nav.extras.state['twoFactorToken'];
            window.history.replaceState({}, document.title);
        } else {
            this.location.back();
        }
    }

    ngOnInit(): void {
        this.otpFormBuild();
    }

    otpFormBuild() {
        this.otpForm = this.fb.group({
            otp: ['', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]]
        });
    }

    verification() {
        if (this.otpForm.invalid) return;
        const values = this.otpForm.value;
        const email = this.email || '';
        const pendingToken = this.twoFactorToken || '';

        this.auth.verifyEmailOtp(email, values.otp, pendingToken).subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message
                });
                this.authStuff(response);
            },
            error: (error: any) => {
                console.log(error);
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.errors
                });
            }
        });
    }

    authStuff(res: any) {
        const qatarTime = moment.utc();
        const expiryTime = qatarTime.add(this.appVars.env.tokenExpiry, 'minutes');
        const expires = expiryTime.toDate();
        const ExpireTime = expires;
        this.authHelper.addAuthToken(res.data.token, ExpireTime);
        this.router.navigate(['/']);
    }
}
