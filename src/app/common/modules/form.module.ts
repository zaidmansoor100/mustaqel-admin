import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';


@NgModule({
    imports: [
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        FloatLabel,
        StyleClassModule,
        PasswordModule,
        ButtonModule,
        CommonModule,
        InputOtpModule,
        TagModule,
        // TranslateModule,
        DividerModule,
        SelectModule,
        DatePickerModule,
        RadioButtonModule,
        CheckboxModule,
        FileUploadModule,
        ToastModule,
        ProgressSpinner

    ],
    exports: [
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        FloatLabel,
        StyleClassModule,
        PasswordModule,
        ButtonModule,
        CommonModule,
        InputOtpModule,
        TagModule,
        // TranslateModule,
        DividerModule,
        ButtonModule,
        SelectModule,
        DatePickerModule,
        RadioButtonModule,
        CheckboxModule,
        FileUploadModule,
        ToastModule,
        ProgressSpinner
    ],
})

export class SharedModule {
}