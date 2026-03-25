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
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-subActivities',
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
    templateUrl: './subActivities.component.html',
    styleUrl: './subActivities.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SubActivitiesComponent implements OnInit, OnDestroy {
    subActivityDialog: boolean = false;
    submitted: boolean = false;
    selectedSubActivities: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    subActivities: any[] = [];
    activities: any[] = [];
    subActivity: any = {};
    subActivityForm!: FormGroup;

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
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_SUB_ACTIVITIES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_SUB_ACTIVITIES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_SUB_ACTIVITIES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_SUB_ACTIVITIES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['subActivitiesResolver'];
        this.subActivities = resolverData?.[0]?.data || [];
        this.activities = resolverData?.[1]?.data || [];

        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.subActivities.map((row: any) => ({
            ...row,
            activityName: row.activity?.name || 'No Activity',
            status: row.status === 1 ? 'Active' : 'Inactive'
        }));

        const original = this.dt.value;
        this.dt.value = formatted;
        this.dt.exportCSV();
        this.dt.value = original;
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Sub Activity (English)' },
            { field: 'nameAr', header: 'Sub Activity (Arabic)' },
            { field: 'activityName', header: 'Activity Name' },
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

    loadSubActivities(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getSubActivities(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.subActivities = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load sub activities',
                        life: 3000
                    });
                }
            });
    }

    formBuild(subActivity?: any) {
        this.subActivityForm = this.fb.group({
            activityId: [subActivity?.activityId || '', [Validators.required]],
            name: [subActivity?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [subActivity?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [subActivity?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.subActivity = {};
        this.submitted = false;
        this.subActivityDialog = true;
    }

    editSubActivity(subActivity: any) {
        console.log('Editing sub activity:', subActivity);
        this.formBuild(subActivity);
        this.subActivity = { ...subActivity };
        this.subActivityDialog = true;
    }

    deleteSelectedSubActivities() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected sub activities?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedSubActivities.map((cat) => this.configurationService.deleteSubActivity(cat.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.subActivities = this.subActivities.filter((val) => !this.selectedSubActivities.includes(val));
                        this.selectedSubActivities = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sub Activities Deleted',
                            life: 3000
                        });
                    })
                    .catch(() => {
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

    deleteSubActivity(subActivity: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${subActivity.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteSubActivity(subActivity.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.subActivities = this.subActivities.filter((val) => val.id !== subActivity.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Sub Activity Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete sub activity';
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

    saveSubActivity() {
        this.submitted = true;

        if (this.subActivityForm.invalid) {
            this.markFormFieldsAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
            return;
        }

        const formValue = this.subActivityForm.value;

        const obj = {
            activityId: formValue.activityId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        console.log('Saving sub activity:', obj);

        if (this.subActivity.id) {
            // Update existing sub activity
            this.configurationService
                .updateSubActivity(this.subActivity.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.subActivities.findIndex((c) => c.id === this.subActivity.id);
                        if (index !== -1) {
                            this.subActivities[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sub Activity Updated',
                            life: 3000
                        });
                        this.subActivityDialog = false;
                        this.subActivity = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update sub activity';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new sub activity
            this.configurationService
                .createSubActivity(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        this.subActivities.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sub Activity Created',
                            life: 3000
                        });
                        this.subActivityDialog = false;
                        this.subActivity = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create sub activity';
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
        Object.keys(this.subActivityForm.controls).forEach((key) => {
            this.subActivityForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.subActivityDialog = false;
        this.submitted = false;
        this.subActivityForm?.reset();
    }
}
