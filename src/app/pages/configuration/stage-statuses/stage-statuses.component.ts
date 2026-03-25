import { CustomValidators } from '@/common/validators/custom-validators';
import { ConfigurationService } from '@/services/configuration.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-stage-statuses',
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
    templateUrl: './stage-statuses.component.html',
    styleUrl: './stage-statuses.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class StageStatusesComponent implements OnInit, OnDestroy {
    stageStatusDialog: boolean = false;
    submitted: boolean = false;
    selectedStageStatuses: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    stageStatuses: any[] = [];
    stages: any[] = [];
    stageStatus: any = {};
    stageStatusForm!: FormGroup;

    totalRecords = 0;
    page = 1;
    rows = 10;

    // Permission flags for UI
    canCreate$ : any;
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
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_STAGE_STATUSES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_STAGE_STATUSES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_STAGE_STATUSES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_STAGE_STATUSES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['stageStatusesResolver'];
        this.stageStatuses = resolverData?.[0]?.data || [];
        this.stages = resolverData?.[1]?.data || [];
        console.log(this.stageStatuses);

        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.stageStatuses.map((row: any) => ({
            ...row,
            stageName: row.stage?.name || 'No Stage',
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
            { field: 'name', header: 'Stage Status (English)' },
            { field: 'nameAr', header: 'Stage Status (Arabic)' },
            { field: 'stageName', header: 'Stage Name' },
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

    loadStages(event: any) {
        console.log(event);

        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getAllStageStatuses(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.stageStatuses = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load stage statuses',
                        life: 3000
                    });
                }
            });
    }

    formBuild(stageStatus?: any) {
        this.stageStatusForm = this.fb.group({
            stageId: [stageStatus?.stageId || '', [Validators.required]],
            name: [stageStatus?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [stageStatus?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [stageStatus?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.stageStatus = {};
        this.submitted = false;
        this.stageStatusDialog = true;
    }

    editStage(stageStatus: any) {
        console.log('Editing stage status:', stageStatus);
        this.formBuild(stageStatus);
        this.stageStatus = { ...stageStatus };
        this.stageStatusDialog = true;
    }

    deleteSelectedStages() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected stage statuses?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedStageStatuses.map((sac) => this.configurationService.deleteStageStatuses(sac.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.stageStatuses = this.stageStatuses.filter((val) => !this.selectedStageStatuses.includes(val));
                        this.selectedStageStatuses = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Stage Statuses Deleted',
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

    deleteStage(stageStatus: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${stageStatus.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteStageStatuses(stageStatus.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.stageStatuses = this.stageStatuses.filter((val) => val.id !== stageStatus.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Stage Status Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete stage status';
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

    saveStage() {
        this.submitted = true;

        if (this.stageStatusForm.invalid) {
            this.markFormFieldsAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
            return;
        }

        const formValue = this.stageStatusForm.value;

        const obj = {
            stageId: formValue.stageId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        console.log('Saving stage status:', obj);

        if (this.stageStatus.id) {
            // Update existing stage status
            this.configurationService
                .updateStageStatuses(this.stageStatus.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        const index = this.stageStatuses.findIndex((c) => c.id === this.stageStatus.id);
                        if (index !== -1) {
                            this.stageStatuses[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Stage Status Updated',
                            life: 3000
                        });
                        this.stageStatusDialog = false;
                        this.stageStatus = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update stage status';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new stage status
            this.configurationService
                .createStageStatuses(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.stageStatuses.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Stage Status Created',
                            life: 3000
                        });
                        this.stageStatusDialog = false;
                        this.stageStatus = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create stage status';
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
        Object.keys(this.stageStatusForm.controls).forEach((key) => {
            this.stageStatusForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.stageStatusDialog = false;
        this.submitted = false;
        this.stageStatusForm?.reset();
    }
}
