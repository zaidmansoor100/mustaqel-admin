import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { CustomValidators } from '@/common/validators/custom-validators';
import { AdministrationService } from '@/services/administration.service';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-applicant-users',
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
        PermissionDirective
    ],
    templateUrl: './applicant-users.html',
    styleUrl: './applicant-users.scss',
    providers: [MessageService, ConfirmationService]
})
export class ApplicantUsers implements OnInit, OnDestroy {
    userDialog: boolean = false;
    submitted: boolean = false;
    selectedUsers: any[] = [];
    
    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    users: any[] = [];
    user: any = {};
    userForm!: FormGroup;

    totalRecords = 0;
    page = 1;
    rows = 10;

    // Permission flags for UI
    canCreate$: any;
    canEdit$: any;
    canDelete$: any;
    canView$: any;
    canExport$: any;

    // Make Permission enum available in template
    Permission = Permission;

    private destroy$ = new Subject<void>();

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private administrationService: AdministrationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private permissionService: PermissionService
    ) {
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_APPLICANT_USERS);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_APPLICANT_USERS);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_APPLICANT_USERS);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_APPLICANT_USERS);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
    }

    ngOnInit() {
        const routeData = this.activatedRoute.snapshot.data['users'];
        this.users = routeData?.[0]?.data?.user?.data || [];
        console.log('Initialized users:', this.users);

        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const original = this.dt.value;
        this.dt.exportCSV();
        this.dt.value = original;
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Applicant Name (English)' },
            { field: 'nameAr', header: 'Applicant Name (Arabic)' },
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    loadUsers(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        
        this.administrationService.getAllUsers('applicant', `?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.users = res.data.user.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error: any) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load users',
                        life: 3000
                    });
                }
            });
    }

    formBuild(user?: any) {
        this.userForm = this.fb.group({
            name: [
                user?.name || '', 
                [
                    Validators.required, 
                    Validators.maxLength(50), 
                    Validators.minLength(3), 
                    CustomValidators.alpha()
                ]
            ],
            nameAr: [
                user?.nameAr || '', 
                [
                    Validators.required, 
                    Validators.maxLength(255), 
                    Validators.minLength(3), 
                    CustomValidators.arabic()
                ]
            ],
            status: [user?.status || '', [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    editUser(user: any) {
        console.log(user);
        this.formBuild(user);
        this.user = { ...user };
        this.userDialog = true;
    }

    deleteSelectedUsers() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected users?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedUsers.map((cat) => 
                    this.administrationService.deleteUser('applicant', cat.id).toPromise()
                );

                Promise.all(deleteRequests)
                    .then(() => {
                        this.users = this.users.filter((val) => !this.selectedUsers.includes(val));
                        this.selectedUsers = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Users Deleted',
                            life: 3000
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Some deletes failed',
                            life: 3000
                        });
                    });
            }
        });
    }

    deleteUser(user: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${user.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.administrationService.deleteUser('applicant', user.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.users = this.users.filter((val) => val.id !== user.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'User Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || 'Failed to delete user';
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: errorMessage,
                                life: 3000
                            });
                        }
                    });
            }
        });
    }

    saveUser() {
        this.submitted = true;
        
        if (this.userForm.invalid) {
            this.markFormFieldsAsTouched();
            return;
        }

        const formValue = this.userForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.user.id) {
            // Update existing user
            this.administrationService.updateUser('applicant', this.user.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.users.findIndex((c) => c.id === this.user.id);
                        if (index !== -1) {
                            this.users[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'User Updated',
                            life: 3000
                        });
                        this.userDialog = false;
                        this.user = {};
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || 'Failed to update user';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new user
            this.administrationService.createUser('applicant', obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.users.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'User Created',
                            life: 3000
                        });
                        this.userDialog = false;
                        this.user = {};
                        this.dt?.reset();
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || 'Failed to create user';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        }
    }

    private markFormFieldsAsTouched(): void {
        Object.keys(this.userForm.controls).forEach((key) => {
            this.userForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
        this.userForm?.reset();
    }
}