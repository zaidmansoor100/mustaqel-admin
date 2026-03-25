import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActivatedRoute } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { CustomValidators } from '@/common/validators/custom-validators';
import { AdministrationService } from '@/services/administration.service';
import { finalize, Subject, takeUntil } from 'rxjs';

// Custom validator for password match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
    }
    return null;
};

interface User {
    id?: number;
    name: string;
    nameArabic?: string;
    email: string;
    status: 'active' | 'inactive';
    levels?: UserLevel[];
    created_at?: string;
    updated_at?: string;
}

interface UserLevel {
    name: string;
    position: number;
    role:
        | {
              id: number;
              name: string;
          }
        | string;
}

interface Role {
    id: number;
    name: string;
    approval_levels: number;
}

interface StatusOption {
    value: string;
    name: string;
}

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        SelectModule,
        TagModule,
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        InputNumberModule,
        CheckboxModule
    ],
    templateUrl: './admin-users.html',
    styleUrl: './admin-users.scss',
    providers: [MessageService, ConfirmationService]
})
export class AdminUsers implements OnInit, OnDestroy {
    // Dialog state
    userDialog: boolean = false;
    submitted: boolean = false;

    // Data
    users: User[] = [];
    selectedUsers: User[] = [];
    roles: Role[] = [];
    currentUser: User = {} as User;

    // Form
    userForm!: FormGroup;

    // Permissions
    private combinedPermissions: Set<string> = new Set();

    // Options
    statusOptions: StatusOption[] = [
        { value: 'active', name: 'Active' },
        { value: 'inactive', name: 'Inactive' }
    ];

    // Table configuration
    @ViewChild('dt') dt!: Table;
    cols: any[] = [];
    exportColumns: any[] = [];

    // Pagination
    totalRecords: number = 0;
    currentPage: number = 1;
    rowsPerPage: number = 10;

    // Loading states
    loading: boolean = false;

    // Cleanup
    private destroy$ = new Subject<void>();

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private administrationService: AdministrationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.initializeData();
        this.loadRoles();
        this.initializeTableColumns();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Getters
    get levelsArray(): FormArray {
        return this.userForm.get('levels') as FormArray;
    }

    // Initialization Methods
    private initializeData(): void {
        const usersData = this.activatedRoute.snapshot.data['users'];
        this.users = usersData?.[0]?.data?.user?.data || [];
        console.log('Initialized users:', this.users);
        this.formBuild();
    }

    private initializeTableColumns(): void {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Name (English)' },
            { field: 'nameArabic', header: 'Name (Arabic)' },
            { field: 'email', header: 'Email' },
            { field: 'created_at', header: 'Created At' },
            { field: 'updated_at', header: 'Updated At' },
            { field: 'status', header: 'Status' }
        ];

        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field
        }));
    }

    // API Methods
    private loadRoles(): void {
        this.administrationService
            .getRoleByType('jusour')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.roles = response.data?.role || response;
                    console.log('Roles loaded:', this.roles);
                },
                error: (error) => {
                    console.error('Failed to load roles:', error);
                    this.showError('Failed to load roles');
                }
            });
    }

    private loadRolePermissions(roleId: number): void {
        this.administrationService
            .getPermissionByRoleId(roleId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const permissions = this.extractPermissionsFromResponse(response);
                    permissions.forEach((perm) => this.combinedPermissions.add(perm));
                    this.updateFormPermissions();
                },
                error: (error) => {
                    console.error('Failed to load role permissions:', error);
                    this.showError('Failed to load role permissions');
                }
            });
    }

    private extractPermissionsFromResponse(response: any): string[] {
        let permissions: string[] = [];

        if (response.data?.permissions) {
            const permissionsData = response.data.permissions;
            Object.values(permissionsData).forEach((groupPermissions: any) => {
                if (Array.isArray(groupPermissions)) {
                    permissions.push(...groupPermissions);
                }
            });
        } else if (Array.isArray(response)) {
            permissions = response.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
        } else if (response.permissions) {
            permissions = response.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
        }

        return permissions;
    }

    private updateFormPermissions(): void {
        this.userForm.patchValue({
            permissions: Array.from(this.combinedPermissions)
        });
    }

    private recalculatePermissions(): void {
        this.combinedPermissions.clear();

        this.levelsArray.controls.forEach((control) => {
            const roleName = control.get('role')?.value;
            if (roleName) {
                const selectedRole = this.roles.find((r) => r.name === roleName);
                if (selectedRole) {
                    this.loadRolePermissions(selectedRole.id);
                }
            }
        });
    }

    // Form Methods
    formBuild(user?: User): void {
        this.resetCombinedPermissions();

        const existingLevels = this.extractExistingLevels(user);

        this.userForm = this.fb.group(
            {
                name: [user?.name || '', this.getNameValidators()],
                nameArabic: [user?.nameArabic || '', this.getArabicNameValidators()],
                email: [user?.email || '', [Validators.required, Validators.email]],
                status: [user?.status || 'active', [Validators.required]],
                password: ['', this.getPasswordValidators(user)],
                confirmPassword: ['', this.getConfirmPasswordValidators(user)],
                levels: this.fb.array([]),
                permissions: [[]]
            },
            { validators: user?.id ? [] : [passwordMatchValidator] }
        );

        this.populateLevels(existingLevels);
    }

    private getNameValidators(): any[] {
        return [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()];
    }

    private getArabicNameValidators(): any[] {
        return [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()];
    }

    private getPasswordValidators(user?: User): any[] {
        return user?.id ? [] : [Validators.required, Validators.minLength(8)];
    }

    private getConfirmPasswordValidators(user?: User): any[] {
        return user?.id ? [] : [Validators.required];
    }

    private extractExistingLevels(user?: User): UserLevel[] {
        if (!user?.levels || !Array.isArray(user.levels)) {
            return [];
        }

        return user.levels.map((level: any) => ({
            name: level.name,
            position: level.level || level.position,
            role: level.role?.name || level.role
        }));
    }

    private populateLevels(levels: UserLevel[]): void {
        if (levels.length > 0) {
            levels.forEach((level) => {
                this.addLevelWithData(level);
                if (level.role) {
                    const selectedRole = this.roles.find((r) => r.name === level.role);
                    if (selectedRole) {
                        this.loadRolePermissions(selectedRole.id);
                    }
                }
            });
        } else {
            this.addLevel();
        }
    }

    addLevel(): void {
        const levelGroup = this.fb.group({
            name: ['', Validators.required],
            position: [this.levelsArray.length + 1, [Validators.required, Validators.min(1)]],
            role: ['', Validators.required]
        });

        this.levelsArray.push(levelGroup);
    }

    addLevelWithData(levelData: UserLevel): void {
        const levelGroup = this.fb.group({
            name: [levelData.name || '', Validators.required],
            position: [levelData.position || this.levelsArray.length + 1, [Validators.required, Validators.min(1)]],
            role: [levelData.role || '', Validators.required]
        });

        this.levelsArray.push(levelGroup);
    }

    removeLevel(index: number): void {
        this.levelsArray.removeAt(index);

        // Reorder positions
        this.levelsArray.controls.forEach((control, i) => {
            control.get('position')?.setValue(i + 1);
        });

        this.recalculatePermissions();
    }

    getPositionOptionsForRole(roleName: string): number[] {
        const selectedRole = this.roles.find((r) => r.name === roleName);
        return selectedRole ? Array.from({ length: selectedRole.approval_levels }, (_, i) => i + 1) : [1];
    }

    onRoleChange(roleName: string, levelIndex: number): void {
        const selectedRole = this.roles.find((r) => r.name === roleName);
        if (selectedRole) {
            const levelGroup = this.levelsArray.at(levelIndex);
            levelGroup.get('position')?.setValue(1);
            this.loadRolePermissions(selectedRole.id);
        }
    }

    // CRUD Operations
    openNew(): void {
        this.resetState();
        this.formBuild();
        this.userDialog = true;
    }

    editUser(user: User): void {
        console.log('Editing user:', user);
        this.resetState();
        this.formBuild(user);
        this.currentUser = { ...user };
        this.userDialog = true;
    }

    saveUser(): void {
        this.submitted = true;

        if (this.userForm.invalid) {
            this.markFormFieldsAsTouched();
            return;
        }

        const formValue = this.userForm.value;
        const requestBody = this.buildRequestBody(formValue);

        if (this.currentUser.id) {
            this.updateUser(requestBody);
        } else {
            this.createUser(requestBody);
        }
    }

    private buildRequestBody(formValue: any): any {
        const requestBody: any = {
            personalInfo: {
                name: formValue.name,
                nameArabic: formValue.nameArabic,
                email: formValue.email,
                status: formValue.status
            },
            level: formValue.levels.map((level: any) => ({
                name: level.name,
                position: level.position,
                role: level.role
            })),
            permissions: formValue.permissions || []
        };

        if (!this.currentUser.id) {
            requestBody.personalInfo.password = formValue.password;
            requestBody.personalInfo.confirmPassword = formValue.confirmPassword;
        }

        return requestBody;
    }

    private updateUser(requestBody: any): void {
        this.administrationService
            .updateUser('jusour', this.currentUser.id!, requestBody)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const index = this.users.findIndex((u) => u.id === this.currentUser.id);
                    if (index !== -1) {
                        this.users[index] = { ...this.users[index], ...response };
                    }
                    this.showSuccess('User Updated Successfully');
                    this.closeDialog();
                },
                error: (error) => this.handleError(error, 'Failed to update user')
            });
    }

    private createUser(requestBody: any): void {
        this.administrationService
            .createUser('jusour', requestBody)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.users.unshift(response);
                    this.showSuccess('User Created Successfully');
                    this.closeDialog();
                    this.dt?.reset();
                },
                error: (error) => this.handleError(error, 'Failed to create user')
            });
    }

    deleteUser(user: User): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${user.name}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.administrationService
                    .deleteUser('jusour', user.id!)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.users = this.users.filter((u) => u.id !== user.id);
                            this.showSuccess('User Deleted Successfully');
                        },
                        error: (error) => this.handleError(error, 'Failed to delete user')
                    });
            }
        });
    }

    deleteSelectedUsers(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected users?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedUsers.map((user) => this.administrationService.deleteUser('jusour', user.id!).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.users = this.users.filter((user) => !this.selectedUsers.includes(user));
                        this.selectedUsers = [];
                        this.showSuccess('Users Deleted Successfully');
                    })
                    .catch(() => this.showError('Some deletes failed'));
            }
        });
    }

    // Table Methods
    loadUsers(event: any): void {
        this.loading = true;
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.administrationService
            .getAllUsers('jusour', `?page=${page}&per_page=${perPage}`)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loading = false))
            )
            .subscribe({
                next: (response) => {
                    this.users = response.data.user.data;
                    this.totalRecords = response.total;
                    this.currentPage = response.current_page;
                },
                error: (error) => {
                    console.error('Failed to load users:', error);
                    this.showError('Failed to load users');
                }
            });
    }

    exportCSV(): void {
        const originalData = this.dt.value;
        this.dt.exportCSV();
        this.dt.value = originalData;
    }

    onGlobalFilter(table: Table, event: Event): void {
        const input = event.target as HTMLInputElement;
        table.filterGlobal(input.value, 'contains');
    }

    // UI Helpers
    private markFormFieldsAsTouched(): void {
        Object.keys(this.userForm.controls).forEach((key) => {
            this.userForm.get(key)?.markAsTouched();
        });
    }

    private resetState(): void {
        this.submitted = false;
        this.currentUser = {} as User;
        this.resetCombinedPermissions();
    }

    private resetCombinedPermissions(): void {
        this.combinedPermissions.clear();
    }

    private closeDialog(): void {
        this.userDialog = false;
        this.userForm?.reset();
        this.resetCombinedPermissions();
    }

    hideDialog(): void {
        this.closeDialog();
    }

    // Notification Helpers
    private showSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    }

    private showError(message: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 3000
        });
    }

    private extractErrorMessage(error: any): string {
        // Default message
        let message = 'An error occurred';

        if (!error) return message;

        // Check for error.error structure
        if (error.error) {
            // Handle your specific API validation error structure
            if (error.error.errors?.errors) {
                const nestedErrors = error.error.errors.errors;
                const allErrors: string[] = [];

                // Extract all error messages
                Object.values(nestedErrors).forEach((err: any) => {
                    if (Array.isArray(err)) {
                        allErrors.push(...err);
                    } else if (typeof err === 'string') {
                        allErrors.push(err);
                    }
                });

                if (allErrors.length > 0) {
                    return allErrors.join(', ');
                }
            }

            // Handle errors object
            if (error.error.errors) {
                const errorObj = error.error.errors;

                // If it's an object with field-specific errors
                if (typeof errorObj === 'object' && !Array.isArray(errorObj)) {
                    const allErrors = Object.values(errorObj).flat();
                    if (allErrors.length > 0) {
                        return allErrors.join(', ');
                    }
                }

                // If it's a string
                if (typeof errorObj === 'string') {
                    return errorObj;
                }
            }

            // Handle message field
            if (error.error.message) {
                return error.error.message;
            }
        }

        // Handle error with message directly
        if (error.message) {
            return error.message;
        }

        return message;
    }

    private handleError(error: any, defaultMessage: string): void {
        console.error(defaultMessage, error);
        const errorMessage = this.extractErrorMessage(error) || defaultMessage;
        this.showError(errorMessage);
    }
}
