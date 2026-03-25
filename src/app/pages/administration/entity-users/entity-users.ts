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
import { ConfigurationService } from '@/services/configuration.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';

// Custom validator for password match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
    }
    return null;
};

interface EntityUser {
    id?: number;
    name: string;
    nameArabic?: string;
    email: string;
    status: 'active' | 'inactive';
    levels?: UserLevel[];
    entities?: EntityAssignment[];
    incubators?: string[];
    metaData?: {
        meta?: {
            entities?: EntityAssignment[];
            incubators?: string[];
        };
    };
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

interface EntityAssignment {
    slug: string;
    activities: ActivityAssignment[];
}

interface ActivityAssignment {
    slug: string;
    subActivities: string[];
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

interface EntityOption {
    id: number;
    name: string;
    nameAr: string;
    slug: string;
    activities: ActivityOption[];
}

interface ActivityOption {
    id: number;
    name: string;
    nameAr: string;
    slug: string;
    subActivities: SubActivityOption[];
}

interface SubActivityOption {
    id: number;
    name: string;
    nameAr: string;
    slug: string;
}

interface IncubatorOption {
    id: number;
    name: string;
    nameAr: string;
    slug: string;
    category?: any;
}

@Component({
    selector: 'app-entity-users',
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
        MultiSelectModule,
        PermissionDirective
    ],
    templateUrl: './entity-users.html',
    styleUrl: './entity-users.scss',
    providers: [MessageService, ConfirmationService]
})
export class EntityUsers implements OnInit, OnDestroy {
    // Dialog state
    userDialog: boolean = false;
    submitted: boolean = false;

    // Data
    users: EntityUser[] = [];
    selectedUsers: EntityUser[] = [];
    roles: Role[] = [];
    currentUser: EntityUser = {} as EntityUser;

    // Form
    userForm!: FormGroup;

    // Permissions
    private combinedPermissions: Set<string> = new Set();
    
    // Permission flags for UI
    canCreate$: any;
    canEdit$: any;
    canDelete$: any;
    canView$: any;
    canExport$: any;

    // Make Permission enum available in template
    Permission = Permission;

    // Options
    statusOptions: StatusOption[] = [
        { value: 'active', name: 'Active' },
        { value: 'inactive', name: 'Inactive' }
    ];

    // Dynamic Data for Identification
    entityOptions: EntityOption[] = [];
    incubatorOptions: IncubatorOption[] = [];
    allActivities: ActivityOption[] = [];
    allSubActivities: SubActivityOption[] = [];

    // Loading states
    loadingEntities: boolean = false;
    loadingIncubators: boolean = false;
    loadingActivities: boolean = false;

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
        private configurationService: ConfigurationService,
        private administrationService: AdministrationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private permissionService: PermissionService
    ) {}

    ngOnInit(): void {
        this.initializePermissions();
        this.initializeData();
        this.loadRoles();
        this.loadEntities();
        this.loadIncubators();
        this.loadAllActivities();
        this.loadAllSubActivities();
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

    get entitiesArray(): FormArray {
        return this.userForm.get('entities') as FormArray;
    }

    get incubatorsArray(): FormArray {
        return this.userForm.get('incubators') as FormArray;
    }

    // Initialization Methods
    private initializePermissions(): void {
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_ENTITY_USERS);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_ENTITY_USERS);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_ENTITY_USERS);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_ENTITY_USERS);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
    }

    private initializeData(): void {
        const usersData = this.activatedRoute.snapshot.data['users'];
        this.users = usersData?.[0]?.data?.user?.data || [];
        console.log('Initialized entity users:', this.users);
        this.formBuild();
    }

    private initializeTableColumns(): void {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Name (English)' },
            { field: 'nameArabic', header: 'Name (Arabic)' },
            { field: 'email', header: 'Email' },
            { field: 'entities_count', header: 'Entities' },
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
            .getRoleByType('entity')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.roles = response.data?.role || response;
                    console.log('Roles loaded for entity:', this.roles);
                },
                error: (error) => {
                    console.error('Failed to load roles:', error);
                    this.showError('Failed to load roles');
                }
            });
    }

    private loadRolePermissions(roleId: number): void {
        console.log('Loading permissions for role ID:', roleId);

        const role = this.roles.find((r) => r.id === roleId);
        console.log('Role being loaded:', role);

        this.administrationService
            .getPermissionByRoleId(roleId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log('Full permission response for role ID', roleId, ':', response);
                    const permissions = this.extractPermissionsFromResponse(response);
                    console.log('Extracted permissions for role', role?.name, ':', permissions);
                    permissions.forEach((perm) => this.combinedPermissions.add(perm));
                    this.updateFormPermissions();
                },
                error: (error) => {
                    console.error('Failed to load role permissions:', error);
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
        const permissions = Array.from(this.combinedPermissions);
        console.log('Updating form permissions:', permissions);
        this.userForm?.patchValue({
            permissions: permissions
        });
    }

    private recalculatePermissions(): void {
        this.combinedPermissions.clear();

        this.levelsArray?.controls.forEach((control) => {
            const roleName = control.get('role')?.value;
            if (roleName) {
                const selectedRole = this.roles.find((r) => r.name === roleName);
                if (selectedRole) {
                    this.loadRolePermissions(selectedRole.id);
                }
            }
        });
    }

    // Load Entities
    private loadEntities(): void {
        this.loadingEntities = true;
        this.configurationService
            .getEntities('?page=1')
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingEntities = false))
            )
            .subscribe({
                next: (response) => {
                    const entities = response.data || response;
                    this.entityOptions = Array.isArray(entities)
                        ? entities.map((entity: any) => ({
                              id: entity.id,
                              name: entity.name,
                              nameAr: entity.nameAr,
                              slug: entity.slug,
                              activities: entity.activities || []
                          }))
                        : [];
                    console.log('Entities loaded:', this.entityOptions);
                },
                error: (error) => {
                    console.error('Failed to load entities:', error);
                    this.showError('Failed to load entities');
                }
            });
    }

    // Load Incubators
    private loadIncubators(): void {
        this.loadingIncubators = true;
        this.configurationService
            .getIncubators('?page=1')
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingIncubators = false))
            )
            .subscribe({
                next: (response) => {
                    const incubators = response.data || response;
                    this.incubatorOptions = Array.isArray(incubators)
                        ? incubators.map((incubator: any) => ({
                              id: incubator.id,
                              name: incubator.name,
                              nameAr: incubator.nameAr,
                              slug: incubator.slug,
                              category: incubator.category
                          }))
                        : [];
                    console.log('Incubators loaded:', this.incubatorOptions);
                },
                error: (error) => {
                    console.error('Failed to load incubators:', error);
                    this.showError('Failed to load incubators');
                }
            });
    }

    // Load All Activities
    private loadAllActivities(): void {
        this.loadingActivities = true;
        this.configurationService
            .getActivities('?page=1')
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingActivities = false))
            )
            .subscribe({
                next: (response) => {
                    const activities = response.data || response;
                    this.allActivities = Array.isArray(activities)
                        ? activities.map((activity: any) => ({
                              id: activity.id,
                              name: activity.name,
                              nameAr: activity.nameAr,
                              slug: activity.slug,
                              subActivities: activity.subActivities || []
                          }))
                        : [];
                    console.log('All activities loaded:', this.allActivities);
                },
                error: (error) => {
                    console.error('Failed to load activities:', error);
                }
            });
    }

    // Load All Sub Activities
    private loadAllSubActivities(): void {
        this.configurationService
            .getSubActivities('?page=1')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const subActivities = response.data || response;
                    this.allSubActivities = Array.isArray(subActivities)
                        ? subActivities.map((sub: any) => ({
                              id: sub.id,
                              name: sub.name,
                              nameAr: sub.nameAr,
                              slug: sub.slug
                          }))
                        : [];
                    console.log('All sub-activities loaded:', this.allSubActivities);
                },
                error: (error) => {
                    console.error('Failed to load sub-activities:', error);
                }
            });
    }

    // Get activities for a specific entity
    getActivitiesForEntity(entitySlug: string): ActivityOption[] {
        const entity = this.entityOptions.find((e) => e.slug === entitySlug);
        return entity?.activities || [];
    }

    // Get sub-activities for a specific activity
    getSubActivitiesForActivity(activitySlug: string): SubActivityOption[] {
        const activity = this.allActivities.find((a) => a.slug === activitySlug);
        return activity?.subActivities || [];
    }

    // Form Methods
    formBuild(user?: EntityUser): void {
        this.resetCombinedPermissions();

        const existingLevels = this.extractExistingLevels(user);
        const existingEntities = this.extractExistingEntities(user);
        const existingIncubators = user?.incubators || user?.metaData?.meta?.incubators || [];

        this.userForm = this.fb.group(
            {
                name: [user?.name || '', this.getNameValidators()],
                nameArabic: [user?.nameArabic || '', this.getArabicNameValidators()],
                email: [user?.email || '', [Validators.required, Validators.email]],
                status: [user?.status || 'active', [Validators.required]],
                password: ['', this.getPasswordValidators(user)],
                confirmPassword: ['', this.getConfirmPasswordValidators(user)],
                levels: this.fb.array([]),
                entities: this.fb.array([]),
                incubators: this.fb.array([]),
                permissions: [[]]
            },
            { validators: user?.id ? [] : [passwordMatchValidator] }
        );

        this.populateLevels(existingLevels);
        this.populateEntities(existingEntities);

        // Populate incubators
        if (existingIncubators.length > 0) {
            existingIncubators.forEach((incubator) => {
                this.incubatorsArray.push(this.fb.control(incubator, Validators.required));
            });
        } else {
            this.addIncubator();
        }

        // Load permissions for existing roles (important for edit mode)
        if (existingLevels.length > 0) {
            existingLevels.forEach((level) => {
                if (level.role) {
                    const selectedRole = this.roles.find((r) => r.name === level.role);
                    if (selectedRole) {
                        this.loadRolePermissions(selectedRole.id);
                    }
                }
            });
        }
    }

    private getNameValidators(): any[] {
        return [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()];
    }

    private getArabicNameValidators(): any[] {
        return [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()];
    }

    private getPasswordValidators(user?: EntityUser): any[] {
        return user?.id ? [] : [Validators.required, Validators.minLength(8)];
    }

    private getConfirmPasswordValidators(user?: EntityUser): any[] {
        return user?.id ? [] : [Validators.required];
    }

    private extractExistingLevels(user?: EntityUser): UserLevel[] {
        if (!user?.levels || !Array.isArray(user.levels)) {
            return [];
        }

        return user.levels.map((level: any) => ({
            name: level.name,
            position: level.level || level.position,
            role: level.role?.name || level.role
        }));
    }

    private extractExistingEntities(user?: EntityUser): EntityAssignment[] {
        if (!user?.metaData?.meta?.entities) {
            return [];
        }

        const entitiesData = user.metaData.meta.entities;

        return entitiesData.map((entity: any) => ({
            slug: entity.slug,
            activities: entity.activities.map((activity: any) => ({
                slug: activity.slug,
                subActivities: activity.subActivities || []
            }))
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

    private populateEntities(entities: EntityAssignment[]): void {
        if (entities.length > 0) {
            entities.forEach((entity) => {
                this.addEntityWithData(entity);
            });
        } else {
            this.addEntity();
        }
    }

    // Level Management
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
        console.log('Role changed to:', roleName);
        const selectedRole = this.roles.find((r) => r.name === roleName);
        console.log('Selected role object:', selectedRole);

        if (selectedRole) {
            const levelGroup = this.levelsArray.at(levelIndex);
            levelGroup.get('position')?.setValue(1);
            this.loadRolePermissions(selectedRole.id);
        } else {
            console.warn('Role not found:', roleName);
        }
    }

    // Entity Management
    addEntity(): void {
        const entityGroup = this.fb.group({
            slug: ['', Validators.required],
            activities: this.fb.array([])
        });

        this.entitiesArray.push(entityGroup);
    }

    addEntityWithData(entity: EntityAssignment): void {
        const activitiesArray = this.fb.array(
            entity.activities.map((activity) =>
                this.fb.group({
                    slug: [activity.slug, Validators.required],
                    subActivities: [activity.subActivities || []]
                })
            )
        );

        const entityGroup = this.fb.group({
            slug: [entity.slug, Validators.required],
            activities: activitiesArray
        });

        this.entitiesArray.push(entityGroup);
    }

    removeEntity(index: number): void {
        this.entitiesArray.removeAt(index);
    }

    getActivitiesArray(entityIndex: number): FormArray {
        const entityGroup = this.entitiesArray.at(entityIndex);
        return entityGroup.get('activities') as FormArray;
    }

    addActivity(entityIndex: number): void {
        const activitiesArray = this.getActivitiesArray(entityIndex);
        const activityGroup = this.fb.group({
            slug: ['', Validators.required],
            subActivities: [[]]
        });
        activitiesArray.push(activityGroup);
    }

    removeActivity(entityIndex: number, activityIndex: number): void {
        const activitiesArray = this.getActivitiesArray(entityIndex);
        activitiesArray.removeAt(activityIndex);
    }

    // Get available activities for the selected entity
    getAvailableActivities(entityIndex: number): ActivityOption[] {
        const entityGroup = this.entitiesArray.at(entityIndex);
        const entitySlug = entityGroup.get('slug')?.value;
        return this.getActivitiesForEntity(entitySlug);
    }

    // Get available sub-activities for the selected activity
    getAvailableSubActivities(activitySlug: string): SubActivityOption[] {
        return this.getSubActivitiesForActivity(activitySlug);
    }

    // Incubator Management
    addIncubator(): void {
        this.incubatorsArray.push(this.fb.control('', Validators.required));
    }

    removeIncubator(index: number): void {
        this.incubatorsArray.removeAt(index);
    }

    // CRUD Operations
    openNew(): void {
        this.resetState();
        this.formBuild();
        this.userDialog = true;
    }

    editUser(user: EntityUser): void {
        console.log('Editing entity user:', user);
        console.log('Entities from metaData:', user.metaData?.meta?.entities);
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
            identificationData: {
                entities: formValue.entities.map((entity: any) => ({
                    slug: entity.slug,
                    activities: entity.activities.map((activity: any) => ({
                        slug: activity.slug,
                        subActivities: activity.subActivities || []
                    }))
                })),
                incubators: formValue.incubators
            },
            permissions: formValue.permissions || []
        };

        if (!this.currentUser.id) {
            requestBody.personalInfo.password = formValue.password;
            requestBody.personalInfo.confirmPassword = formValue.confirmPassword;
        }

        console.log('Request Body being sent:', JSON.stringify(requestBody, null, 2));
        console.log('Permissions being sent:', formValue.permissions);

        return requestBody;
    }

    private updateUser(requestBody: any): void {
        this.administrationService
            .updateUser('entity', this.currentUser.id!, requestBody)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const index = this.users.findIndex((u) => u.id === this.currentUser.id);
                    if (index !== -1) {
                        this.users[index] = { ...this.users[index], ...response.data.user };
                    }
                    this.showSuccess('User Updated Successfully');
                    this.closeDialog();
                },
                error: (error) => this.handleError(error, 'Failed to update user')
            });
    }

    private createUser(requestBody: any): void {
        this.administrationService
            .createUser('entity', requestBody)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.users.unshift(response.data.user);
                    this.showSuccess('User Created Successfully');
                    this.closeDialog();
                    this.dt?.reset();
                },
                error: (error) => this.handleError(error, 'Failed to create user')
            });
    }

    deleteUser(user: EntityUser): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${user.name}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.administrationService
                    .deleteUser('entity', user.id!)
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
        if (!this.selectedUsers?.length) return;

        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${this.selectedUsers.length} selected user(s)?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedUsers.map((user) => 
                    this.administrationService.deleteUser('entity', user.id!).toPromise()
                );

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
            .getAllUsers('entity', `?page=${page}&per_page=${perPage}`)
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
        this.currentUser = {} as EntityUser;
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
        let message = 'An error occurred';

        if (!error) return message;

        if (error.error) {
            if (error.error.errors?.errors) {
                const nestedErrors = error.error.errors.errors;
                const allErrors: string[] = [];

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

            if (error.error.errors) {
                const errorObj = error.error.errors;
                if (typeof errorObj === 'object' && !Array.isArray(errorObj)) {
                    const allErrors = Object.values(errorObj).flat();
                    if (allErrors.length > 0) {
                        return allErrors.join(', ');
                    }
                }
                if (typeof errorObj === 'string') {
                    return errorObj;
                }
            }

            if (error.error.message) {
                return error.error.message;
            }
        }

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