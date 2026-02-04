import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ConfigurationService } from '@/services/configuration.service';
import { SelectModule } from 'primeng/select';
import { CustomValidators } from '@/common/validators/custom-validators';
import { HttpClient } from '@angular/common/http';
import { AdministrationService } from '@/services/administration.service';

@Component({
    selector: 'app-applicant-users',
    standalone: true,
    imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],

    templateUrl: './applicant-users.html',
    styleUrl: './applicant-users.scss',
    providers: [MessageService, ConfirmationService]
})
export class ApplicantUsers implements OnInit {
    userDialog: boolean = false;
    submitted: boolean = false;
    selectedUsers: any[] = [];
    status: any = [
        {
            id: 1,
            name: 'Active'
        },
        {
            id: 0,
            name: 'Inactive'
        }
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

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private administrationService: AdministrationService,
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.users = this.activatedRoute.snapshot.data['users'][0]['data']['user']['data'];
        console.log(this.users);

        this.exportCSVData();
        this.formBuild();

        // this.loadCategories({ first: 0, rows: this.rows });
    }

    exportCSV() {
        // Flatten any fields for export
        const formatted = this.users.map((row: any) => ({
            ...row,
            status: row.status === 1 ? 'Active' : 'Inactive'
        }));

        const original = this.dt.value;
        this.dt.value = formatted;
        this.dt.exportCSV();
        this.dt.value = original; // restore original
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Category (English)' },
            { field: 'nameAr', header: 'Category (Arabic)' },
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
        this.administrationService.getAllUsers('applicant', `?page=${page}&per_page=${perPage}`).subscribe({
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
            name: [user?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [user?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [user?.status || '', [Validators.required, Validators.maxLength(1)]]
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
                const deleteRequests = this.selectedUsers.map((cat) => this.administrationService.deleteUser('jusour', cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
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
            message: 'Are you sure you want to delete ' + user.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.administrationService.deleteUser('jusour', user.id).subscribe({
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
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error.message,
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    saveUser() {
        this.submitted = true;
        const formValue = this.userForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.user.id) {
            // Update existing user
            this.administrationService.updateUser('jusour', this.user.id, obj).subscribe({
                next: (res) => {
                    const index = this.users.findIndex((c) => c.id === this.user.id);
                    this.users[index] = res;
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
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message,
                        life: 3000
                    });
                }
            });
        } else {
            // Create new user
            this.administrationService.createUser('jusour', obj).subscribe({
                next: (res) => {
                    this.users.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Created',
                        life: 3000
                    });
                    this.userDialog = false;
                    this.user = {};
                },
                error: (error) => {
                    console.log(error.error.message);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message,
                        life: 3000
                    });
                }
            });
        }
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }
}
