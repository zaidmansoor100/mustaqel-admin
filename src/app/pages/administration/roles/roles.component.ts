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
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';
import { CustomValidators } from '@/common/validators/custom-validators';
import { HttpClient } from '@angular/common/http';
import { AdministrationService } from '@/services/administration.service';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';
import { PermissionSyncService } from '@/services/permission-sync.service';

@Component({
    selector: 'app-roles',
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
        CheckboxModule,
        AccordionModule,
        PermissionDirective
    ],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class RolesComponent implements OnInit, OnDestroy {
    roleDialog: boolean = false;
    submitted: boolean = false;
    selectedRoles: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    roleTypes: any = [
        { name: 'Jusour', value: 'jusour' },
        { name: 'Applicant', value: 'system' },
        { name: 'Entities', value: 'entity' },
        { name: 'MOCI', value: 'moci' },
        { name: 'MOL', value: 'mol' },
        { name: 'VFS', value: 'vfs' },
        { name: 'Haya', value: 'haya' }
    ];

    groupedPermissions: any[] = [];
    allPermissionsFlat: string[] = [];
    rolePermissions: string[] = [];

    // Permission flags for UI
    canCreate$: any;
    canEdit$: any;
    canDelete$: any;
    canView$: any;
    canExport$: any;

    // Make Permission enum available in template
    Permission = Permission;

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    roles: any[] = [];
    role: any = {};
    roleForm!: FormGroup;

    totalRecords = 0;
    page = 1;
    rows = 10;

    private destroy$ = new Subject<void>();

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private administrationService: AdministrationService,
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private fb: FormBuilder,
        private permissionService: PermissionService,
        private permissionSyncService: PermissionSyncService,
    ) {}

    ngOnInit() {
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_ROLES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_ROLES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_ROLES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_ROLES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);

        const rolesData = this.activatedRoute.snapshot.data['roles'];
        this.roles = rolesData?.[0]?.data?.role?.data || [];
        console.log(this.roles);

        this.loadAllPermissions();
        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadAllPermissions() {
        this.administrationService.getAllPermissions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const permissionsData = res.data?.permissions || res;
                    this.groupPermissions(permissionsData);
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load permissions',
                        life: 3000
                    });
                }
            });
    }

    loadRolePermissions(roleId: number) {
        this.administrationService.getPermissionByRoleId(roleId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    let permissions: string[] = [];

                    if (res.data?.permissions) {
                        permissions = res.data.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
                    } else if (Array.isArray(res)) {
                        permissions = res.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
                    } else if (res.permissions) {
                        permissions = res.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
                    }

                    this.rolePermissions = permissions;
                    this.roleForm.patchValue({ permissions: this.rolePermissions });

                    setTimeout(() => {
                        this.updateGroupSelectedStates();
                    });
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load role permissions',
                        life: 3000
                    });
                }
            });
    }

    updateGroupSelectedStates() {
        const currentPermissions = this.roleForm?.get('permissions')?.value || [];

        this.groupedPermissions.forEach((group) => {
            const groupPermissionNames = group.permissions.map((p: any) => p.name);
            const allSelected = groupPermissionNames.every((p: string) => currentPermissions.includes(p));
            const someSelected = groupPermissionNames.some((p: string) => currentPermissions.includes(p));

            group.selected = allSelected;
            group.partiallySelected = someSelected && !allSelected;
        });
    }

    groupPermissions(permissionsData: any) {
        this.groupedPermissions = [];
        this.allPermissionsFlat = [];

        Object.keys(permissionsData).forEach((groupKey) => {
            const permissions = permissionsData[groupKey];
            const groupName = this.formatGroupName(groupKey);

            const formattedPermissions = permissions.map((permission: string) => ({
                name: permission,
                label: this.formatPermissionName(permission),
                value: permission
            }));

            this.groupedPermissions.push({
                groupName: groupName,
                groupKey: groupKey,
                permissions: formattedPermissions,
                selected: false,
                partiallySelected: false
            });

            this.allPermissionsFlat.push(...permissions);
        });

        this.groupedPermissions.sort((a, b) => a.groupName.localeCompare(b.groupName));
        console.log('Grouped permissions:', this.groupedPermissions);
    }

    formatGroupName(groupKey: string): string {
        return groupKey
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatPermissionName(permission: string): string {
        const parts = permission.split('-');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }

        const action = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const module = parts.slice(1).join('-');
        const formattedModule = module
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return `${action} ${formattedModule}`;
    }

    toggleGroup(group: any, checked: boolean) {
        const permissionsControl = this.roleForm.get('permissions');
        const currentPermissions = permissionsControl?.value || [];
        const groupPermissions = group.permissions.map((p: any) => p.name);

        if (checked) {
            const newPermissions = [...new Set([...currentPermissions, ...groupPermissions])];
            permissionsControl?.setValue(newPermissions);
            group.selected = true;
            group.partiallySelected = false;
        } else {
            const newPermissions = currentPermissions.filter((p: string) => !groupPermissions.includes(p));
            permissionsControl?.setValue(newPermissions);
            group.selected = false;
            group.partiallySelected = false;
        }

        permissionsControl?.markAsTouched();
        permissionsControl?.markAsDirty();
    }

    refreshGroupStates() {
        this.updateGroupSelectedStates();
    }

    exportCSV() {
        const original = this.dt.value;
        this.dt.exportCSV();
        this.dt.value = original;
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Role Name' },
            { field: 'guard_name', header: 'Guard Name' },
            { field: 'type', header: 'Role Type' },
            { field: 'approval_levels', header: 'Approval Levels' },
            { field: 'created_at', header: 'Created At' },
            { field: 'updated_at', header: 'Updated At' }
        ];

        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field
        }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    loadRoles(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.administrationService.getAllRoles(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
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
        this.resetGroupStates();

        let permissionNames: string[] = [];
        if (role?.permissions && Array.isArray(role.permissions)) {
            permissionNames = role.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
        }

        this.roleForm = this.fb.group({
            name: [role?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            type: [role?.type || 'jusour', [Validators.required]],
            approvalLevels: [role?.approvalLevels || role?.approval_levels || 1, [Validators.required, Validators.min(1), Validators.max(10)]],
            permissions: [permissionNames]
        });

        if (permissionNames.length > 0) {
            setTimeout(() => {
                this.updateGroupSelectedStates();
            });
        }

        if (role?.id && (!permissionNames.length || permissionNames.length === 0)) {
            this.loadRolePermissions(role.id);
        }
    }

    resetGroupStates() {
        this.groupedPermissions.forEach((group) => {
            group.selected = false;
            group.partiallySelected = false;
        });
    }

    openNew() {
        this.resetGroupStates();
        this.formBuild();
        this.role = {};
        this.submitted = false;
        this.roleDialog = true;
    }

    editRole(role: any) {
        console.log('Editing role:', role);
        this.rolePermissions = [];
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
                const deleteRequests = this.selectedRoles.map((cat) => 
                    this.administrationService.deleteRole(cat.id).toPromise()
                );

                Promise.all(deleteRequests)
                    .then(() => {
                        this.roles = this.roles.filter((val) => !this.selectedRoles.includes(val));
                        this.selectedRoles = [];
                        this.permissionSyncService.triggerManualRefresh();
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
                this.administrationService.deleteRole(role.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.roles = this.roles.filter((val) => val.id !== role.id);
                            this.permissionSyncService.triggerManualRefresh();
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
                                detail: error.error?.message || 'Failed to delete role',
                                life: 3000
                            });
                        }
                    });
            }
        });
    }

    saveRole() {
        this.submitted = true;

        if (this.roleForm.invalid) {
            Object.keys(this.roleForm.controls).forEach((key) => {
                this.roleForm.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.roleForm.value;

        const obj = {
            name: formValue.name,
            type: formValue.type,
            approvalLevels: formValue.approvalLevels,
            permissions: formValue.permissions || []
        };

        console.log('Saving role with data:', obj);

        if (this.role.id) {
            this.administrationService.updateRole(this.role.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.roles.findIndex((c) => c.id === this.role.id);
                        if (index !== -1) {
                            this.roles[index] = { ...this.roles[index], ...res };
                        }
                        this.permissionSyncService.triggerManualRefresh();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Role Updated Successfully',
                            life: 3000
                        });
                        this.roleDialog = false;
                        this.role = {};

                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error?.message || 'Failed to update role',
                            life: 3000
                        });
                    }
                });
        } else {
            this.administrationService.createRole(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.roles.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Role Created Successfully',
                            life: 3000
                        });
                        this.roleDialog = false;
                        this.role = {};

                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error.error);
                        let errorMessage = 'Failed to create role';
                        if (error.error?.message) {
                            errorMessage = error.error.message;
                        } else if (error.error?.errors) {
                            errorMessage = Object.values(error.error.errors).join(', ');
                        }
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

    hideDialog() {
        this.roleDialog = false;
        this.submitted = false;
        this.roleForm.reset();
        this.resetGroupStates();
    }

    getTotalPermissionsCount(): number {
        return this.allPermissionsFlat.length;
    }
}