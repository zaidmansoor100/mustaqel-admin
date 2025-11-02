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
import { SharedModule } from '../../../common/modules/form.module';
import { CustomValidators } from '../../../common/validators/custom-validators';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/http/auth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    imports: [SharedModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfiguratorComponent],
    providers: [MessageService],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    loginForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private auth: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loginFormBuild();
    }

    loginFormBuild() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, CustomValidators.customEmailValidator()]],
            password: ['', [Validators.required, CustomValidators.password(), Validators.minLength(8), Validators.maxLength(64)]]
        });
    }

    login() {
        if (this.loginForm.invalid) return;
        const values = this.loginForm.value;

        this.auth.login(values.email, values.password).subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message
                });
                this.reqDataForOTP(values.email, response);
            },
            error: (error: any) => {
                console.log(error);

                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message });
            }
        });
    }

    reqDataForOTP(email: string, response: any) {
        this.router.navigate(['auth/otp'], {
            state: {
                email: email,
                twoFactorToken: response.twoFactorTokens
            }
        });
    }
}
