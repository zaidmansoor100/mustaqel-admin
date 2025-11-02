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
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-extraFormFields',
    imports: [
        MultiSelectModule,
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

    templateUrl: './extraFormFields.component.html',
    styleUrl: './extraFormFields.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class ExtraFormFieldsComponent implements OnInit {
    formFieldDialog: boolean = false;
    submitted: boolean = false;
    selectedFormFields: any[] = [];
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

    fieldTypes: any = [
        {
            name: 'file'
        },
        {
            name: 'text'
        },
        {
            name: 'radio'
        },
        {
            name: 'checkbox'
        },
        {
            name: 'textarea'
        },
        {
            name: 'select'
        }
    ];

    onshoreOffShoreType: any = [
        {
            name: 'onshore'
        },
        {
            name: 'offshore'
        },
        {
            name: 'both'
        }
    ];

    idRequired: any = [
        {
            value: 1,
            name: 'Yes'
        },
        {
            value: 0,
            name: 'No'
        }
    ];

    extensions: any = [
        {
            name: 'png'
        },
        {
            name: 'jpg'
        },
        {
            name: 'jpeg'
        },
        {
            name: 'pdf'
        },
        {
            name: 'docx'
        },
        {
            name: 'doc'
        }
    ];

    categories: any[] = [];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    formFields: any[] = [];
    formField: any = {};
    formFieldForm!: FormGroup;

    totalRecords = 0;
    page = 1;
    rows = 10;
    sectors: any = [];
    activities: any = [];
    entities: any = [];
    subActivities: any = [];
    incubators: any = [];
    subCategories: any = [];

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private configurationService: ConfigurationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.formFields = this.activatedRoute.snapshot.data['formFieldsResolver'][0]['data'];
        this.categories = this.activatedRoute.snapshot.data['formFieldsResolver'][1]['data'];
        this.exportCSVData();
        this.formBuild();
    }

    exportCSV() {
        const formatted = this.formFields.map((sub) => ({
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
            { field: 'name', header: 'Field (English)' },
            { field: 'nameAr', header: 'Field (Arabic)' },
            { field: 'classification', header: 'Classification' },
            { field: 'type', header: 'Type' },
            { field: 'onshoreOffShore', header: 'Onshore - Offshore' },
            { field: 'isRequired', header: 'is Required' },
            { field: 'extensions', header: 'Extensions' },
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

    loadFormFields(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getFormFields(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.formFields = res.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error: any) => {
                console.log(error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load Fields',
                    life: 3000
                });
            }
        });
    }

    onDropDownChange(type: string, slug: any) {
        console.log(slug);

        if (type == 'category') {
            this.loadSubCategoriesAndSectors(slug);
        } else if (type == 'sector') {
            this.loadActivities(slug);
        } else if (type == 'activity') {
            this.loadSubActivitiesAndEntities(slug);
        }
    }

    async populateDependentDropdowns() {
        const categorySlug = this.formField?.formMetas?.category?.slug;
        const sectorSlug = this.formField?.formMetas?.sector?.slug;
        const activitySlug = this.formField?.formMetas?.activity?.slug;

        if (categorySlug) {
            // 1️⃣ Load subcategories & sectors
            await this.loadSubCategoriesAndSectors(categorySlug);
        }

        if (sectorSlug) {
            // 2️⃣ Load activities of that sector
            await this.loadActivities(sectorSlug);
        }

        if (activitySlug) {
            // 3️⃣ Load subactivities & entities
            await this.loadSubActivitiesAndEntities(activitySlug);
        }
    }

    loadSubCategoriesAndSectors(slug: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getSubCateogries_Sectors_Incubator(slug).subscribe({
                next: (res) => {
                    this.identificationDataPopulation(res);
                    resolve();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error.message,
                        life: 3000
                    });
                    reject(err);
                }
            });
        });
    }

    loadActivities(slug: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getActivitiesOfSectors(slug).subscribe({
                next: (res) => {
                    this.activities = res.data;
                    resolve();

                    this.subActivities = [];
                    this.entities = [];
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error.message,
                        life: 3000
                    });
                    reject(err);
                }
            });
        });
    }

    loadSubActivitiesAndEntities(slug: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getSubActivities_Entities(slug).subscribe({
                next: (res) => {
                    this.subActivities = res.data['subActivities'];
                    this.entities = res.data['entities'];
                    resolve();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err.error.message,
                        life: 3000
                    });
                    reject(err);
                }
            });
        });
    }

    identificationDataPopulation(res: any) {
        this.sectors = res.data['sectors'];
        this.incubators = res.data['incubator'];
        this.subCategories = res.data['subCategories'];
        this.activities = [];
        this.subActivities = [];
        this.entities = [];

        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: res.message,
            life: 3000
        });
    }

    formBuild(formField?: any) {
        this.formFieldForm = this.fb.group({
            identificationData: this.fb.group({
                category: [formField?.formMetas?.category?.slug || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
                subCategory: [formField?.formMetas?.subCategory?.slug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
                sector: [formField?.formMetas?.sector?.slug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
                activity: [formField?.formMetas?.activity?.slug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
                subActivity: [formField?.formMetas?.subActivity?.slug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
                entity: [formField?.formMetas?.entity?.slug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
                incubator: [formField?.formMetas?.incubator?.slug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]]
            }),
            formFields: this.fb.group({
                nameEn: [formField?.nameEn || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(50), Validators.minLength(3)]],
                nameAr: [formField?.nameAr || '', [Validators.required, CustomValidators.arabic(), Validators.maxLength(255), Validators.minLength(3)]],
                type: [formField?.type || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(3)]],
                onshoreOffShore: [formField?.onshoreOffShore || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(3)]],
                isRequired: [formField?.isRequired || '', [Validators.required]],
                status: [formField?.status || '', [Validators.required, CustomValidators.numeric(), Validators.maxLength(1)]]
            }),
            metaFields: this.fb.group({
                extensions: [formField?.meta?.extensions || [], [Validators.required, Validators.maxLength(255), Validators.minLength(2)]]
            })
        });
    }

    openNew() {
        this.subCategories = [];
        this.sectors = [];
        this.activities = [];
        this.subActivities = [];
        this.entities = [];
        this.incubators = [];
        this.formBuild();
        this.formField = {};
        this.submitted = false;
        this.formFieldDialog = true;
    }

    async editFormField(formField: any) {
        await this.getSingleFormField(formField.id);
    }

    async getSingleFormField(id: number) {
        this.configurationService.getFormFieldId(id).subscribe({
            next: async (res: any) => {
                this.formField = res;
                
                this.formFieldDialog = true;
                this.formBuild(this.formField);
                
                await this.populateDependentDropdowns();
            },
            error: (error: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error.message,
                    life: 3000
                });
            }
        });
    }

    deleteSelectedFormFields() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected Fields?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedFormFields.map((cat: any) => this.configurationService.deleteFormField(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req: any) => req.toPromise()))
                    .then(() => {
                        this.formFields = this.formFields.filter((val: any) => !this.selectedFormFields.includes(val));
                        this.selectedFormFields = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Fields Deleted',
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

    deleteFormField(formField: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + formField.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteFormField(formField.id).subscribe({
                    next: () => {
                        this.formFields = this.formFields.filter((val) => val.id !== formField.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Field Deleted',
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

    saveFormField() {
        this.submitted = true;
        const formValue = this.formFieldForm.value;


        if (this.formField.id) {
            // Update existing Field
            this.configurationService.updateFormField(this.formField.id, formValue).subscribe({
                next: (res) => {
                    const index = this.formFields.findIndex((c) => c.id === this.formField.id);
                    this.formFields[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Field Updated',
                        life: 3000
                    });
                    this.formFieldDialog = false;
                    this.formField = {};
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
            // Create new Field
            this.configurationService.createFormField(formValue).subscribe({
                next: (res) => {
                    this.formFields.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Field Created',
                        life: 3000
                    });
                    this.formFieldDialog = false;
                    this.formField = {};
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
        this.formFieldDialog = false;
        this.submitted = false;
    }
}
