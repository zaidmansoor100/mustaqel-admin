import { Component, OnInit, signal, ViewChild } from '@angular/core';
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

@Component({
    selector: 'app-incubators',
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
export class IncubatorsComponent implements OnInit {
    incubatorDialog: boolean = false;
    submitted: boolean = false;
    selectedIncubators: any[] = [];
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

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private configurationService: ConfigurationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.incubators = this.activatedRoute.snapshot.data['incubatorsResolver'][0]['data'];
        this.categories = this.activatedRoute.snapshot.data['incubatorsResolver'][1]['data'];
        this.exportCSVData();
        this.formBuild();
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
        this.dt.value = original; // restore original
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'incubator Name (English)' },
            { field: 'nameAr', header: 'incubator Name (Arabic)' },
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
        this.configurationService.getIncubators(`?page=${page}&per_page=${perPage}`).subscribe({
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
            categoryId: [incubator?.categoryId || [], [Validators.required, Validators.maxLength(10), Validators.minLength(1)]],
            name: [incubator?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [incubator?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [incubator?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.incubator = {};
        this.submitted = false;
        this.incubatorDialog = true;
    }

    editIncubator(incubator: any) {
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
                const deleteRequests = this.selectedIncubators.map((cat: any) => this.configurationService.deleteIncubator(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req: any) => req.toPromise()))
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
            message: 'Are you sure you want to delete ' + incubator.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteIncubator(incubator.id).subscribe({
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

    saveIncubator() {
        this.submitted = true;
        const formValue = this.incubatorForm.value;

        const obj = {
            categoryId: formValue.categoryId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.incubator.id) {
            // Update existing incubator
            this.configurationService.updateIncubator(this.incubator.id, obj).subscribe({
                next: (res) => {
                    const index = this.incubators.findIndex((c) => c.id === this.incubator.id);
                    this.incubators[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Incubator Updated',
                        life: 3000
                    });
                    this.incubatorDialog = false;
                    this.incubator = {};
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
            // Create new incubator
            this.configurationService.createIncubator(obj).subscribe({
                next: (res) => {
                    this.incubators.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Incubator Created',
                        life: 3000
                    });
                    this.incubatorDialog = false;
                    this.incubator = {};
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
        this.incubatorDialog = false;
        this.submitted = false;
    }
}
