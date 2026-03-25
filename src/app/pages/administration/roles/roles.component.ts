import { Component, OnInit, ViewChild } from '@angular/core';
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
        AccordionModule // Add AccordionModule here
    ],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class RolesComponent implements OnInit {
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
        { name: 'Entities', value: 'entities' },
        { name: 'MOCI', value: 'moci' },
        { name: 'MOL', value: 'mol' },
        { name: 'VFS', value: 'vfs' },
        { name: 'Haya', value: 'haya' }
    ];

    groupedPermissions: any[] = [];
    allPermissionsFlat: string[] = [];
    rolePermissions: string[] = [];

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

        this.loadAllPermissions();
        this.exportCSVData();
        this.formBuild();
    }

    loadAllPermissions() {
        this.administrationService.getAllPermissions().subscribe({
            next: (res) => {
                // Handle the nested permissions structure
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
        this.administrationService.getPermissionByRoleId(roleId).subscribe({
            next: (res) => {
                // Extract permission names from the response
                let permissions: string[] = [];

                // Handle different response structures
                if (res.data?.permissions) {
                    permissions = res.data.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
                } else if (Array.isArray(res)) {
                    permissions = res.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
                } else if (res.permissions) {
                    permissions = res.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
                }

                this.rolePermissions = permissions;

                // Update the form with the role's permissions
                this.roleForm.patchValue({ permissions: this.rolePermissions });

                // IMPORTANT: Update group selected states after permissions are loaded
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

    // Add this method to update group selected states
    updateGroupSelectedStates() {
        const currentPermissions = this.roleForm?.get('permissions')?.value || [];

        this.groupedPermissions.forEach((group) => {
            const groupPermissionNames = group.permissions.map((p: any) => p.name);
            const allSelected = groupPermissionNames.every((p: string) => currentPermissions.includes(p));
            const someSelected = groupPermissionNames.some((p: string) => currentPermissions.includes(p));

            // Update the group.selected property
            group.selected = allSelected;

            // Optional: Add a partially selected state for better UX
            group.partiallySelected = someSelected && !allSelected;
        });
    }

    groupPermissions(permissionsData: any) {
        // Transform the grouped permissions from API into a format suitable for UI
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
                partiallySelected: false // Add this property
            });

            // Add to flat list for easy checking
            this.allPermissionsFlat.push(...permissions);
        });

        // Sort groups alphabetically
        this.groupedPermissions.sort((a, b) => a.groupName.localeCompare(b.groupName));

        console.log('Grouped permissions:', this.groupedPermissions);
    }

    formatGroupName(groupKey: string): string {
        // Convert "talent-applications" to "Talent Applications"
        // Convert "admin-users" to "Admin Users"
        // Convert "quality-checks" to "Quality Checks"
        return groupKey
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatPermissionName(permission: string): string {
        // Convert "view-talent-applications" to "View Talent Applications"
        // Convert "create-admin-users" to "Create Admin Users"
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

    // Helper method to check if all permissions in a group are selected
    isGroupFullySelected(group: any): boolean {
        const currentPermissions = this.roleForm?.get('permissions')?.value || [];
        return group.permissions.every((p: any) => currentPermissions.includes(p.name));
    }

    // Helper method to check if some permissions in a group are selected
    isGroupPartiallySelected(group: any): boolean {
        const currentPermissions = this.roleForm?.get('permissions')?.value || [];
        const selectedCount = group.permissions.filter((p: any) => currentPermissions.includes(p.name)).length;
        return selectedCount > 0 && selectedCount < group.permissions.length;
    }

    // Toggle all permissions in a group
    // Toggle all permissions in a group
    toggleGroup(group: any, checked: boolean) {
        const permissionsControl = this.roleForm.get('permissions');
        const currentPermissions = permissionsControl?.value || [];
        const groupPermissions = group.permissions.map((p: any) => p.name);

        if (checked) {
            // Add all permissions from this group (remove duplicates)
            const newPermissions = [...new Set([...currentPermissions, ...groupPermissions])];
            permissionsControl?.setValue(newPermissions);
            group.selected = true;
            group.partiallySelected = false;
        } else {
            // Remove all permissions from this group
            const newPermissions = currentPermissions.filter((p: string) => !groupPermissions.includes(p));
            permissionsControl?.setValue(newPermissions);
            group.selected = false;
            group.partiallySelected = false;
        }

        // Mark as touched/dirty to trigger validation if needed
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
        // Reset group states first
        this.resetGroupStates();

        // Extract permission names from the permissions array if it exists
        let permissionNames: string[] = [];
        if (role?.permissions && Array.isArray(role.permissions)) {
            // Check if permissions are objects with 'name' property or just strings
            permissionNames = role.permissions.map((perm: any) => (typeof perm === 'string' ? perm : perm.name));
        }

        this.roleForm = this.fb.group({
            name: [role?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            type: [role?.type || 'jusour', [Validators.required]],
            approvalLevels: [role?.approvalLevels || role?.approval_levels || 1, [Validators.required, Validators.min(1), Validators.max(10)]],
            permissions: [permissionNames]
        });

        // Update group selected states if we have permissions
        if (permissionNames.length > 0) {
            setTimeout(() => {
                this.updateGroupSelectedStates();
            });
        }

        // If editing and we have role id, load permissions (but only if not already loaded)
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
        this.resetGroupStates(); // Reset group checkbox states
        this.formBuild();
        this.role = {};
        this.submitted = false;
        this.roleDialog = true;
    }

    editRole(role: any) {
        console.log('Editing role:', role);

        // Reset permissions
        this.rolePermissions = [];

        // Build form with role data (this will extract permission names)
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
            // Mark all fields as touched to show validation errors
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
            permissions: formValue.permissions || [] // This should already be array of strings
        };

        console.log('Saving role with data:', obj);

        if (this.role.id) {
            // Update existing role
            this.administrationService.updateRole(this.role.id, obj).subscribe({
                next: (res) => {
                    const index = this.roles.findIndex((c) => c.id === this.role.id);
                    if (index !== -1) {
                        this.roles[index] = { ...this.roles[index], ...res };
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Role Updated Successfully',
                        life: 3000
                    });
                    this.roleDialog = false;
                    this.role = {};

                    // Refresh the table if needed
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
            // Create new role
            this.administrationService.createRole(obj).subscribe({
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

                    // Refresh the table data
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
        this.resetGroupStates(); // Reset group checkbox states when closing
    }

    // Helper method to get permission count
    getTotalPermissionsCount(): number {
        return this.allPermissionsFlat.length;
    }
}
