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
    selector: 'app-stages',
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
    templateUrl: './stages.component.html',
    styleUrl: './stages.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class StagesComponent implements OnInit, OnDestroy {
    stageDialog: boolean = false;
    submitted: boolean = false;
    selectedStages: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    stages: any[] = [];
    stage: any = {};
    stageForm!: FormGroup;

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
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_STAGES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_STAGES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_STAGES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_STAGES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['stagesResolver'];
        this.stages = resolverData?.[0]?.data || [];
        console.log(this.stages);

        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.stages.map((row: any) => ({
            ...row,
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
            { field: 'name', header: 'Stage (English)' },
            { field: 'nameAr', header: 'Stage (Arabic)' },
            { field: 'order', header: 'Order' },
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
            .getAllStages(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.stages = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load stages',
                        life: 3000
                    });
                }
            });
    }

    formBuild(stage?: any) {
        this.stageForm = this.fb.group({
            name: [stage?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [stage?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            order: [stage?.order || 1, [Validators.required, Validators.min(1)]],
            status: [stage?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.stage = {};
        this.submitted = false;
        this.stageDialog = true;
    }

    editStage(stage: any) {
        console.log('Editing stage:', stage);
        this.formBuild(stage);
        this.stage = { ...stage };
        this.stageDialog = true;
    }

    deleteSelectedStages() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected stages?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedStages.map((sac) => this.configurationService.deleteStage(sac.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.stages = this.stages.filter((val) => !this.selectedStages.includes(val));
                        this.selectedStages = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Stages Deleted',
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

    deleteStage(stage: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${stage.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteStage(stage.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.stages = this.stages.filter((val) => val.id !== stage.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Stage Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete stage';
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

        if (this.stageForm.invalid) {
            this.markFormFieldsAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
            return;
        }

        const formValue = this.stageForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            order: formValue.order,
            status: formValue.status
        };

        console.log('Saving stage:', obj);

        if (this.stage.id) {
            // Update existing stage
            this.configurationService
                .updateStage(this.stage.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        const index = this.stages.findIndex((c) => c.id === this.stage.id);
                        if (index !== -1) {
                            this.stages[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Stage Updated',
                            life: 3000
                        });
                        this.stageDialog = false;
                        this.stage = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update stage';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new stage
            this.configurationService
                .createStage(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.stages.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Stage Created',
                            life: 3000
                        });
                        this.stageDialog = false;
                        this.stage = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create stage';
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
        Object.keys(this.stageForm.controls).forEach((key) => {
            this.stageForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.stageDialog = false;
        this.submitted = false;
        this.stageForm?.reset();
    }
}
