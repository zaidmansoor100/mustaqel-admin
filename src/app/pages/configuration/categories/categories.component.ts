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
import { HttpClient } from '@angular/common/http';
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-categories',
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
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class CategoriesComponent implements OnInit, OnDestroy {
    categoryDialog: boolean = false;
    submitted: boolean = false;
    selectedCategories: any[] = [];

    status: any = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    categories: any[] = [];
    category: any = {};
    categoryForm!: FormGroup;

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
        private http: HttpClient,
        private fb: FormBuilder,
        private permissionService: PermissionService
    ) {}

    ngOnInit() {
        this.canCreate$ = this.permissionService.hasPermission(Permission.CREATE_CATEGORIES);
        this.canEdit$ = this.permissionService.hasPermission(Permission.EDIT_CATEGORIES);
        this.canDelete$ = this.permissionService.hasPermission(Permission.DELETE_CATEGORIES);
        this.canView$ = this.permissionService.hasPermission(Permission.VIEW_CATEGORIES);
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        const resolverData = this.activatedRoute.snapshot.data['categoriesResolver'];
        this.categories = resolverData?.[0]?.data || [];
        console.log(this.categories);

        this.exportCSVData();
        this.formBuild();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    exportCSV() {
        const formatted = this.categories.map((row: any) => ({
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
            { field: 'name', header: 'Category (English)' },
            { field: 'nameAr', header: 'Category (Arabic)' },
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

    loadCategories(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.configurationService
            .getCategories(`?page=${page}&per_page=${perPage}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.categories = res.data;
                    this.totalRecords = res.total;
                    this.page = res.current_page;
                },
                error: (error: any) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load categories',
                        life: 3000
                    });
                }
            });
    }

    formBuild(category?: any) {
        this.categoryForm = this.fb.group({
            name: [category?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [category?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [category?.status || 1, [Validators.required]]
        });
    }

    openNew() {
        this.formBuild();
        this.category = {};
        this.submitted = false;
        this.categoryDialog = true;
    }

    editCategory(category: any) {
        console.log(category);
        this.formBuild(category);
        this.category = { ...category };
        this.categoryDialog = true;
    }

    deleteSelectedCategories() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected categories?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedCategories.map((cat) => this.configurationService.deleteCategory(cat.id).toPromise());

                Promise.all(deleteRequests)
                    .then(() => {
                        this.categories = this.categories.filter((val) => !this.selectedCategories.includes(val));
                        this.selectedCategories = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Categories Deleted',
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

    deleteCategory(category: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${category.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService
                    .deleteCategory(category.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.categories = this.categories.filter((val) => val.id !== category.id);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Category Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.log(error);
                            const errorMessage = error.error?.message || error.message || 'Failed to delete category';
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

    saveCategory() {
        this.submitted = true;

        if (this.categoryForm.invalid) {
            this.markFormFieldsAsTouched();
            return;
        }

        const formValue = this.categoryForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.category.id) {
            // Update existing category
            this.configurationService
                .updateCategory(this.category.id, obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        const index = this.categories.findIndex((c) => c.id === this.category.id);
                        if (index !== -1) {
                            this.categories[index] = res;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Category Updated',
                            life: 3000
                        });
                        this.categoryDialog = false;
                        this.category = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to update category';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: errorMessage,
                            life: 3000
                        });
                    }
                });
        } else {
            // Create new category
            this.configurationService
                .createCategory(obj)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.categories.unshift(res);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Category Created',
                            life: 3000
                        });
                        this.categoryDialog = false;
                        this.category = {};
                        if (this.dt) {
                            this.dt.reset();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                        const errorMessage = error.error?.message || error.message || 'Failed to create category';
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
        Object.keys(this.categoryForm.controls).forEach((key) => {
            this.categoryForm.get(key)?.markAsTouched();
        });
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
        this.categoryForm?.reset();
    }
}
