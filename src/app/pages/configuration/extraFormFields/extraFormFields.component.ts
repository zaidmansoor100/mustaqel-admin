import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TextareaModule } from 'primeng/textarea';

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
        ConfirmDialogModule,
        TextareaModule
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
        },
        {
            name: 'xlsx'
        },
        {
            name: 'xlsb'
        },
        {
            name: 'xls'
        },
        {
            name: 'xltx'
        },
        {
            name: 'xlsm'
        },
        {
            name: 'csv'
        }
    ];

    categories: any[] = [];
    sectorsMap: Map<number, any[]> = new Map();
    subCategoriesMap: Map<number, any[]> = new Map();
    activitiesMap: Map<number, any[]> = new Map();
    subActivitiesMap: Map<number, any[]> = new Map();
    entitiesMap: Map<number, any[]> = new Map();
    incubatorsMap: Map<number, any[]> = new Map();

    // Add properties for dynamic meta fields
    dropdownOptions: string[] = []; // For storing dropdown options
    currentFieldType: string = ''; // Track current field type

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    formFields: any[] = [];
    formField: any = {};
    formFieldForm!: FormGroup;

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
        this.formFields = this.activatedRoute.snapshot.data['formFieldsResolver'][0]['data'];
        this.categories = this.activatedRoute.snapshot.data['formFieldsResolver'][1]['data'];
        this.exportCSVData();
    }

    get identificationDataFormArray(): FormArray {
        return this.formFieldForm.get('identificationData') as FormArray;
    }

    // Get category name by slug for key field
    getCategoryKey(slug: string): string {
        const category = this.categories.find((cat) => cat.slug === slug);
        return category ? category.name : slug;
    }

    getSubCategories(index: number): any[] {
        return this.subCategoriesMap.get(index) || [];
    }

    getSectors(index: number): any[] {
        return this.sectorsMap.get(index) || [];
    }

    getActivities(index: number): any[] {
        return this.activitiesMap.get(index) || [];
    }

    getSubActivities(index: number): any[] {
        return this.subActivitiesMap.get(index) || [];
    }

    getEntities(index: number): any[] {
        return this.entitiesMap.get(index) || [];
    }

    getIncubators(index: number): any[] {
        return this.incubatorsMap.get(index) || [];
    }

    // Handle field type change
    onFieldTypeChange(type: string) {
        this.currentFieldType = type;

        // Reset dropdown options when type changes
        if (type !== 'select' && type !== 'radio' && type !== 'checkbox') {
            this.dropdownOptions = [];
        }

        // Clear validators based on type
        const metaFields = this.formFieldForm.get('metaFields') as FormGroup;

        if (type === 'file') {
            metaFields.get('extensions')?.setValidators([Validators.required]);
            metaFields.get('dropdownOptions')?.clearValidators();
        } else if (type === 'select' || type === 'radio' || type === 'checkbox') {
            metaFields.get('extensions')?.clearValidators();
            metaFields.get('dropdownOptions')?.setValidators([Validators.required]);
        } else {
            metaFields.get('extensions')?.clearValidators();
            metaFields.get('dropdownOptions')?.clearValidators();
        }

        metaFields.get('extensions')?.updateValueAndValidity();
        metaFields.get('dropdownOptions')?.updateValueAndValidity();
    }

    // Add dropdown option
    addDropdownOption(option: string) {
        if (option && option.trim()) {
            this.dropdownOptions.push(option.trim());
            this.updateDropdownOptionsInForm();
        }
    }

    // Remove dropdown option
    removeDropdownOption(index: number) {
        this.dropdownOptions.splice(index, 1);
        this.updateDropdownOptionsInForm();
    }

    // Update form control with dropdown options
    updateDropdownOptionsInForm() {
        const metaFields = this.formFieldForm.get('metaFields') as FormGroup;
        metaFields.get('dropdownOptions')?.setValue(this.dropdownOptions);
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
        this.dt.value = original;
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'nameEn', header: 'Field (English)' },
            { field: 'nameAr', header: 'Field (Arabic)' },
            { field: 'type', header: 'Type' },
            { field: 'meta.extensions', header: 'Extensions' },
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

    async onDropDownChange(type: string, value: any, index: number) {
        const idData = this.identificationDataFormArray.at(index);

        if (type === 'categorySlug' && value) {
            // Update key field with category slug
            idData.get('key')?.setValue(value);

            await this.loadSubCategoriesAndSectors(value, index);
        } else if (type === 'sectorSlug' && value) {
            await this.loadActivities(value, index);
        } else if (type === 'activitySlug' && value) {
            await this.loadSubActivitiesAndEntities(value, index);
        }

        // Reset dependent fields
        if (type === 'categorySlug') {
            idData.get('sectorSlug')?.setValue('');
            idData.get('activitySlug')?.setValue('');
            idData.get('subActivitySlug')?.setValue('');
            idData.get('entitySlug')?.setValue('');
            idData.get('incubatorSlug')?.setValue('');
            // this.sectorsMap.set(index, []);
            // this.activitiesMap.set(index, []);
            // this.subActivitiesMap.set(index, []);
            // this.entitiesMap.set(index, []);
            // this.incubatorsMap.set(index, []);
            if (value === 'tal') {
                this.incubatorsMap.set(index, []);
            } else if (value === 'ent') {
                this.entitiesMap.set(index, []);
            }
        } else if (type === 'sectorSlug') {
            idData.get('activitySlug')?.setValue('');
            idData.get('subActivitySlug')?.setValue('');
            idData.get('entitySlug')?.setValue('');
            // this.activitiesMap.set(index, []);
            // this.subActivitiesMap.set(index, []);
            // this.entitiesMap.set(index, []);
        } else if (type === 'activitySlug') {
            idData.get('subActivitySlug')?.setValue('');
            idData.get('entitySlug')?.setValue('');
            // this.subActivitiesMap.set(index, []);
            // this.entitiesMap.set(index, []);
        }
    }

    loadSubCategoriesAndSectors(slug: string, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getSubCateogries_Sectors_Incubator(slug).subscribe({
                next: (res) => {
                    this.subCategoriesMap.set(index, res.data['subCategories'] || []);
                    this.sectorsMap.set(index, res.data['sectors'] || []);
                    console.log(this.sectorsMap);

                    this.incubatorsMap.set(index, res.data['incubator'] || []);

                    this.activitiesMap.set(index, []);
                    this.subActivitiesMap.set(index, []);
                    this.entitiesMap.set(index, []);

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

    loadActivities(slug: string, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getActivitiesOfSectors(slug).subscribe({
                next: (res) => {
                    this.activitiesMap.set(index, res.data || []);
                    this.subActivitiesMap.set(index, []);
                    this.entitiesMap.set(index, []);
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

    loadSubActivitiesAndEntities(slug: string, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getSubActivities_Entities(slug).subscribe({
                next: (res) => {
                    this.subActivitiesMap.set(index, res.data['subActivities'] || []);
                    this.entitiesMap.set(index, res.data['entities'] || []);
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

    formBuild(formField?: any) {
        // Reset dropdown options
        this.dropdownOptions = [];
        this.currentFieldType = '';

        // Initialize maps
        this.subCategoriesMap.clear();
        this.sectorsMap.clear();
        this.activitiesMap.clear();
        this.subActivitiesMap.clear();
        this.entitiesMap.clear();
        this.incubatorsMap.clear();

        // Create identification data array items first
        const idDataItems: FormGroup[] = [];

        if (formField?.formMetas) {
            // Convert single formMetas object to array for the new API
            const identificationData = [
                {
                    key: formField.formMetas.key,
                    onshoreOffShore: formField.formMetas.onshoreOffShore,
                    isRequired: formField.formMetas.isRequired,
                    value: formField.formMetas.value
                }
            ];

            identificationData.forEach((item: any) => {
                idDataItems.push(this.createIdentificationDataGroup(item));
            });
        } else {
            // New mode - add one empty identification data
            idDataItems.push(this.createIdentificationDataGroup());
        }

        // Set current field type for dynamic meta fields
        this.currentFieldType = formField?.type || '';

        // Load dropdown options if they exist in meta
        if (formField?.meta?.dropdownOptions) {
            this.dropdownOptions = formField.meta.dropdownOptions;
        }

        // Create the form with the array
        this.formFieldForm = this.fb.group({
            identificationData: this.fb.array(idDataItems),
            formFields: this.fb.group({
                nameEn: [formField?.nameEn || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(50), Validators.minLength(3)]],
                nameAr: [formField?.nameAr || '', [Validators.required, CustomValidators.arabic(), Validators.maxLength(255), Validators.minLength(3)]],
                type: [formField?.type || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(3)]],
                status: [formField?.status || '', [Validators.required, CustomValidators.numeric(), Validators.maxLength(1)]]
            }),
            metaFields: this.fb.group({
                extensions: [formField?.meta?.extensions || [], []],
                dropdownOptions: [formField?.meta?.dropdownOptions || [], []]
            })
        });

        // Apply validators based on initial field type
        if (this.currentFieldType) {
            this.onFieldTypeChange(this.currentFieldType);
        }
    }

    createIdentificationDataGroup(data?: any): FormGroup {
        return this.fb.group({
            key: [data?.key || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            onshoreOffShore: [data?.onshoreOffShore || 'both', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(3)]],
            isRequired: [data?.isRequired !== undefined ? data.isRequired : true, [Validators.required]],
            categorySlug: [data?.value?.categorySlug || '', [Validators.required, CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            subCategorySlug: [data?.value?.subCategorySlug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            sectorSlug: [data?.value?.sectorSlug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            activitySlug: [data?.value?.activitySlug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            subActivitySlug: [data?.value?.subActivitySlug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            entitySlug: [data?.value?.entitySlug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]],
            incubatorSlug: [data?.value?.incubatorSlug || '', [CustomValidators.alpha(), Validators.maxLength(255), Validators.minLength(2)]]
        });
    }

    addIdentificationData(): void {
        this.identificationDataFormArray.push(this.createIdentificationDataGroup() as unknown as AbstractControl);
    }

    removeIdentificationData(index: number): void {
        this.identificationDataFormArray.removeAt(index);
        this.subCategoriesMap.delete(index);
        this.sectorsMap.delete(index);
        this.activitiesMap.delete(index);
        this.subActivitiesMap.delete(index);
        this.entitiesMap.delete(index);
        this.incubatorsMap.delete(index);

        this.reindexMaps();
    }

    reindexMaps() {
        const newSubCategoriesMap = new Map<number, any[]>();
        const newSectorsMap = new Map<number, any[]>();
        const newActivitiesMap = new Map<number, any[]>();
        const newSubActivitiesMap = new Map<number, any[]>();
        const newEntitiesMap = new Map<number, any[]>();
        const newIncubatorsMap = new Map<number, any[]>();

        this.identificationDataFormArray.controls.forEach((control, index) => {
            newSubCategoriesMap.set(index, this.subCategoriesMap.get(index) || []);
            newSectorsMap.set(index, this.sectorsMap.get(index) || []);
            newActivitiesMap.set(index, this.activitiesMap.get(index) || []);
            newSubActivitiesMap.set(index, this.subActivitiesMap.get(index) || []);
            newEntitiesMap.set(index, this.entitiesMap.get(index) || []);
            newIncubatorsMap.set(index, this.incubatorsMap.get(index) || []);
        });

        this.subCategoriesMap = newSubCategoriesMap;
        this.sectorsMap = newSectorsMap;
        this.activitiesMap = newActivitiesMap;
        this.subActivitiesMap = newSubActivitiesMap;
        this.entitiesMap = newEntitiesMap;
        this.incubatorsMap = newIncubatorsMap;
    }

    openNew() {
        this.subCategoriesMap.clear();
        this.sectorsMap.clear();
        this.activitiesMap.clear();
        this.subActivitiesMap.clear();
        this.entitiesMap.clear();
        this.incubatorsMap.clear();
        this.dropdownOptions = [];
        this.currentFieldType = '';

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

                // Load dependent dropdowns for each identification data
                if (res.formMetas?.value) {
                    const index = 0; // Only one item in array for old data
                    const value = res.formMetas.value;

                    if (value.categorySlug) {
                        // Set key from category slug
                        const idDataArray = this.identificationDataFormArray;
                        if (idDataArray.length > 0) {
                            idDataArray.at(0).get('key')?.setValue(value.categorySlug);
                        }

                        await this.loadSubCategoriesAndSectors(value.categorySlug, index);
                    }
                    if (value.sectorSlug) {
                        await this.loadActivities(value.sectorSlug, index);
                    }
                    if (value.activitySlug) {
                        await this.loadSubActivitiesAndEntities(value.activitySlug, index);
                    }
                }
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
            message: 'Are you sure you want to delete ' + formField.nameEn + '?',
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

        if (this.formFieldForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields',
                life: 3000
            });
            return;
        }

        const formValue = this.formFieldForm.value;
        const fieldType = formValue.formFields.type;

        // Prepare meta fields based on type
        let metaFields: any = {};

        if (fieldType === 'file') {
            metaFields = {
                extensions: formValue.metaFields.extensions
            };
        } else if (fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox') {
            metaFields = {
                dropdownOptions: this.dropdownOptions
            };
        }
        // For text, textarea - no meta fields needed

        // Transform the form value to match the new API structure
        const transformedData = {
            identificationData: formValue.identificationData.map((item: any) => ({
                key: item.key,
                value: {
                    categorySlug: item.categorySlug,
                    subCategorySlug: item.subCategorySlug || '',
                    sectorSlug: item.sectorSlug || '',
                    activitySlug: item.activitySlug || '',
                    subActivitySlug: item.subActivitySlug || '',
                    entitySlug: item.entitySlug || '',
                    incubatorSlug: item.incubatorSlug || ''
                },
                onshoreOffShore: item.onshoreOffShore,
                isRequired: item.isRequired
            })),
            formFields: {
                nameEn: formValue.formFields.nameEn,
                nameAr: formValue.formFields.nameAr,
                type: formValue.formFields.type,
                status: formValue.formFields.status
            },
            metaFields: metaFields
        };

        console.log(transformedData);

        // if (this.formField.id) {
        //     // Update existing Field
        //     this.configurationService.updateFormField(this.formField.id, transformedData).subscribe({
        //         next: (res) => {
        //             const index = this.formFields.findIndex((c) => c.id === this.formField.id);
        //             // Transform response back to old structure for display
        //             if (res.identificationData && res.identificationData.length > 0) {
        //                 res.formMetas = {
        //                     key: res.identificationData[0].key,
        //                     onshoreOffShore: res.identificationData[0].onshoreOffShore,
        //                     isRequired: res.identificationData[0].isRequired,
        //                     value: res.identificationData[0].value
        //                 };
        //             }
        //             // Add meta data
        //             res.meta = metaFields;

        //             this.formFields[index] = res;
        //             this.messageService.add({
        //                 severity: 'success',
        //                 summary: 'Successful',
        //                 detail: 'Field Updated',
        //                 life: 3000
        //             });
        //             this.formFieldDialog = false;
        //             this.formField = {};
        //             this.dropdownOptions = [];
        //             this.currentFieldType = '';
        //         },
        //         error: (error) => {
        //             console.log(error);
        //             this.messageService.add({
        //                 severity: 'error',
        //                 summary: 'Error',
        //                 detail: error.error.message,
        //                 life: 3000
        //             });
        //         }
        //     });
        // } else {
        //     // Create new Field with new structure
        //     this.configurationService.createFormField(transformedData).subscribe({
        //         next: (res) => {
        //             // Transform response back to old structure for display
        //             if (res.identificationData && res.identificationData.length > 0) {
        //                 res.formMetas = {
        //                     key: res.identificationData[0].key,
        //                     onshoreOffShore: res.identificationData[0].onshoreOffShore,
        //                     isRequired: res.identificationData[0].isRequired,
        //                     value: res.identificationData[0].value
        //                 };
        //             }
        //             // Add meta data
        //             res.meta = metaFields;

        //             this.formFields.push(res);
        //             this.messageService.add({
        //                 severity: 'success',
        //                 summary: 'Successful',
        //                 detail: 'Field Created',
        //                 life: 3000
        //             });
        //             this.formFieldDialog = false;
        //             this.formField = {};
        //             this.dropdownOptions = [];
        //             this.currentFieldType = '';
        //         },
        //         error: (error) => {
        //             console.log(error.error.message);
        //             this.messageService.add({
        //                 severity: 'error',
        //                 summary: 'Error',
        //                 detail: error.error.message,
        //                 life: 3000
        //             });
        //         }
        //     });
        // }
    }

    hideDialog() {
        this.formFieldDialog = false;
        this.submitted = false;
        this.dropdownOptions = [];
        this.currentFieldType = '';
    }
}
