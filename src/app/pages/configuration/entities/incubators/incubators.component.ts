import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Product, ProductService } from '@/pages/service/product.service';
import { ConfigurationService } from '@/services/configuration.service';
import { ActivatedRoute } from '@angular/router';
import { CustomValidators } from '@/common/validators/custom-validators';
import { MultiSelectModule } from 'primeng/multiselect';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-incubators',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        ReactiveFormsModule,
        MultiSelectModule
    ],
    templateUrl: './incubators.component.html',
    styleUrl: './incubators.component.scss',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class IncubatorsComponent implements OnInit, OnDestroy {
    incubatorDialog: boolean = false;
    submitted: boolean = false;
    selectedIncubators: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    incubators: any[] = [];
    categories: any[] = [];
    incubator: any = {};

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    incubatorForm!: FormGroup;

    totalRecords = 0;
    page = 1;
    rows = 10;

    // Permission flags for UI
    canCreate$ : any;
    canEdit$ : any;
    canDelete$ : any;
    canView$ : any;
    canExport$ : any;

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
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_INCUBATORS);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_INCUBATORS);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_INCUBATORS);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_INCUBATORS);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['incubatorsResolver'];
        this.incubators = resolverData?.[0]?.data || [];
        this.categories = resolverData?.[1]?.data || [];
        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.incubators.map((sub) => ({
            ...sub,
            status: sub.status === 1 ? 'Active' : 'Inactive',
            categoryName: sub.category?.name || ''
        }));

        const original = this.dt.value;
        this.dt.value = formatted;
        this.dt.exportCSV();
        this.dt.value = original;
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Incubator Name (English)' },
            { field: 'nameAr', header: 'Incubator Name (Arabic)' },
            { field: 'categoryName', header: 'Category Name' },
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

    loadIncubators(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getIncubators(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.incubators = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error: any) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load Incubators',
                        life: 3000
                    });
                }
            });
    }

    formBuild(incubator?: any) {
        this.incubatorForm = this.fb.group({
            categoryId: [incubator?.categoryId || '', [Validators.required]],
            name: [incubator?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [incubator?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [incubator?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.incubator = {};
        this.submitted = false;
        this.incubatorDialog = true;
    }

    editIncubator(incubator: any) {
        console.log('Editing incubator:', incubator);
        this.formBuild(incubator);
        this.incubator = { ...incubator };
        this.incubatorDialog = true;
    }

    deleteSelectedIncubators() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected Incubators?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedIncubators.map((cat: any) => this.configurationService.deleteIncubator(cat.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.incubators = this.incubators.filter((val: any) => !this.selectedIncubators.includes(val));
                        this.selectedIncubators = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Incubators Deleted',
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

    deleteIncubator(incubator: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${incubator.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteIncubator(incubator.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.incubators = this.incubators.filter((val: any) => val.id !== incubator.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Incubator Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete incubator';
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

    saveIncubator() {
        this.submitted = true;

        if (this.incubatorForm.invalid) {
            this.markFormFieldsAsTouched();
            return;
        }

        const formValue = this.incubatorForm.value;

        const obj = {
            categoryId: formValue.categoryId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.incubator.id) {
            // Update existing incubator
            this.configurationService
                .updateIncubator(this.incubator.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.incubators.findIndex((c) => c.id === this.incubator.id);
                        if (index !== -1) {
                            this.incubators[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Incubator Updated',
                            life: 3000
                        });
                        this.incubatorDialog = false;
                        this.incubator = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update incubator';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new incubator
            this.configurationService
                .createIncubator(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.incubators.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Incubator Created',
                            life: 3000
                        });
                        this.incubatorDialog = false;
                        this.incubator = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create incubator';
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
        Object.keys(this.incubatorForm.controls).forEach((key) => {
            this.incubatorForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.incubatorDialog = false;
        this.submitted = false;
        this.incubatorForm?.reset();
    }
}
