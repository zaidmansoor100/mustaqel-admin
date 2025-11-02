import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
    Validators,
    FormGroup,
} from '@angular/forms';

export class CustomValidators {
    static alphaRegex = "^[a-zA-Z ]+$";
    static arabicRegex = "[ا-ي إ أ ء ئ لأ ؤ ۂ آ لآ()-.]+";
    static alphaArabicRegex = "[a-zA-Zا-ي إ أ ء ئ لأ ؤ ۂ آ لآ()-.]+";
    static alphaArabicNumericRegex = "[a-zA-Z0-9ا-ي إ أ ء ئ لأ ؤ ۂ آ لآ()-.]+";
    static alphaNumericRegex = "^[a-zA-Z0-9 ]+$";
    static numericRegex = "[0-9]+";
    static decimalRegex = "[0-9.]+";
    static numericsAndSymbols = '[0-9 !@#$%^*_+\\=\\[\\]{}~:\\|,.?]+';
    static alphaArabicNumericAndSymbolsRegex = '[a-zA-Z0-9ا-ي إ أ ء ئ لأ ؤ ۂ آ لآ !@#$%^*_+\\=\\[\\]{}~:\\|,.?]+';
    static passwordRegex: any = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,64}$';
    static dateRegex: any = "^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$";

    static requiredIf(field: string, expectedValue: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.parent) return null;

            const relatedControl = control.parent.get(field);
            if (!relatedControl) return null;

            return relatedControl.value === expectedValue && !control.value
                ? { requiredIf: { field, expectedValue } }
                : null;
        };
    }

    static dateOfBirth(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const dobDate = new Date(control.value);
            const today = new Date();

            if (dobDate > today) {
                return { current: true, message: 'Date of birth must be valid.' };
            }

            return null;
        };
    }

    static minAge(min: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const birthDate = new Date(control.value);
            if (isNaN(birthDate.getTime())) return null;

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();

            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age < min
                ? { minAge: { requiredAge: min, actualAge: age } }
                : null;
        };
    }

    static passportIssue(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            const issueDate = new Date(value);
            const today = new Date();

            if (issueDate > today) {
                return { issue: true, message: 'Passport issue date must be valid.' };
            }

            return null;
        };
    }

    static passportExpiry(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            const today = new Date();
            today.setMonth(today.getMonth() + 6);
            const expiry = new Date(value);
            if (expiry <= today) {
                return {
                    expired: true,
                    message:
                        'Passport must expire at least 6 months from today.',
                };
            }
            return null;
        };
    }

    static notSameAsEmail(loggedInEmail: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const enteredEmail = control.value?.toLowerCase();
            if (!enteredEmail || !loggedInEmail) return null;

            const isSame = enteredEmail === loggedInEmail.toLowerCase();
            return isSame ? { sameAsLoginUserEmail: true } : null;
        };
    }

    static customEmailValidator() {
        return (control: any) => {
            const email = control.value;
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

            if (!regex.test(email)) {
                return { invalidEmail: true };
            }

            return null;
        };
    }

    static validatePhoneNumber(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const phone = control.value;
            const qatarPhoneRegex = /^(?:[0-9] ?){6,14}[0-9]$/;

            return phone && !qatarPhoneRegex.test(phone)
                ? { invalidPhoneNumber: true }
                : null;
        };
    }

    static alpha(): ValidatorFn {
        return Validators.pattern(CustomValidators.alphaRegex);
    }

    static arabic(): ValidatorFn {
        return Validators.pattern(CustomValidators.arabicRegex);
    }

    static alphaArabic(): ValidatorFn {
        return Validators.pattern(CustomValidators.alphaArabicRegex);
    }

    static alphaArabicNumeric(): ValidatorFn {
        return Validators.pattern(CustomValidators.alphaArabicNumericRegex);
    }

    static alphaNumeric(): ValidatorFn {
        return Validators.pattern(CustomValidators.alphaNumericRegex);
    }

    static numeric(): ValidatorFn {
        return Validators.pattern(CustomValidators.numericRegex);
    }

    static decimal(): ValidatorFn {
        return Validators.pattern(CustomValidators.decimalRegex);
    }

    static numericSymbols(): ValidatorFn {
        return Validators.pattern(CustomValidators.numericsAndSymbols);
    }

    static alphaArabicNumericSymbols(): ValidatorFn {
        return Validators.pattern(CustomValidators.alphaArabicNumericAndSymbolsRegex);
    }

    static password(): ValidatorFn {
        return Validators.pattern(CustomValidators.passwordRegex);
    }

    static date(): ValidatorFn {
        return Validators.pattern(CustomValidators.dateRegex);
    }
}
