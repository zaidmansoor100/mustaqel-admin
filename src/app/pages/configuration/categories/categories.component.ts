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
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class CategoriesComponent implements OnInit {
    categoryDialog: boolean = false;
    submitted: boolean = false;
    selectedCategories: any[] = [];
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

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    categories: any[] = [];
    category: any = {};
    categoryForm!: FormGroup;

    totalRecords = 0;
    page = 1;
    rows = 10;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private configurationService: ConfigurationService,
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.categories = this.activatedRoute.snapshot.data['categoriesResolver'][0]['data'];
        console.log(this.categories);

        this.exportCSVData();
        this.formBuild();

        // this.loadCategories({ first: 0, rows: this.rows });
    }

    exportCSV() {
        // Flatten any fields for export
        const formatted = this.categories.map((row: any) => ({
            ...row,
            status: row.status === 1 ? 'Active' : 'Inactive'
        }));

        const original = this.dt.value;
        this.dt.value = formatted;
        this.dt.exportCSV();
        this.dt.value = original; // restore original
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
        this.configurationService.getCategories(`?page=${page}&per_page=${perPage}`).subscribe({
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
            status: [category?.status || '', [Validators.required, Validators.maxLength(1)]]
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
                const deleteRequests = this.selectedCategories.map((cat) => this.configurationService.deleteCategory(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
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
            message: 'Are you sure you want to delete ' + category.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteCategory(category.id).subscribe({
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

    saveCategory() {
        this.submitted = true;
        const formValue = this.categoryForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.category.id) {
            // Update existing category
            this.configurationService.updateCategory(this.category.id, obj).subscribe({
                next: (res) => {
                    const index = this.categories.findIndex((c) => c.id === this.category.id);
                    this.categories[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Updated',
                        life: 3000
                    });
                    this.categoryDialog = false;
                    this.category = {};
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
            this.configurationService.createCategory(obj).subscribe({
                next: (res) => {
                    this.categories.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Created',
                        life: 3000
                    });
                    this.categoryDialog = false;
                    this.category = {};
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
        this.categoryDialog = false;
        this.submitted = false;
    }
}
