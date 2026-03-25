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
    selector: 'app-subCategories',
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
        ConfirmDialogModule
        ],
    templateUrl: './subCategories.component.html',
    styleUrl: './subCategories.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SubCategoriesComponent implements OnInit, OnDestroy {
    subCategoryDialog: boolean = false;
    submitted: boolean = false;
    selectedSubCategories: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    categories: any[] = [];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    subCategories: any[] = [];
    subCategory: any = {};
    subCategoryForm!: FormGroup;

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
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_SUB_CATEGORIES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_SUB_CATEGORIES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_SUB_CATEGORIES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_SUB_CATEGORIES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['subCategoriesResolver'];
        this.subCategories = resolverData?.[0]?.data || [];
        this.categories = resolverData?.[1]?.data || [];
        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.subCategories.map((sub) => ({
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
            { field: 'name', header: 'Sub Category (English)' },
            { field: 'nameAr', header: 'Sub Category (Arabic)' },
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

    loadSubCategories(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getSubCategories(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.subCategories = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error: any) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load sub categories',
                        life: 3000
                    });
                }
            });
    }

    formBuild(subCategory?: any) {
        this.subCategoryForm = this.fb.group({
            categoryId: [subCategory?.categoryId || '', [Validators.required]],
            name: [subCategory?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [subCategory?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [subCategory?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.subCategory = {};
        this.submitted = false;
        this.subCategoryDialog = true;
    }

    editSubCategory(subCategory: any) {
        console.log('Editing sub category:', subCategory);
        this.formBuild(subCategory);
        this.subCategory = { ...subCategory };
        this.subCategoryDialog = true;
    }

    deleteSelectedSubCategories() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected sub categories?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedSubCategories.map((cat: any) => this.configurationService.deleteSubCategory(cat.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.subCategories = this.subCategories.filter((val: any) => !this.selectedSubCategories.includes(val));
                        this.selectedSubCategories = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sub Categories Deleted',
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

    deleteSubCategory(category: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${category.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteSubCategory(category.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.subCategories = this.subCategories.filter((val) => val.id !== category.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Sub Category Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete sub category';
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

    saveSubCategory() {
        this.submitted = true;

        if (this.subCategoryForm.invalid) {
            this.markFormFieldsAsTouched();
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
            return;
        }

        const formValue = this.subCategoryForm.value;

        const obj = {
            categoryId: formValue.categoryId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        console.log('Saving sub category:', obj);

        if (this.subCategory.id) {
            // Update existing sub category
            this.configurationService
                .updateSubCategory(this.subCategory.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.subCategories.findIndex((c) => c.id === this.subCategory.id);
                        if (index !== -1) {
                            this.subCategories[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sub Category Updated',
                            life: 3000
                        });
                        this.subCategoryDialog = false;
                        this.subCategory = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update sub category';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new sub category
            this.configurationService
                .createSubCategory(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.subCategories.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Sub Category Created',
                            life: 3000
                        });
                        this.subCategoryDialog = false;
                        this.subCategory = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create sub category';
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
        Object.keys(this.subCategoryForm.controls).forEach((key) => {
            this.subCategoryForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.subCategoryDialog = false;
        this.submitted = false;
        this.subCategoryForm?.reset();
    }
}
