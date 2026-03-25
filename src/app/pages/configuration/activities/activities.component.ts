import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-activities',
    standalone: true,
    imports: [
        MultiSelectModule,
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
    templateUrl: './activities.component.html',
    styleUrl: './activities.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class ActivitiesComponent implements OnInit, OnDestroy {
    activityDialog: boolean = false;
    submitted: boolean = false;
    selectedActivities: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    activities: any[] = [];
    activity: any = {};
    sectors: any[] = [];
    activityForm!: FormGroup;

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
        private configurationService: ConfigurationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private permissionService: PermissionService
    ) {}

    ngOnInit() {
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_ACTIVITIES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_ACTIVITIES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_ACTIVITIES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_ACTIVITIES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        
        const resolverData = this.activatedRoute.snapshot.data['activitiesResolver'];
        this.activities = resolverData?.[0]?.data || [];
        this.sectors = resolverData?.[1]?.data || [];
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
            { field: 'name', header: 'Activity (English)' },
            { field: 'nameAr', header: 'Activity (Arabic)' },
            { field: 'sectorName', header: 'Sector Name' },
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

    loadActivities(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getActivities(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.activities = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.errors?.message || 'Failed to load activities',
                        life: 3000
                    });
                }
            });
    }

    formBuild(activity?: any) {
        this.activityForm = this.fb.group({
            sectorId: [activity?.sectorId || '', [Validators.required]],
            name: [activity?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [activity?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [activity?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.activity = {};
        this.submitted = false;
        this.activityDialog = true;
    }

    editActivity(activity: any) {
        console.log('Editing activity:', activity);
        this.formBuild(activity);
        this.activity = { ...activity };
        this.activityDialog = true;
    }

    deleteSelectedActivities() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected activities?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedActivities.map((cat) => this.configurationService.deleteActivity(cat.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.activities = this.activities.filter((val) => !this.selectedActivities.includes(val));
                        this.selectedActivities = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Activities Deleted',
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

    deleteActivity(activity: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${activity.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteActivity(activity.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.activities = this.activities.filter((val) => val.id !== activity.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Activity Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.errors?.message || error.message || 'Failed to delete activity';
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

    saveActivity() {
        this.submitted = true;

        if (this.activityForm.invalid) {
            this.markFormFieldsAsTouched();
            return;
        }

        const formValue = this.activityForm.value;

        const obj = {
            sectorId: formValue.sectorId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.activity.id) {
            // Update existing activity
            this.configurationService
                .updateActivity(this.activity.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.activities.findIndex((c) => c.id === this.activity.id);
                        if (index !== -1) {
                            this.activities[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Activity Updated',
                            life: 3000
                        });
                        this.activityDialog = false;
                        this.activity = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.errors?.message || error.message || 'Failed to update activity';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new activity
            this.configurationService
                .createActivity(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        this.activities.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Activity Created',
                            life: 3000
                        });
                        this.activityDialog = false;
                        this.activity = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.errors?.message || error.message || 'Failed to create activity';
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
        Object.keys(this.activityForm.controls).forEach((key) => {
            this.activityForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.activityDialog = false;
        this.submitted = false;
        this.activityForm?.reset();
    }
}
