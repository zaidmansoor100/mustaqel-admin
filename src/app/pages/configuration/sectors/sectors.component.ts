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
    selector: 'app-sectors',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        SelectModule,
        MultiSelectModule,
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
    templateUrl: './sectors.component.html',
    styleUrl: './sectors.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SectorsComponent implements OnInit, OnDestroy {
    sectorDialog: boolean = false;
    submitted: boolean = false;
    selectedSectors: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    categories: any[] = [];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    sectors: any[] = [];
    sector: any = {};
    sectorForm!: FormGroup;

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
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_SECTORS);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_SECTORS);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_SECTORS);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_SECTORS);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['sectorsResolver'];
        this.sectors = resolverData?.[0]?.data || [];
        this.categories = resolverData?.[1]?.data || [];
        console.log(this.categories);

        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.sectors.map((row: any) => ({
            ...row,
            categories: row.categories?.map((c: any) => c.name).join(', ') || 'No Categories',
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
            { field: 'name', header: 'Sector (English)' },
            { field: 'nameAr', header: 'Sector (Arabic)' },
            { field: 'categories', header: 'Categories Name' },
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

    loadSectors(event: any) {
        console.log(event);

        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getSectors(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.sectors = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load sectors',
                        life: 3000
                    });
                }
            });
    }

    formBuild(sector?: any) {
        // Extract category IDs from the sector's categories
        let categoryIds: number[] = [];
        if (sector?.categories && Array.isArray(sector.categories)) {
            categoryIds = sector.categories.map((category: any) => category.id);
        }

        this.sectorForm = this.fb.group({
            categoryIds: [categoryIds || [], [Validators.required]],
            name: [sector?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [sector?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [sector?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.sector = {};
        this.submitted = false;
        this.sectorDialog = true;
    }

    editSector(sector: any) {
        console.log('Editing sector:', sector);
        this.formBuild(sector);
        this.sector = { ...sector };
        this.sectorDialog = true;
    }

    deleteSelectedSectors() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected sectors?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedSectors.map((sac) => this.configurationService.deleteSector(sac.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.sectors = this.sectors.filter((val) => !this.selectedSectors.includes(val));
                        this.selectedSectors = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sectors Deleted',
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

    deleteSector(sector: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${sector.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteSector(sector.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.sectors = this.sectors.filter((val) => val.id !== sector.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Sector Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete sector';
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

    saveSector() {
        this.submitted = true;

        if (this.sectorForm.invalid) {
            this.markFormFieldsAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
            return;
        }

        const formValue = this.sectorForm.value;

        const obj = {
            categoryIds: formValue.categoryIds,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        console.log('Saving sector:', obj);

        if (this.sector.id) {
            // Update existing sector
            this.configurationService
                .updateSector(this.sector.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        const index = this.sectors.findIndex((c) => c.id === this.sector.id);
                        if (index !== -1) {
                            this.sectors[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sector Updated',
                            life: 3000
                        });
                        this.sectorDialog = false;
                        this.sector = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update sector';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new sector
            this.configurationService
                .createSector(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.sectors.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sector Created',
                            life: 3000
                        });
                        this.sectorDialog = false;
                        this.sector = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create sector';
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
        Object.keys(this.sectorForm.controls).forEach((key) => {
            this.sectorForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.sectorDialog = false;
        this.submitted = false;
        this.sectorForm?.reset();
    }
}
