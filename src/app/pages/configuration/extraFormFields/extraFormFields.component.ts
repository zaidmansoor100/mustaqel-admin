// extraFormFields.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// PrimeNG Imports
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Validators
import { ConfigurationService } from '@/services/configuration.service';
import { CustomValidators } from '@/common/validators/custom-validators';

@Component({
    selector: 'app-extraFormFields',
    imports: [
        // Angular Modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        
        // PrimeNG Modules
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
        TagModule,
        SelectModule,
        MultiSelectModule,
        TextareaModule,
        InputNumberModule,
        CheckboxModule,
        DividerModule,
        AccordionModule,
        TabsModule,
        TooltipModule
    ],
    templateUrl: './extraFormFields.component.html',
    styleUrl: './extraFormFields.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class ExtraFormFieldsComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    // Dialog State
    formFieldDialog: boolean = false;
    submitted: boolean = false;
    selectedFormFields: any[] = [];
    
    // Form
    formFieldForm: FormGroup;
    formField: any = {};

    // Data Lists
    formFields: any[] = [];
    categories: any[] = [];
    groups: any[] = [];

    // Dropdown Options
    status = [
        { id: 1, name: 'Active' },
        { id: 0, name: 'Inactive' }
    ];

    fieldTypes = [
        { name: 'text', label: 'Text Input', group: 'Basic' },
        { name: 'textarea', label: 'Text Area', group: 'Basic' },
        { name: 'email', label: 'Email', group: 'Basic' },
        { name: 'number', label: 'Number', group: 'Basic' },
        { name: 'date', label: 'Date Picker', group: 'Basic' },
        { name: 'select', label: 'Dropdown Select', group: 'Choice' },
        { name: 'radio', label: 'Radio Buttons', group: 'Choice' },
        { name: 'checkbox', label: 'Checkboxes', group: 'Choice' },
        { name: 'file', label: 'File Upload', group: 'Special' },
        { name: 'group', label: 'Group (Repeatable)', group: 'Special' }
    ];

    sections = [
        { value: 'personal-info', label: 'Personal Information' },
        { value: 'employment-education', label: 'Employment & Education' },
        { value: 'residency-travel', label: 'Residency, Travel & Family' },
        { value: 'documents', label: 'Document Upload' }
    ];

    groupOptions = [
        // Personal Information Section Groups
        { value: 'identification-data', label: 'Identification Data', section: 'personal-info' },
        { value: 'applicant-info', label: 'Applicant Information', section: 'personal-info' },
        { value: 'contact-info', label: 'Contact Information', section: 'personal-info' },
        { value: 'passport-details', label: 'Passport Details', section: 'personal-info' },

        // Employment & Education Section Groups
        { value: 'employment-details', label: 'Employment Details', section: 'employment-education' },
        { value: 'previous-jobs', label: 'Previous Jobs', section: 'employment-education' },
        { value: 'education', label: 'Education', section: 'employment-education' },

        // Residency, Travel & Family Section Groups
        { value: 'residences', label: 'Residences', section: 'residency-travel' },
        { value: 'other-nationalities', label: 'Other Nationalities', section: 'residency-travel' },
        { value: 'countries-visited', label: 'Countries Visited', section: 'residency-travel' },
        { value: 'family-members', label: 'Family Members', section: 'residency-travel' },

        // Documents Section Groups
        { value: 'required-documents', label: 'Required Documents', section: 'documents' },

        // General/Custom Groups
        { value: 'general', label: 'General', section: 'general' },
        { value: 'custom', label: 'Custom (Enter below)', section: 'custom' }
    ];

    gridColumns = [
        { value: 1, label: '1 Column' },
        { value: 2, label: '2 Columns' },
        { value: 3, label: '3 Columns' },
        { value: 4, label: '4 Columns' },
        { value: 6, label: '6 Columns' },
        { value: 12, label: '12 Columns (Full Width)' }
    ];

    onshoreOffShoreType = [
        { name: 'onshore', label: 'Onshore' },
        { name: 'offshore', label: 'Offshore' },
        { name: 'both', label: 'Both' }
    ];

    idRequired = [
        { value: true, name: 'Yes' },
        { value: false, name: 'No' }
    ];

    extensions = [
        { name: 'png' }, { name: 'jpg' }, { name: 'jpeg' }, { name: 'pdf' },
        { name: 'docx' }, { name: 'doc' }, { name: 'xlsx' }, { name: 'xlsb' },
        { name: 'xls' }, { name: 'xltx' }, { name: 'xlsm' }, { name: 'csv' }
    ];

    operators = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Not Contains' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'in', label: 'In' },
        { value: 'not_in', label: 'Not In' },
        { value: 'checked', label: 'Checked' },
        { value: 'not_checked', label: 'Not Checked' },
        { value: 'empty', label: 'Empty' },
        { value: 'not_empty', label: 'Not Empty' }
    ];

    conditionActions = [
        { value: 'show', label: 'Show' },
        { value: 'hide', label: 'Hide' },
        { value: 'enable', label: 'Enable' },
        { value: 'disable', label: 'Disable' },
        { value: 'require', label: 'Require' }
    ];

    // Dynamic Data Maps
    sectorsMap: Map<number, any[]> = new Map();
    subCategoriesMap: Map<number, any[]> = new Map();
    activitiesMap: Map<number, any[]> = new Map();
    subActivitiesMap: Map<number, any[]> = new Map();
    entitiesMap: Map<number, any[]> = new Map();
    incubatorsMap: Map<number, any[]> = new Map();

    // Dynamic Field Data
    dropdownOptions: { labelEn: string; labelAr: string; value: string }[] = [];
    groupFields: any[] = [];
    currentFieldType: string = '';
    customGroupName: string = '';

    // Table Properties
    exportColumns: any[] = [];
    cols: any[] = [];
    totalRecords = 0;
    page = 1;
    rows = 10;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private configurationService: ConfigurationService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder
    ) {
        this.formFieldForm = this.createEmptyForm();
    }

    ngOnInit() {
        this.loadResolverData();
        this.exportCSVData();
    }

    // ==================== Initialization ====================

    private loadResolverData() {
        const resolverData = this.activatedRoute.snapshot.data['formFieldsResolver'];
        if (!resolverData?.length) return;

        const [fieldsData, categoriesData, groupsData] = resolverData;
        
        this.formFields = fieldsData?.data?.data || fieldsData?.data || [];
        this.categories = categoriesData?.data || [];
        this.groups = groupsData?.data || [];
    }

    // ==================== Form Creation ====================

    private createEmptyForm(): FormGroup {
        return this.fb.group({
            formFields: this.fb.group({
                nameEn: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
                nameAr: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
                type: ['', [Validators.required]],
                section: ['personal-info', [Validators.required]],
                group: ['general', [Validators.required]],
                field_order: [0, [Validators.min(0)]],
                grid_columns: [4, [Validators.required, Validators.min(1), Validators.max(12)]],
                repeatable: [false],
                repeatable_label: [''],
                repeatable_max: [null],
                status: [1, [Validators.required]]
            }),
            metaFields: this.fb.group({
                placeholderEn: [''],
                placeholderAr: [''],
                helpTextEn: [''],
                helpTextAr: [''],
                tooltipEn: [''],
                tooltipAr: [''],
                options: [[]],
                extensions: [[]],
                maxSize: [2048],
                multiple: [false],
                maxFiles: [1],
                rows: [5],
                fields: [[]],
                validations: this.fb.group({
                    required: [false],
                    min: [null],
                    max: [null],
                    minLength: [null],
                    maxLength: [null],
                    pattern: ['']
                })
            }),
            categoryRules: this.fb.array([]),
            conditions: this.fb.array([])
        });
    }

    createCategoryRuleGroup(rule?: any): FormGroup {
        return this.fb.group({
            category_slug: [rule?.category_slug || '', [Validators.required]],
            sub_category_slug: [rule?.sub_category_slug || ''],
            sector_slug: [rule?.sector_slug || ''],
            activity_slug: [rule?.activity_slug || ''],
            sub_activity_slug: [rule?.sub_activity_slug || ''],
            entity_slug: [rule?.entity_slug || ''],
            incubator_slug: [rule?.incubator_slug || ''],
            onshore_offshore: [rule?.onshore_offshore || 'both', [Validators.required]],
            is_required: [rule?.is_required ?? true, [Validators.required]]
        });
    }

    createConditionGroup(condition?: any): FormGroup {
        return this.fb.group({
            field: [condition?.field || '', [Validators.required]],
            operator: [condition?.operator || 'equals', [Validators.required]],
            value: [condition?.value || '', [Validators.required]],
            action: [condition?.action || 'show', [Validators.required]]
        });
    }

    // ==================== Form Array Getters ====================

    get categoryRulesFormArray(): FormArray {
        return this.formFieldForm.get('categoryRules') as FormArray;
    }

    get conditionsFormArray(): FormArray {
        return this.formFieldForm.get('conditions') as FormArray;
    }

    // ==================== Helper Methods ====================

    getFilteredGroups(): any[] {
        const selectedSection = this.formFieldForm?.get('formFields.section')?.value;
        if (!selectedSection) return this.groupOptions;

        return this.groupOptions.filter(g => 
            g.section === selectedSection || g.section === 'general' || g.value === 'custom'
        );
    }

    getCategoryKey(slug: string): string {
        const category = this.categories.find(cat => cat.slug === slug);
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

    getFieldTypeSeverity(type: string): string {
        const severities: Record<string, string> = {
            text: 'info',
            textarea: 'info',
            email: 'info',
            number: 'info',
            date: 'warning',
            select: 'success',
            radio: 'success',
            checkbox: 'success',
            file: 'danger',
            group: 'help'
        };
        return severities[type] || 'secondary';
    }

    getSectionLabel(section: string): string {
        const sections: Record<string, string> = {
            'personal-info': 'Personal Info',
            'employment-education': 'Employment & Education',
            'residency-travel': 'Residency & Travel',
            'documents': 'Documents'
        };
        return sections[section] || section;
    }

    getGroupLabel(group: string): string {
        const groups: Record<string, string> = {
            'identification-data': 'Identification',
            'applicant-info': 'Applicant',
            'contact-info': 'Contact',
            'passport-details': 'Passport',
            'employment-details': 'Employment',
            'previous-jobs': 'Previous Jobs',
            'education': 'Education',
            'residences': 'Residences',
            'other-nationalities': 'Other Nationalities',
            'countries-visited': 'Visited Countries',
            'family-members': 'Family',
            'required-documents': 'Documents'
        };
        return groups[group] || group;
    }

    getCategoryTooltip(meta: any): string {
        if (!meta) return '';
        return `Category: ${meta.key}\nOnshore/Offshore: ${meta.onshoreOffShore}\nRequired: ${meta.isRequired ? 'Yes' : 'No'}`;
    }

    getFullCategoryList(metas: any[]): string {
        if (!metas?.length) return '';
        return metas.map(m => `${m.key} (${m.onshoreOffShore})`).join(', ');
    }

    // ==================== Field Type Change Handler ====================

    onFieldTypeChange(type: string) {
        this.currentFieldType = type;

        if (!['select', 'radio', 'checkbox'].includes(type)) {
            this.dropdownOptions = [];
        }

        if (type !== 'group') {
            this.groupFields = [];
        }

        const metaFields = this.formFieldForm.get('metaFields') as FormGroup;
        
        // Reset validators
        ['extensions', 'options', 'fields', 'maxSize', 'multiple', 'maxFiles', 'rows'].forEach(
            field => metaFields.get(field)?.clearValidators()
        );

        // Set validators based on type
        switch (type) {
            case 'file':
                metaFields.get('extensions')?.setValidators([Validators.required]);
                metaFields.get('maxSize')?.setValidators([Validators.required, Validators.min(1), Validators.max(10240)]);
                break;
            case 'select':
            case 'radio':
            case 'checkbox':
                metaFields.get('options')?.setValidators([Validators.required, Validators.minLength(1)]);
                break;
            case 'group':
                metaFields.get('fields')?.setValidators([Validators.required, Validators.minLength(1)]);
                break;
            case 'textarea':
                metaFields.get('rows')?.setValidators([Validators.min(1), Validators.max(20)]);
                break;
        }

        // Update validity
        ['extensions', 'options', 'fields', 'maxSize', 'multiple', 'maxFiles', 'rows'].forEach(
            field => metaFields.get(field)?.updateValueAndValidity()
        );
    }

    // ==================== Options Management ====================

    addOption() {
        this.dropdownOptions.push({ labelEn: '', labelAr: '', value: '' });
        this.updateOptionsInForm();
    }

    removeOption(index: number) {
        this.dropdownOptions.splice(index, 1);
        this.updateOptionsInForm();
    }

    private updateOptionsInForm() {
        const metaFields = this.formFieldForm.get('metaFields') as FormGroup;
        metaFields.get('options')?.setValue(this.dropdownOptions);
    }

    // ==================== Group Fields Management ====================

    addGroupField() {
        this.groupFields.push({
            nameEn: '',
            nameAr: '',
            type: 'text',
            grid_columns: 4,
            required: false,
            options: []
        });
        this.updateGroupFieldsInForm();
    }

    removeGroupField(index: number) {
        this.groupFields.splice(index, 1);
        this.updateGroupFieldsInForm();
    }

    private updateGroupFieldsInForm() {
        const metaFields = this.formFieldForm.get('metaFields') as FormGroup;
        metaFields.get('fields')?.setValue(this.groupFields);
    }

    // ==================== Custom Group Handling ====================

    onCustomGroupChange(value: string) {
        this.customGroupName = value;
    }

    applyCustomGroup() {
        if (!this.customGroupName) return;

        const kebabCase = this.customGroupName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        this.formFieldForm?.get('formFields.group')?.setValue(kebabCase);
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Custom group set to: ${kebabCase}`,
            life: 2000
        });
    }

    // ==================== Category Rules Management ====================

    addCategoryRule() {
        this.categoryRulesFormArray.push(this.createCategoryRuleGroup());
    }

    removeCategoryRule(index: number) {
        this.categoryRulesFormArray.removeAt(index);
        [this.subCategoriesMap, this.sectorsMap, this.activitiesMap, 
         this.subActivitiesMap, this.entitiesMap, this.incubatorsMap].forEach(
            map => map.delete(index)
        );
        this.reindexMaps();
    }

    // ==================== Conditions Management ====================

    addCondition() {
        this.conditionsFormArray.push(this.createConditionGroup());
    }

    removeCondition(index: number) {
        this.conditionsFormArray.removeAt(index);
    }

    // ==================== Dropdown Change Handlers ====================

    onSectionChange(section: string) {
        const currentGroup = this.formFieldForm?.get('formFields.group')?.value;
        const validGroups = this.getFilteredGroups().map(g => g.value);

        if (currentGroup && !validGroups.includes(currentGroup) && currentGroup !== 'custom') {
            this.formFieldForm?.get('formFields.group')?.setValue('');
        }
    }

    onGroupChange(value: string) {
        if (value !== 'custom') {
            this.customGroupName = '';
        }
    }

    async onDropDownChange(type: string, value: any, index: number) {
        const rule = this.categoryRulesFormArray.at(index);

        switch (type) {
            case 'category_slug':
                if (value) await this.loadSubCategoriesAndSectors(value, index);
                rule.patchValue({ sector_slug: '', activity_slug: '', sub_activity_slug: '', entity_slug: '', incubator_slug: '' });
                break;
            case 'sector_slug':
                if (value) await this.loadActivities(value, index);
                rule.patchValue({ activity_slug: '', sub_activity_slug: '', entity_slug: '' });
                break;
            case 'activity_slug':
                if (value) await this.loadSubActivitiesAndEntities(value, index);
                rule.patchValue({ sub_activity_slug: '', entity_slug: '' });
                break;
        }
    }

    // ==================== Data Loading ====================

    private loadSubCategoriesAndSectors(slug: string, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getSubCateogries_Sectors_Incubator(slug).subscribe({
                next: (res) => {
                    this.subCategoriesMap.set(index, res.data['subCategories'] || []);
                    this.sectorsMap.set(index, res.data['sectors'] || []);
                    this.incubatorsMap.set(index, res.data['incubator'] || []);
                    resolve();
                },
                error: (err) => {
                    this.showError(err.error?.message || 'Failed to load data');
                    reject(err);
                }
            });
        });
    }

    private loadActivities(slug: string, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getActivitiesOfSectors(slug).subscribe({
                next: (res) => {
                    this.activitiesMap.set(index, res.data || []);
                    resolve();
                },
                error: (err) => {
                    this.showError(err.error?.message || 'Failed to load activities');
                    reject(err);
                }
            });
        });
    }

    private loadSubActivitiesAndEntities(slug: string, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.configurationService.getSubActivities_Entities(slug).subscribe({
                next: (res) => {
                    this.subActivitiesMap.set(index, res.data['subActivities'] || []);
                    this.entitiesMap.set(index, res.data['entities'] || []);
                    resolve();
                },
                error: (err) => {
                    this.showError(err.error?.message || 'Failed to load data');
                    reject(err);
                }
            });
        });
    }

    // ==================== Form Building ====================

    formBuild(formField?: any) {
        if (!formField) return;

        // Reset state
        this.resetState();

        // Prepare form values
        const formValues = this.prepareFormValues(formField);
        this.formFieldForm.patchValue(formValues);

        // Handle category rules
        this.buildCategoryRules(formField);

        // Handle conditions
        this.buildConditions(formField);

        // Load additional data
        this.loadAdditionalData(formField);

        // Handle custom group
        this.handleCustomGroup(formField);
    }

    private resetState() {
        this.dropdownOptions = [];
        this.groupFields = [];
        this.currentFieldType = '';
        this.customGroupName = '';
        
        [this.subCategoriesMap, this.sectorsMap, this.activitiesMap,
         this.subActivitiesMap, this.entitiesMap, this.incubatorsMap].forEach(
            map => map.clear()
        );
    }

    private prepareFormValues(formField: any) {
        return {
            formFields: {
                nameEn: formField.nameEn || '',
                nameAr: formField.nameAr || '',
                type: formField.type || '',
                section: formField.section || 'personal-info',
                group: formField.group || 'general',
                field_order: formField.field_order || 0,
                grid_columns: formField.grid_columns || 4,
                repeatable: formField.repeatable === 1 || formField.repeatable === true,
                repeatable_label: formField.repeatable_label || '',
                repeatable_max: formField.repeatable_max || null,
                status: formField.status ?? 1
            },
            metaFields: {
                placeholderEn: formField.meta?.placeholderEn || '',
                placeholderAr: formField.meta?.placeholderAr || '',
                helpTextEn: formField.meta?.helpTextEn || '',
                helpTextAr: formField.meta?.helpTextAr || '',
                tooltipEn: formField.meta?.tooltipEn || '',
                tooltipAr: formField.meta?.tooltipAr || '',
                options: formField.meta?.options || [],
                extensions: formField.meta?.extensions || [],
                maxSize: formField.meta?.maxSize || 2048,
                multiple: formField.meta?.multiple === true || formField.meta?.multiple === 1,
                maxFiles: formField.meta?.maxFiles || 1,
                rows: formField.meta?.rows || 5,
                fields: formField.meta?.fields || [],
                validations: {
                    required: formField.meta?.validations?.required === true || formField.meta?.validations?.required === 1,
                    min: formField.meta?.validations?.min || null,
                    max: formField.meta?.validations?.max || null,
                    minLength: formField.meta?.validations?.minLength || null,
                    maxLength: formField.meta?.validations?.maxLength || null,
                    pattern: formField.meta?.validations?.pattern || ''
                }
            }
        };
    }

    private buildCategoryRules(formField: any) {
        const categoryRulesArray = this.formFieldForm.get('categoryRules') as FormArray;
        while (categoryRulesArray.length) {
            categoryRulesArray.removeAt(0);
        }

        if (formField.formMetas?.length) {
            formField.formMetas.forEach((meta: any) => {
                const valueObj = meta.value || {};
                const rule = {
                    category_slug: meta.key || '',
                    sub_category_slug: valueObj.sub_category || valueObj.subCategorySlug || '',
                    sector_slug: valueObj.sector || valueObj.sectorSlug || '',
                    activity_slug: valueObj.activity || valueObj.activitySlug || '',
                    sub_activity_slug: valueObj.sub_activity || valueObj.subActivitySlug || '',
                    entity_slug: valueObj.entity || valueObj.entitySlug || '',
                    incubator_slug: valueObj.incubator || valueObj.incubatorSlug || '',
                    onshore_offshore: meta.onshoreOffShore || 'both',
                    is_required: meta.isRequired === 1 || meta.isRequired === true
                };
                categoryRulesArray.push(this.createCategoryRuleGroup(rule));
            });
        } else if (formField.category_rules?.length) {
            formField.category_rules.forEach((rule: any) => {
                categoryRulesArray.push(this.createCategoryRuleGroup(rule));
            });
        }
    }

    private buildConditions(formField: any) {
        const conditionsArray = this.formFieldForm.get('conditions') as FormArray;
        while (conditionsArray.length) {
            conditionsArray.removeAt(0);
        }

        if (!formField.conditions) return;

        let conditions = formField.conditions;
        if (typeof conditions === 'string') {
            try {
                conditions = JSON.parse(conditions);
            } catch {
                return;
            }
        }

        if (Array.isArray(conditions)) {
            conditions.forEach((cond: any) => {
                let value = cond.value || '';
                if (Array.isArray(value)) {
                    value = value.join(',');
                }
                conditionsArray.push(this.createConditionGroup({
                    ...cond,
                    value: String(value)
                }));
            });
        }
    }

    private loadAdditionalData(formField: any) {
        if (formField.meta?.options) {
            this.dropdownOptions = formField.meta.options;
        }
        if (formField.meta?.fields) {
            this.groupFields = formField.meta.fields;
        }
        if (this.currentFieldType) {
            this.onFieldTypeChange(this.currentFieldType);
        }
    }

    private handleCustomGroup(formField: any) {
        const groupValue = formField?.group;
        const predefinedGroups = this.groupOptions.map(g => g.value);

        if (groupValue && !predefinedGroups.includes(groupValue) && groupValue !== 'custom') {
            this.customGroupName = groupValue;
            setTimeout(() => {
                this.formFieldForm?.get('formFields.group')?.setValue('custom');
            }, 100);
        }
    }

    // ==================== CRUD Operations ====================

    openNew() {
        this.resetAllMaps();
        this.formFieldForm = this.createEmptyForm();
        this.formField = {};
        this.submitted = false;
        this.formFieldDialog = true;
    }

    async editFormField(formField: any) {
        try {
            this.formFieldForm = this.createEmptyForm();
            const res = await this.configurationService.getFormFieldId(formField.id).toPromise();
            this.formField = res.data || res;
            this.formBuild(this.formField);
            
            // Load category rule dependencies
            if (this.formField.category_rules?.length) {
                for (let i = 0; i < this.formField.category_rules.length; i++) {
                    const rule = this.formField.category_rules[i];
                    if (rule.category_slug) {
                        await this.loadSubCategoriesAndSectors(rule.category_slug, i);
                    }
                    if (rule.sector_slug) {
                        await this.loadActivities(rule.sector_slug, i);
                    }
                    if (rule.activity_slug) {
                        await this.loadSubActivitiesAndEntities(rule.activity_slug, i);
                    }
                }
            }

            this.formFieldDialog = true;
            this.submitted = false;
        } catch (error) {
            console.error('Error loading form field:', error);
            this.showError('Failed to load form field');
        }
    }

    deleteSelectedFormFields() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected Fields?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedFormFields.map(f => 
                    this.configurationService.deleteFormField(f.id).toPromise()
                );

                Promise.all(deleteRequests)
                    .then(() => {
                        this.formFields = this.formFields.filter(f => !this.selectedFormFields.includes(f));
                        this.selectedFormFields = [];
                        this.showSuccess('Fields Deleted');
                    })
                    .catch(error => {
                        console.error(error);
                        this.showError('Some deletes failed');
                    });
            }
        });
    }

    deleteFormField(formField: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${formField.nameEn}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteFormField(formField.id).subscribe({
                    next: () => {
                        this.formFields = this.formFields.filter(f => f.id !== formField.id);
                        this.showSuccess('Field Deleted');
                    },
                    error: (error) => {
                        console.error(error);
                        this.showError(error.error?.message || 'Failed to delete field');
                    }
                });
            }
        });
    }

    saveFormField() {
        this.submitted = true;

        if (this.formFieldForm.invalid) {
            this.formFieldForm.markAllAsTouched();
            this.showError('Please fill all required fields correctly');
            return;
        }

        const apiData = this.prepareApiData();

        const request = this.formField.id
            ? this.configurationService.updateFormField(this.formField.id, apiData)
            : this.configurationService.createFormField(apiData);

        request.subscribe({
            next: (res) => {
                if (this.formField.id) {
                    const index = this.formFields.findIndex(f => f.id === this.formField.id);
                    this.formFields[index] = res.data;
                    this.showSuccess('Field Updated Successfully');
                } else {
                    this.formFields.push(res.data);
                    this.showSuccess('Field Created Successfully');
                }
                this.formFieldDialog = false;
                this.formField = {};
            },
            error: (error) => {
                console.error(error);
                this.showError(error.error?.message || 'Operation failed');
            }
        });
    }

    private prepareApiData() {
        const formValue = this.formFieldForm.value;
        const apiData: any = {
            formFields: {
                nameEn: formValue.formFields.nameEn,
                nameAr: formValue.formFields.nameAr,
                type: formValue.formFields.type,
                section: formValue.formFields.section,
                group: formValue.formFields.group === 'custom' ? this.customGroupName : formValue.formFields.group,
                field_order: formValue.formFields.field_order,
                grid_columns: formValue.formFields.grid_columns,
                repeatable: formValue.formFields.repeatable,
                repeatable_label: formValue.formFields.repeatable ? formValue.formFields.repeatable_label : null,
                repeatable_max: formValue.formFields.repeatable ? formValue.formFields.repeatable_max : null,
                status: formValue.formFields.status
            },
            metaFields: {
                placeholderEn: formValue.metaFields.placeholderEn,
                placeholderAr: formValue.metaFields.placeholderAr,
                helpTextEn: formValue.metaFields.helpTextEn,
                helpTextAr: formValue.metaFields.helpTextAr,
                tooltipEn: formValue.metaFields.tooltipEn,
                tooltipAr: formValue.metaFields.tooltipAr,
                validations: formValue.metaFields.validations
            },
            categoryRules: formValue.categoryRules,
            conditions: formValue.conditions
        };

        // Add type-specific meta data
        switch (formValue.formFields.type) {
            case 'file':
                apiData.metaFields.extensions = formValue.metaFields.extensions;
                apiData.metaFields.maxSize = formValue.metaFields.maxSize;
                apiData.metaFields.multiple = formValue.metaFields.multiple;
                apiData.metaFields.maxFiles = formValue.metaFields.maxFiles;
                break;
            case 'select':
            case 'radio':
            case 'checkbox':
                apiData.metaFields.options = this.dropdownOptions.filter(opt => opt.labelEn && opt.labelAr && opt.value);
                break;
            case 'group':
                apiData.metaFields.fields = this.groupFields;
                break;
            case 'textarea':
                apiData.metaFields.rows = formValue.metaFields.rows;
                break;
        }

        return apiData;
    }

    hideDialog() {
        this.formFieldDialog = false;
        this.submitted = false;
        this.resetAllMaps();
        this.formFieldForm.reset();
    }

    private resetAllMaps() {
        this.dropdownOptions = [];
        this.groupFields = [];
        this.currentFieldType = '';
        this.customGroupName = '';
        
        [this.subCategoriesMap, this.sectorsMap, this.activitiesMap,
         this.subActivitiesMap, this.entitiesMap, this.incubatorsMap].forEach(
            map => map.clear()
        );
    }

    // ==================== Table Methods ====================

    exportCSV() {
        const formatted = this.formFields.map(f => ({
            ...f,
            status: f.status === 1 ? 'Active' : 'Inactive'
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
            { field: 'section', header: 'Section' },
            { field: 'group', header: 'Group' },
            { field: 'created_at', header: 'Created At' },
            { field: 'updated_at', header: 'Updated At' },
            { field: 'status', header: 'Status' }
        ];

        this.exportColumns = this.cols.map(col => ({
            title: col.header,
            dataKey: col.field
        }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    loadFormFields(event: any) {
        const page = event.first / event.rows + 1;
        const params = `?page=${page}&per_page=${event.rows}`;

        this.configurationService.getFormFields(params).subscribe({
            next: (res: any) => {
                if (res.data?.data) {
                    this.formFields = res.data.data;
                    this.totalRecords = res.data.total || res.data.data.length;
                    this.page = res.data.current_page || 1;
                } else {
                    this.formFields = [];
                    this.totalRecords = 0;
                }
            },
            error: (error) => {
                console.error(error);
                this.showError('Failed to load Fields');
                this.formFields = [];
            }
        });
    }

    // ==================== Helper Methods ====================

    private showSuccess(message: string) {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 });
    }

    private showError(message: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }

    private reindexMaps() {
        const newMaps = [
            new Map<number, any[]>(),
            new Map<number, any[]>(),
            new Map<number, any[]>(),
            new Map<number, any[]>(),
            new Map<number, any[]>(),
            new Map<number, any[]>()
        ];

        this.categoryRulesFormArray.controls.forEach((_, index) => {
            newMaps[0].set(index, this.subCategoriesMap.get(index) || []);
            newMaps[1].set(index, this.sectorsMap.get(index) || []);
            newMaps[2].set(index, this.activitiesMap.get(index) || []);
            newMaps[3].set(index, this.subActivitiesMap.get(index) || []);
            newMaps[4].set(index, this.entitiesMap.get(index) || []);
            newMaps[5].set(index, this.incubatorsMap.get(index) || []);
        });

        [this.subCategoriesMap, this.sectorsMap, this.activitiesMap,
         this.subActivitiesMap, this.entitiesMap, this.incubatorsMap] = newMaps;
    }
}