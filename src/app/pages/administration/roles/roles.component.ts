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
  selector: 'app-roles',
  standalone: true,
    imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],

  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class RolesComponent  implements OnInit {
    roleDialog: boolean = false;
    submitted: boolean = false;
    selectedRoles: any[] = [];
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
    roles: any[] = [];
    role: any = {};
    roleForm!: FormGroup;

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
        this.roles = this.activatedRoute.snapshot.data['roles'][0]['data']['role']['data'];
        console.log(this.roles);

        this.exportCSVData();
        this.formBuild();

        // this.loadCategories({ first: 0, rows: this.rows });
    }

    exportCSV() {
        // Flatten any fields for export
        const formatted = this.roles.map((row: any) => ({
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
        this.administrationService.getAllRoles(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.roles = res.data.role.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error: any) => {
                console.log(error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load roles',
                    life: 3000
                });
            }
        });
    }

    formBuild(role?: any) {
        this.roleForm = this.fb.group({
            name: [role?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [role?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [role?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.role = {};
        this.submitted = false;
        this.roleDialog = true;
    }

    editRole(role: any) {
        console.log(role);

        this.formBuild(role);
        this.role = { ...role };
        this.roleDialog = true;
    }

    deleteSelectedRoles() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected roles?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedRoles.map((cat) => this.administrationService.deleteRole(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
                    .then(() => {
                        this.roles = this.roles.filter((val) => !this.selectedRoles.includes(val));
                        this.selectedRoles = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Roles Deleted',
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

    deleteRole(role: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + role.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.administrationService.deleteRole(role.id).subscribe({
                    next: () => {
                        this.roles = this.roles.filter((val) => val.id !== role.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Role Deleted',
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

    saveRole() {
        this.submitted = true;
        const formValue = this.roleForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.role.id) {
            // Update existing role
            this.administrationService.updateRole(this.role.id, obj).subscribe({
                next: (res) => {
                    const index = this.roles.findIndex((c) => c.id === this.role.id);
                    this.roles[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Role Updated',
                        life: 3000
                    });
                    this.roleDialog = false;
                    this.role = {};
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
            // Create new role
            this.administrationService.createRole(obj).subscribe({
                next: (res) => {
                    this.roles.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Role Created',
                        life: 3000
                    });
                    this.roleDialog = false;
                    this.role = {};
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
        this.roleDialog = false;
        this.submitted = false;
    }
}
