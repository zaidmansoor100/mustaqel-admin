import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
    selector: 'app-subCategories',
    imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],

    templateUrl: './subCategories.component.html',
    styleUrl: './subCategories.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SubCategoriesComponent implements OnInit {
    subCategoryDialog: boolean = false;
    submitted: boolean = false;
    selectedSubCategories: any[] = [];
    status: any = [
        {
            id: 1,
            name: 'Active'
        },
        {
            id: 0,
            name: 'Inactive'
        }
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

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private configurationService: ConfigurationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.subCategories = this.activatedRoute.snapshot.data['subCategoriesResolver'][0]['data'];
        this.categories = this.activatedRoute.snapshot.data['subCategoriesResolver'][1]['data'];
        this.exportCSVData();
        this.formBuild();
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
        this.dt.value = original; // restore original
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

    loadCategories(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getSubCategories(`?page=${page}&per_page=${perPage}`).subscribe({
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
                    detail: 'Failed to load categories',
                    life: 3000
                });
            }
        });
    }

    formBuild(subCategory?: any) {
        this.subCategoryForm = this.fb.group({
            categoryId: [subCategory?.categoryId || '', [Validators.required, Validators.maxLength(10), Validators.minLength(1)]],
            name: [subCategory?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [subCategory?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [subCategory?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.subCategory = {};
        this.submitted = false;
        this.subCategoryDialog = true;
    }

    editSubCategory(subCategory: any) {
        this.formBuild(subCategory);
        this.subCategory = { ...subCategory };
        this.subCategoryDialog = true;
    }

    deleteSelectedSubCategories() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected Sub categories?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedSubCategories.map((cat: any) => this.configurationService.deleteSubCategory(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req: any) => req.toPromise()))
                    .then(() => {
                        this.subCategories = this.subCategories.filter((val: any) => !this.selectedSubCategories.includes(val));
                        this.selectedSubCategories = [];
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

    deleteSubCategory(category: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + category.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteSubCategory(category.id).subscribe({
                    next: () => {
                        this.subCategories = this.subCategories.filter((val) => val.id !== category.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Category Deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error.message,
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    saveSubCategory() {
        this.submitted = true;
        const formValue = this.subCategoryForm.value;

        const obj = {
            categoryId: formValue.categoryId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.subCategory.id) {
            // Update existing category
            this.configurationService.updateSubCategory(this.subCategory.id, obj).subscribe({
                next: (res) => {
                    const index = this.subCategories.findIndex((c) => c.id === this.subCategory.id);
                    this.subCategories[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Updated',
                        life: 3000
                    });
                    this.subCategoryDialog = false;
                    this.subCategory = {};
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message,
                        life: 3000
                    });
                }
            });
        } else {
            // Create new category
            this.configurationService.createSubCategory(obj).subscribe({
                next: (res) => {
                    this.subCategories.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Created',
                        life: 3000
                    });
                    this.subCategoryDialog = false;
                    this.subCategory = {};
                },
                error: (error) => {
                    console.log(error.error.message);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message,
                        life: 3000
                    });
                }
            });
        }
    }

    hideDialog() {
        this.subCategoryDialog = false;
        this.submitted = false;
    }
}
