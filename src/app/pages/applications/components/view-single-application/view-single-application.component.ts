import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule, FormBuilder, FormControl, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { SafeUrlPipe } from '@/pipes/safe-url.pipe';
import { RequestService } from '@/services/request.service';
import { ImageModule } from 'primeng/image';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Divider } from 'primeng/divider';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';

// Add these imports at the top
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';

// Interfaces for type safety
interface qcCheck {
    fieldName: string;
    fieldPath: string;
    // fieldOldValue?: string;
    status: status;
    commentsEn?: string;
    commentsAr?: string;
    corrections?: string[];
}

interface ApplicationStage {
    key: string;
    name: string;
    status: string;
    role: string;
    username: string;
    icon: string;
    color: string;
}

interface FieldData {
    label: string;
    value: string;
    fieldPath: string;
    status?: status;
    qcComment?: string;
    _targetObject?: any;
}

interface qcField {
    label: string;
    fieldPath: string;
    value?: string;
    status?: status;
    qcComment?: string;
    _targetObject?: any;
}

interface qcProgress {
    checked: number;
    total: number;
}

type status = 'Correct' | 'Wrong' | 'NeedCorrection' | 'approved' | 'rejected';
type QCButton = 'START_QC' | 'APPROVED_QC' | 'APPROVED' | 'REJECT' | 'ON_HOLD';

@Component({
    selector: 'app-view-single-application',
    standalone: true,
    imports: [
        ImageModule,
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        ConfirmDialog,
        TagModule,
        DialogModule,
        TooltipModule,
        SelectModule,
        TextareaModule,
        FormsModule,
        PdfViewerModule,
        Divider,
        ReactiveFormsModule,
        AccordionModule,
        BadgeModule,
        PermissionDirective
    ],
    templateUrl: './view-single-application.component.html',
    styleUrls: ['./view-single-application.component.scss'],
    providers: [ConfirmationService, MessageService]
})
export class ViewSingleApplicationComponent implements OnInit, OnDestroy {
    @ViewChild('contentContainer', { static: true }) contentContainer!: ElementRef<HTMLDivElement>;

    // Component state
    request: any = null;
    stages: ApplicationStage[] = [];
    activeSection = 'personal';
    qcCorrectionsMap: Record<string, { status: string; comment: string | null; corrections?: any[]; updated: boolean; fieldOldValue?: string }> = {};
    identificationFields: FieldData[] = [];
    qatarResidentFields: FieldData[] = [];

    readonly SECTIONS: string[] = ['overview', 'personal', 'employment', 'residency', 'documents', 'qc'];

    // Preview state
    previewVisible = false;
    previewUrl: string | null = null;
    previewName: string | null = null;

    // PDF Viewer state
    pdfSrc: string = '';
    pdfLoading = false;
    pdfError = false;
    pdfZoom = 1.0;

    // qc state
    isqcInProgress = false;
    showqcDetails = false;
    showCommentDialog = false;
    qcChecks: qcCheck[] = [];
    currentField: qcField | null = null;
    currentFieldStatus: status = 'Correct';
    currentFieldCommentEn = '';
    currentFieldCommentAr = '';
    currentFieldCorrections = '';

    // Data arrays
    educationData: any[] = [];
    familyMembersData: any[] = [];
    previousJobsData: any[] = [];
    residencesData: any[] = [];
    otherNationalitiesData: any[] = [];
    countriesVisitedData: any[] = [];
    personalFields: FieldData[] = [];
    passportFields: FieldData[] = [];
    contactFields: FieldData[] = [];
    employmentFields: FieldData[] = [];
    statuses: any[] = [];
    // Constants
    readonly qc_STATUS_OPTIONS = [
        { label: 'Correct', value: 'Correct' },
        { label: 'Wrong', value: 'Wrong' },
        { label: 'Needs Correction', value: 'NeedCorrection' }
    ];

    readonly FILE_EXTENSIONS = {
        IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
        PDF: ['.pdf'],
        WORD: ['.doc', '.docx'],
        EXCEL: ['.xls', '.xlsx'],
        POWERPOINT: ['.ppt', '.pptx']
    };

    readonly BLOCKED_KEYS = ['PrintScreen', 'F12', 'F11', 'Pause', 'ScrollLock'];

    // Application state
    applicationStageStatus = 'N/A';
    isDraft = false;
    showProtectionMessage = false;
    qcProgress: qcProgress = { checked: 0, total: 0 };

    private destroy$ = new Subject<void>();
    private securityEventListeners: { [key: string]: (event: any) => void } = {};

    // FormGroup
    formComment!: FormGroup;

    // Permission flags for UI
    canEdit$: any;
    canStartQC$: any;
    canApproveQC$: any;
    canViewQC$: any;

    // Make Permission enum available in template
    Permission = Permission;

    constructor(
        private permissionService: PermissionService,
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private messageService: MessageService,
        private reqService: RequestService,
        private cdRef: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
        // Permission flags for UI
        this.canEdit$ = this.permissionService.hasPermission(this.getEditPermission());
        this.canStartQC$ = this.permissionService.hasPermission(Permission.REQUEST_QUALITY_CHECKS);
        this.canApproveQC$ = this.permissionService.hasPermission(Permission.APPROVE_QUALITY_CHECKS);
        this.canViewQC$ = this.permissionService.hasPermission(Permission.VIEW_QUALITY_CHECKS);
        if (isPlatformBrowser(this.platformId)) {
            this.initializeComponent();
        }
        this.prepareQvcCorrections();
        this.buildCommentForm();

        this.statuses = Object.entries(this.request?.status).map(([key, value]: any) => ({
            key,
            ...(Array.isArray(value) && value.length > 0 ? value[0] : {})
        }));
    }

    getEditPermission(): string {
        const catSlug = this.request?.category?.slug;
        switch (catSlug) {
            case 'tal':
                return Permission.EDIT_TALENT;
            case 'ent':
                return Permission.EDIT_ENTREPRENEUR;
            case 'inv':
                return Permission.EDIT_INVESTOR;
            case 'exe':
                return Permission.EDIT_EXECUTIVE;
            default:
                return Permission.EDIT_TALENT;
        }
    }

    getSeverity(param: string | null | undefined): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const status = param?.toLowerCase();

        switch (status) {
            case 'approved':
                return 'success';

            case 'rejected':
                return 'danger';

            default:
                return 'warn';
        }
    }

    firstCorrectionPath: string | null = null;
    private prepareQvcCorrections() {
        this.qcCorrectionsMap = {};
        this.firstCorrectionPath = null;

        const checks = this.request?.qualityCheck?.meta ?? this.request?.qualityCheck?.checks ?? [];
        for (const ch of checks) {
            if (!ch || !ch.fieldPath) continue;

            this.qcCorrectionsMap[ch.fieldPath] = {
                status: ch.status,
                comment: ch.commentsEn ?? ch.commentsAr ?? null,
                corrections: ch.corrections ?? [],
                updated: ch.updated ?? [],
                fieldOldValue: ch?.fieldOldValue
            };

            // Track first field that needs correction
            if (!this.firstCorrectionPath && ch.status && ch.status !== 'Correct') {
                this.firstCorrectionPath = ch.fieldPath;
            }
        }
    }

    getFieldQCComment(fieldPath: string): string | null {
        const correction = this.qcCorrectionsMap[fieldPath];

        if (correction?.status !== 'Correct') {
            return correction?.fieldOldValue ?? null;
        }

        return null;
    }

    private initializeComponent(): void {
        this.request = this.activatedRoute.snapshot.data?.['singleRequestResolver']?.[0]?.['data']?.['request'] || null;

        if (!this.request) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Unable to load application data'
            });
            return;
        }

        this.initializeStages();
        this.buildFieldArrays();
        this.calculateqcProgress();
        this.initializeSecurityProtection();

        // Set default section to overview
        this.activeSection = 'personal';
    }

    private initializeStages(): void {
        const STAGE_ORDER = ['jusour', 'vfs', 'entity', 'moci', 'application', 'mol', 'hayya'];
        const STAGE_DISPLAY_NAMES: { [key: string]: string } = {
            jusour: 'Jusour',
            vfs: 'VFS',
            entity: 'Entity',
            moci: 'MOCI',
            application: 'Application',
            mol: 'MOL',
            hayya: 'Hayya'
        };

        const statusObj = this.request?.status || {};

        this.stages = STAGE_ORDER.map((key) => {
            const stage = statusObj[key]?.[0] || {};
            const status = stage?.status || 'Pending';

            return {
                key,
                name: STAGE_DISPLAY_NAMES[key] || key,
                status,
                role: stage?.role || '',
                username: stage?.username || '',
                icon: this.getStageIcon(status),
                color: this.getStageColor(status)
            };
        });

        const appStage = this.stages.find((s) => s.key === 'application');
        this.applicationStageStatus = appStage?.status || 'N/A';
        this.isDraft = this.applicationStageStatus.toLowerCase() === 'draft';
    }

    private buildFieldArrays(): void {
        const pi = this.request?.personalInfo?.applicantInfo || {};
        const passport = this.request?.personalInfo?.passportDetails || {};
        const contact = this.request?.personalInfo?.contactInfo || {};
        const employment = this.request?.employmentAndEducation?.employmentDetails || {};
        const identification = this.request || {};

        // Initialize data arrays
        this.educationData = this.request?.employmentAndEducation?.educations || [];
        this.familyMembersData = this.request?.ResidencyAndTravelAndFamily?.familyMembers || [];
        this.previousJobsData = this.request?.employmentAndEducation?.previousJobs || [];
        this.residencesData = this.request?.ResidencyAndTravelAndFamily?.residences || [];
        this.otherNationalitiesData = this.request?.ResidencyAndTravelAndFamily?.otherNationalities || [];
        this.countriesVisitedData = this.request?.ResidencyAndTravelAndFamily?.countriesVisitedLast10Years || [];

        // Build field arrays
        this.identificationFields = this.buildIdentificationFields(identification);

        this.personalFields = this.buildPersonalFields(pi);
        this.passportFields = this.buildPassportFields(passport);
        this.contactFields = this.buildContactFields(contact);
        this.employmentFields = this.buildEmploymentFields(employment);
        this.qatarResidentFields = this.buildQatarResidentFields(pi);

        this.loadExistingqcChecks();
    }

    private buildIdentificationFields(identificationData: any): FieldData[] {
        return [
            { label: 'Category', value: identificationData?.category?.name || null, fieldPath: 'category.name' },
            { label: 'Sub Category', value: identificationData?.subCategory?.name || null, fieldPath: 'subCategory.name' },
            { label: 'Sector', value: identificationData?.sector?.name || null, fieldPath: 'sector.name' },
            { label: 'Activity', value: identificationData?.activity?.name || null, fieldPath: 'activity.name' },
            { label: 'Sub Activity', value: identificationData?.subActivity?.name || null, fieldPath: 'subActivity.name' },
            { label: 'Entity', value: identificationData?.entity?.name || null, fieldPath: 'entity.name' },
            { label: 'Incubator', value: identificationData?.incubator?.name || null, fieldPath: 'incubator.name' }
        ].filter((item) => item.value !== null);
    }

    private buildQatarResidentFields(personalInfo: any): FieldData[] {
        if (!personalInfo.areYouQatarResident) return [];

        return [
            { label: 'QID Type', value: personalInfo.qidType || null, fieldPath: 'personalInfo.applicantInfo.qidType' },
            { label: 'QID Number', value: personalInfo.qidNumber || null, fieldPath: 'personalInfo.applicantInfo.qidNumber' },
            { label: 'Work Permit', value: personalInfo.workPermit || null, fieldPath: 'personalInfo.applicantInfo.workPermit' },
            { label: 'Maintain Work Permit', value: personalInfo.maintainWorkPermit || null, fieldPath: 'personalInfo.applicantInfo.maintainWorkPermit' }
        ].filter((field) => field.value !== null);
    }

    private buildPersonalFields(personalInfo: any): FieldData[] {
        return [
            { label: 'Name (EN)', value: personalInfo.nameEn || null, fieldPath: 'personalInfo.applicantInfo.nameEn' },
            { label: 'Name (AR)', value: personalInfo.nameAr || null, fieldPath: 'personalInfo.applicantInfo.nameAr' },
            { label: 'Gender', value: personalInfo.gender || null, fieldPath: 'personalInfo.applicantInfo.gender' },
            { label: 'Date of Birth', value: this.formatDate(personalInfo.dob), fieldPath: 'personalInfo.applicantInfo.dob' },
            { label: 'Nationality', value: personalInfo.nationality || null, fieldPath: 'personalInfo.applicantInfo.nationality' },
            { label: 'Place of Birth', value: personalInfo.placeOfBirth || null, fieldPath: 'personalInfo.applicantInfo.placeOfBirth' },
            { label: 'Religion', value: personalInfo.religion || null, fieldPath: 'personalInfo.applicantInfo.religion' },
            { label: 'Marital Status', value: personalInfo.maritalStatus || null, fieldPath: 'personalInfo.applicantInfo.maritalStatus' },
            { label: 'Current Country', value: personalInfo.currentCountry || null, fieldPath: 'personalInfo.applicantInfo.currentCountry' },
            { label: 'Short Bio', value: personalInfo.shortBio || null, fieldPath: 'personalInfo.applicantInfo.shortBio' },
            { label: 'Arabic Proficiency', value: personalInfo.langProficiencyAr || null, fieldPath: 'personalInfo.applicantInfo.langProficiencyAr' },
            { label: 'English Proficiency', value: personalInfo.langProficiencyEn || null, fieldPath: 'personalInfo.applicantInfo.langProficiencyEn' }
        ];
    }

    private buildPassportFields(passportInfo: any): FieldData[] {
        return [
            { label: 'Passport #', value: passportInfo.number || this.request?.passportNumber || null, fieldPath: 'personalInfo.passportDetails.number' },
            { label: 'Type', value: passportInfo.type || null, fieldPath: 'personalInfo.passportDetails.type' },
            { label: 'Issue Place', value: passportInfo.issuePlace || null, fieldPath: 'personalInfo.passportDetails.issuePlace' },
            { label: 'Issue Country', value: passportInfo.issueCountry || null, fieldPath: 'personalInfo.passportDetails.issueCountry' },
            { label: 'Issue Date', value: this.formatDate(passportInfo.issueDate), fieldPath: 'personalInfo.passportDetails.issueDate' },
            { label: 'Expiry Date', value: this.formatDate(passportInfo.expiryDate), fieldPath: 'personalInfo.passportDetails.expiryDate' },
            { label: 'Issued By', value: passportInfo.issueBy || null, fieldPath: 'personalInfo.passportDetails.issueBy' }
        ];
    }

    private buildContactFields(contactInfo: any): FieldData[] {
        const fields: FieldData[] = [
            { label: 'Email', value: contactInfo.email || this.request?.email || null, fieldPath: 'personalInfo.contactInfo.email' },
            { label: 'Mobile', value: contactInfo.mobile || this.request?.mobileNumber || null, fieldPath: 'personalInfo.contactInfo.mobile' },
            { label: 'Phone', value: contactInfo.phone || 'N/A', fieldPath: 'personalInfo.contactInfo.phone' },
            { label: 'Permanent Address', value: contactInfo.permanentAddress, fieldPath: 'personalInfo.contactInfo.permanentAddress' }
        ];

        // Only add Qatar Address if areYouQatarResident is true
        if (this.request?.personalInfo?.applicantInfo?.areYouQatarResident) {
            fields.push(
                {
                    label: 'Qatar Address',
                    value: contactInfo.qatarAddress || null,
                    fieldPath: 'personalInfo.contactInfo.qatarAddress'
                },
                {
                    label: 'PO Box',
                    value: contactInfo.poBox || null,
                    fieldPath: 'personalInfo.contactInfo.poBox'
                }
            );
        }

        return fields;
    }

    private buildEmploymentFields(employmentInfo: any): FieldData[] {
        const catSlug = this.request?.category?.slug;

        const fieldMappings: { [key: string]: FieldData[] } = {
            tal: [
                { label: 'Profession', value: employmentInfo.profession || null, fieldPath: 'employmentAndEducation.employmentDetails.profession' },
                { label: 'Sponsor Name', value: employmentInfo.nameOfSponsor || null, fieldPath: 'employmentAndEducation.employmentDetails.nameOfSponsor' },
                { label: 'Sponsor Address', value: employmentInfo.addressOfSponsor || null, fieldPath: 'employmentAndEducation.employmentDetails.addressOfSponsor' }
            ],
            inv: [
                { label: 'Company Name', value: employmentInfo.companyName || null, fieldPath: 'employmentAndEducation.employmentDetails.companyName' },
                { label: 'Share of Capital', value: employmentInfo.shareOfTheCapital || null, fieldPath: 'employmentAndEducation.employmentDetails.shareOfTheCapital' },
                { label: 'Amount of Capital', value: employmentInfo.amountOfCapital || null, fieldPath: 'employmentAndEducation.employmentDetails.amountOfCapital' }
            ],
            ent: [
                { label: 'Profession', value: employmentInfo.profession || null, fieldPath: 'employmentAndEducation.employmentDetails.profession' },
                { label: 'Sponsor Name', value: employmentInfo.nameOfSponsor || null, fieldPath: 'employmentAndEducation.employmentDetails.nameOfSponsor' },
                { label: 'Sponsor Address', value: employmentInfo.addressOfSponsor || null, fieldPath: 'employmentAndEducation.employmentDetails.addressOfSponsor' }
            ],
            exe: [
                { label: 'Profession', value: employmentInfo.profession || null, fieldPath: 'employmentAndEducation.employmentDetails.profession' },
                { label: 'Sponsor Name', value: employmentInfo.nameOfSponsor || null, fieldPath: 'employmentAndEducation.employmentDetails.nameOfSponsor' },
                { label: 'Sponsor Address', value: employmentInfo.addressOfSponsor || null, fieldPath: 'employmentAndEducation.employmentDetails.addressOfSponsor' },
                { label: 'Company Name', value: employmentInfo.companyName || null, fieldPath: 'employmentAndEducation.employmentDetails.companyName' },
                { label: 'Current Job Title', value: employmentInfo.currentJobTitle || null, fieldPath: 'employmentAndEducation.employmentDetails.currentJobTitle' },
                { label: 'Date Of Joining', value: employmentInfo.dateOfJoining || null, fieldPath: 'employmentAndEducation.employmentDetails.dateOfJoining' },
                { label: 'Monthly Salary', value: employmentInfo.monthlySalary || null, fieldPath: 'employmentAndEducation.employmentDetails.monthlySalary' },
                { label: 'Other Company Classification', value: employmentInfo.otherCompanyClassification || null, fieldPath: 'employmentAndEducation.employmentDetails.otherCompanyClassification' },
                { label: 'Other Current Job Title', value: employmentInfo.otherCurrentJobTitle || null, fieldPath: 'employmentAndEducation.employmentDetails.otherCurrentJobTitle' },
                { label: 'Company Classification', value: employmentInfo.companyClassification || null, fieldPath: 'employmentAndEducation.employmentDetails.companyClassification' }
            ]
        };

        return fieldMappings[catSlug].filter((e: any) => e.value) || [];
    }

    private formatDate(dateString: string): string {
        return dateString ? new Date(dateString).toLocaleDateString() : '-';
    }

    // Check if array has any non-null/non-empty values
    hasValidArrayData(array: any[]): boolean {
        if (!array || array.length === 0) return false;

        return array.some((item) => {
            // Check if any property in the item has a non-null, non-empty value
            return Object.values(item).some((value) => value !== null && value !== '' && value !== undefined && value !== 'null' && value !== '-' && !(Array.isArray(value) && value.length === 0));
        });
    }

    // Security Implementation
    private initializeSecurityProtection(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.securityEventListeners = {
            keydown: this.preventScreenshotKeys.bind(this),
            contextmenu: this.onRightClick.bind(this),
            dragstart: this.onDragStart.bind(this),
            selectstart: this.onSelectStart.bind(this)
        };

        Object.entries(this.securityEventListeners).forEach(([event, handler]) => {
            document.addEventListener(event, handler);
        });
    }

    private removeSecurityProtection(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        Object.entries(this.securityEventListeners).forEach(([event, handler]) => {
            document.removeEventListener(event, handler);
        });
    }

    // MISSING METHOD - ADDED HERE
    onKeyDown(event: KeyboardEvent): void {
        // Prevent Print Screen, F12 (DevTools), and other screenshot-related keys
        const blockedKeys = ['PrintScreen', 'F12', 'F11', 'Pause', 'ScrollLock'];

        // Ctrl+Shift+I (DevTools), Ctrl+Shift+C (Inspect Element)
        if ((event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'C')) || event.key === 'F12' || event.key === 'PrintScreen' || blockedKeys.includes(event.code)) {
            event.preventDefault();
            event.stopPropagation();

            // Show warning for Print Screen
            if (event.key === 'PrintScreen') {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Security Notice',
                    detail: 'Screenshots are disabled for protected content',
                    life: 3000
                });
            }
        }
    }

    private preventScreenshotKeys(event: KeyboardEvent): void {
        if (this.BLOCKED_KEYS.includes(event.code) || (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'C'))) {
            event.preventDefault();
            event.stopPropagation();

            if (event.key === 'PrintScreen') {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Security Notice',
                    detail: 'Screenshots are disabled for protected content',
                    life: 3000
                });
            }
        }
    }

    onRightClick(event: MouseEvent): void {
        if (this.previewVisible) {
            event.preventDefault();
            if ((this.previewUrl && this.isImage(this.previewName)) || this.isPdf(this.previewName)) {
                this.showProtectionMessage = true;
                setTimeout(() => {
                    this.showProtectionMessage = false;
                }, 3000);
            }
        }
    }
    onDragStart(event: DragEvent): void {
        if (this.previewVisible) {
            event.preventDefault();
        }
    }

    onSelectStart(event: Event): void {
        if (this.previewVisible) {
            event.preventDefault();
        }
    }

    // qc Methods
    get showqcButton(): boolean {
        const userRole = 'admin';
        const hasqc = this.request?.qualityCheck === null;
        const status = this.request?.qualityCheck?.status == 'Resubmitted';
        return (userRole === 'admin' && hasqc) || (status && !this.isqcInProgress);
    }

    startqc(): void {
        this.isqcInProgress = true;
        // whenever start QC it will start fresh
        this.resetAllqcChecks();
        this.messageService.add({
            severity: 'info',
            summary: 'QC Started',
            detail: 'Quality Check has been started'
        });
    }

    async approvedQc() {
        try {
            const payload = {
                requestId: this.request.id
            };

            const response: any = await this.reqService.approveQc(payload).pipe(takeUntil(this.destroy$)).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'QC Approved',
                detail: 'Quality Check has been Approved successfully'
            });

            this.isqcInProgress = false;
            this.request.qualityCheck = response.data.request.qualityCheck;
        } catch (error) {
            console.error('qc Approval error:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Approved Failed',
                detail: 'Failed to Approved qc. Please try again.'
            });
        }
    }

    verifySection(section: string): void {
        const sectionHandlers: { [key: string]: () => void } = {
            personalInfo: () => {
                [...this.personalFields, ...this.contactFields, ...this.passportFields, ...this.qatarResidentFields].forEach((field) => !field.status && this.markFieldCorrect(field));
            },
            employmentEducation: () => {
                this.employmentFields.forEach((field) => !field.status && this.markFieldCorrect(field));
                this.previousJobsData.forEach((_, index) => !this.previousJobsData[index].status && this.markPreviousJobCorrect(index));
                this.educationData.forEach((_, index) => !this.educationData[index].status && this.markEducationCorrect(index));
            },
            residencyTravelFamily: () => {
                this.residencesData.forEach((_, index) => !this.residencesData[index].status && this.markResidenceCorrect(index));
                this.otherNationalitiesData.forEach((_, index) => !this.otherNationalitiesData[index].status && this.markOtherNationalityCorrect(index));
                this.countriesVisitedData.forEach((_, index) => !this.countriesVisitedData[index].status && this.markCountryVisitCorrect(index));
                this.familyMembersData.forEach((_, index) => !this.familyMembersData[index].status && this.markFamilyMemberCorrect(index));
            },
            documents: () => this.request.documents.forEach((_: any, index: number) => !this.request.documents[index].status && this.markDocumentCorrect(index)),

            // Individual section handlers for specific arrays
            previousJobs: () => this.previousJobsData.forEach((_, index) => !this.previousJobsData[index].status && this.markPreviousJobCorrect(index)),
            education: () => this.educationData.forEach((_, index) => !this.educationData[index].status && this.markEducationCorrect(index)),
            residences: () => this.residencesData.forEach((_, index) => !this.residencesData[index].status && this.markResidenceCorrect(index)),
            otherNationalities: () => this.otherNationalitiesData.forEach((_, index) => !this.otherNationalitiesData[index].status && this.markOtherNationalityCorrect(index)),
            countriesVisited: () => this.countriesVisitedData.forEach((_, index) => !this.countriesVisitedData[index].status && this.markCountryVisitCorrect(index)),
            familyMembers: () => this.familyMembersData.forEach((_, index) => !this.familyMembersData[index].status && this.markFamilyMemberCorrect(index))
        };

        if (sectionHandlers[section]) {
            sectionHandlers[section]();
            this.messageService.add({
                severity: 'success',
                summary: 'Section Verified',
                detail: `${section} has been verified as correct`
            });
            this.calculateqcProgress(); // Recalculate progress after verification
        }
    }

    markFieldCorrect(field: FieldData): void {
        field.status = 'Correct';
        field.qcComment = 'Field is correct';
        this.addqcCheck(field, 'Correct', 'Field is correct', 'الحقل صحيح');
        this.calculateqcProgress(); // Add this line
    }

    markFieldWrong(field: FieldData): void {
        this.currentField = field;
        this.currentFieldStatus = 'Wrong';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
        this.showCommentDialog = true;
    }

    saveFieldComment(): void {
        if (this.currentField) {
            const targetObject = this.currentField._targetObject || this.currentField;

            targetObject.status = this.currentFieldStatus;
            targetObject.qcComment = this.currentFieldCommentEn;

            const corrections = this.currentFieldCorrections ? this.currentFieldCorrections.split('\n').filter((c) => c.trim()) : [];

            this.addqcCheck(this.currentField, this.currentFieldStatus, this.currentFieldCommentEn, this.currentFieldCommentAr, corrections);

            this.calculateqcProgress();

            delete this.currentField._targetObject;
        }

        this.showCommentDialog = false;
        this.resetFieldComment();
    }

    cancelFieldComment(): void {
        this.showCommentDialog = false;
        this.resetFieldComment();
    }

    private resetFieldComment(): void {
        this.currentField = null;
        this.currentFieldStatus = 'Correct';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
    }

    private addqcCheck(field: qcField, status: status, commentEn: string, commentAr: string, corrections: string[] = []): void {
        const existingIndex = this.qcChecks.findIndex((check) => check.fieldPath === field.fieldPath);

        const check: qcCheck = {
            fieldName: field.label,
            fieldPath: field.fieldPath,
            // fieldOldValue: field?.value,
            status,
            commentsEn: commentEn,
            commentsAr: commentAr,
            corrections
        };

        if (existingIndex >= 0) {
            this.qcChecks[existingIndex] = check;
        } else {
            this.qcChecks.push(check);
        }
    }

    async submitqc(): Promise<void> {
        if (this.qcChecks.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Checks',
                detail: 'Please perform at least one qc check before submitting'
            });
            return;
        }

        try {
            const payload = {
                requestId: this.request.id,
                qcChecks: this.qcChecks,
                descriptionEn: this.determineOverallStatus(),
                descriptionAr: 'شسيي شسيسش'
                // adminComments: 'qc completed via web interface'
            };

            const response: any = await this.reqService.submitqc(payload).pipe(takeUntil(this.destroy$)).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'QC Submitted',
                detail: 'Quality Check has been submitted successfully'
            });

            this.isqcInProgress = false;
            this.request.qualityCheck = response.data.request.qualityCheck;
        } catch (error) {
            console.error('qc submission error:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'QC Failed',
                detail: 'Failed to submit qc. Please try again.'
            });
        }
    }

    private determineOverallStatus(): status {
        const wrongCount = this.qcChecks.filter((check) => check.status === 'Wrong').length;
        const needsCorrectionCount = this.qcChecks.filter((check) => check.status === 'NeedCorrection').length;

        if (wrongCount > 0) return 'rejected';
        if (needsCorrectionCount > 0) return 'NeedCorrection';
        return 'approved';
    }

    // saveqcProgress(): void {
    //     const progress = {
    //         requestId: this.request.id,
    //         checks: this.qcChecks,
    //         timestamp: new Date().toISOString()
    //     };

    //     localStorage.setItem(`qc-progress-${this.request.id}`, JSON.stringify(progress));

    //     this.messageService.add({
    //         severity: 'info',
    //         summary: 'Progress Saved',
    //         detail: 'qc progress has been saved locally'
    //     });
    // }

    cancelqc(): void {
        this.isqcInProgress = false;
        this.qcChecks = [];

        this.calculateqcProgress();

        const status = this.request?.qualityCheck?.status ?? null;

        if (status === null) {
            this.resetAllqcChecks();
        }
        this.messageService.add({
            severity: 'info',
            summary: 'QC Cancelled',
            detail: 'Quality Check has been cancelled'
        });
    }

    private resetAllqcChecks(): void {
        const allFields = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.qatarResidentFields, ...this.employmentFields];

        allFields.forEach((field) => {
            delete field.status;
            delete field.qcComment;
        });

        const allArrays = [this.educationData, this.familyMembersData, this.previousJobsData, this.residencesData, this.otherNationalitiesData, this.countriesVisitedData];

        allArrays.forEach((array) => {
            array.forEach((item: any) => {
                delete item.status;
                delete item.qcComment;
            });
        });

        this.request.documents.forEach((doc: any) => {
            delete doc.status;
        });
    }

    // Individual qc methods for complex objects
    markEducationCorrect(index: number): void {
        const education = this.educationData[index];
        education.status = 'Correct';
        education.qcComment = 'Education record is correct';

        this.addqcCheck(
            {
                label: `Education ${index + 1}: ${education.qualification}`,
                fieldPath: `employmentAndEducation.educations[${index}]`,
                value: `${education.qualification} - ${education.university}`
            },
            'Correct',
            'Education record is correct',
            'سجل التعليم صحيح'
        );
        this.calculateqcProgress(); // Add this line
    }

    markEducationNeedsCorrection(index: number): void {
        const education = this.educationData[index];
        this.promptForFieldCorrection(
            {
                label: `Education ${index + 1}: ${education.qualification}`,
                fieldPath: `employmentAndEducation.educations[${index}]`,
                value: `${education.qualification} - ${education.university}`
            },
            education
        );
    }

    markPreviousJobCorrect(index: number): void {
        const job = this.previousJobsData[index];
        job.status = 'Correct';
        job.qcComment = 'Previous job record is correct';

        this.addqcCheck(
            {
                label: `Previous Job ${index + 1}`,
                fieldPath: `employmentAndEducation.previousJobs[${index}]`,
                value: `${job.entity} - ${job.title}`
            },
            'Correct',
            'Previous job record is correct',
            'سجل الوظيفة السابقة صحيح'
        );
        this.calculateqcProgress();
    }

    markPreviousJobNeedsCorrection(index: number): void {
        const job = this.previousJobsData[index];
        this.promptForFieldCorrection(
            {
                label: `Previous Job ${index + 1}`,
                fieldPath: `employmentAndEducation.previousJobs[${index}]`,
                value: `${job.entity} - ${job.title}`
            },
            job
        );
    }

    markResidenceCorrect(index: number): void {
        const residence = this.residencesData[index];
        residence.status = 'Correct';
        residence.qcComment = 'Residence record is correct';

        this.addqcCheck(
            {
                label: `Residence ${index + 1}`,
                fieldPath: `ResidencyAndTravelAndFamily.residences[${index}]`,
                value: `${residence.country} - ${residence.type}`
            },
            'Correct',
            'Residence record is correct',
            'سجل الإقامة صحيح'
        );
        this.calculateqcProgress();
    }

    markResidenceNeedsCorrection(index: number): void {
        const residence = this.residencesData[index];
        this.promptForFieldCorrection(
            {
                label: `Residence ${index + 1}`,
                fieldPath: `ResidencyAndTravelAndFamily.residences[${index}]`,
                value: `${residence.country} - ${residence.type}`
            },
            residence
        );
    }

    markOtherNationalityCorrect(index: number): void {
        const nationality = this.otherNationalitiesData[index];
        nationality.status = 'Correct';
        nationality.qcComment = 'Other nationality record is correct';

        this.addqcCheck(
            {
                label: `Other Nationality ${index + 1}: ${nationality.country}`,
                fieldPath: `ResidencyAndTravelAndFamily.otherNationalities[${index}]`,
                value: `${nationality.country} - ${nationality.passportNumber}`
            },
            'Correct',
            'Other nationality record is correct',
            'سجل الجنسية الأخرى صحيح'
        );
        this.calculateqcProgress();
    }

    markOtherNationalityNeedsCorrection(index: number): void {
        const nationality = this.otherNationalitiesData[index];
        this.promptForFieldCorrection(
            {
                label: `Other Nationality ${index + 1}: ${nationality.country}`,
                fieldPath: `ResidencyAndTravelAndFamily.otherNationalities[${index}]`,
                value: `${nationality.country} - ${nationality.passportNumber}`
            },
            nationality
        );
    }

    markCountryVisitCorrect(index: number): void {
        const visit = this.countriesVisitedData[index];
        visit.status = 'Correct';
        visit.qcComment = 'Country visit record is correct';

        this.addqcCheck(
            {
                label: `Country Visit ${index + 1}: ${visit.country}`,
                fieldPath: `ResidencyAndTravelAndFamily.countriesVisitedLast10Years[${index}]`,
                value: `${visit.country} - ${visit.period}`
            },
            'Correct',
            'Country visit record is correct',
            'سجل زيارة البلد صحيح'
        );
        this.calculateqcProgress();
    }

    markCountryVisitNeedsCorrection(index: number): void {
        const visit = this.countriesVisitedData[index];
        this.promptForFieldCorrection(
            {
                label: `Country Visit ${index + 1}: ${visit.country}`,
                fieldPath: `ResidencyAndTravelAndFamily.countriesVisitedLast10Years[${index}]`,
                value: `${visit.country} - ${visit.period}`
            },
            visit
        );
    }

    markFamilyMemberCorrect(index: number): void {
        const member = this.familyMembersData[index];
        member.status = 'Correct';
        member.qcComment = 'Family member information is correct';

        this.addqcCheck(
            {
                label: `Family Member: ${member.name}`,
                fieldPath: `ResidencyAndTravelAndFamily.familyMembers[${index}]`,
                value: `${member.name} - ${member.relation}`
            },
            'Correct',
            'Family member information is correct',
            'معلومات أفراد الأسرة صحيحة'
        );
        this.calculateqcProgress();
    }

    markFamilyMemberNeedsCorrection(index: number): void {
        const member = this.familyMembersData[index];
        this.promptForFieldCorrection(
            {
                label: `Family Member: ${member.name}`,
                fieldPath: `ResidencyAndTravelAndFamily.familyMembers[${index}]`,
                value: `${member.name} - ${member.relation}`
            },
            member
        );
    }

    markDocumentCorrect(index: number): void {
        const doc = this.request.documents[index];
        doc.status = 'Correct';

        this.addqcCheck(
            {
                label: `Document: ${this.formatDocumentName(doc.type)}`,
                fieldPath: `documents.${doc.type}`,
                value: doc.documentName || doc.type
            },
            'Correct',
            'Document is valid and complete',
            'الوثيقة صالحة وكاملة'
        );
        this.calculateqcProgress();
    }

    markDocumentNeedsCorrection(index: number): void {
        const doc = this.request.documents[index];
        this.promptForFieldCorrection(
            {
                label: `Document: ${this.formatDocumentName(doc.type)}`,
                fieldPath: `documents.${doc.type}`,
                value: doc.documentName || doc.type
            },
            doc
        );
    }

    // Helper to check if section has data for qc
    shouldShowSectionVerification(section: string): boolean {
        switch (section) {
            case 'previousJobs':
                return this.hasValidArrayData(this.previousJobsData);
            case 'education':
                return this.hasValidArrayData(this.educationData);
            case 'residences':
                return this.hasValidArrayData(this.residencesData);
            case 'otherNationalities':
                return this.hasValidArrayData(this.otherNationalitiesData);
            case 'countriesVisited':
                return this.hasValidArrayData(this.countriesVisitedData);
            case 'familyMembers':
                return this.hasValidArrayData(this.familyMembersData);
            case 'documents':
                return this.request?.documents?.length > 0;
            default:
                return true;
        }
    }

    private promptForFieldCorrection(fieldData: qcField, targetObject: any): void {
        this.currentField = {
            ...fieldData,
            value: fieldData.value || '',
            _targetObject: targetObject
        };
        this.currentFieldStatus = 'NeedCorrection';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
        this.showCommentDialog = true;
    }

    // Helper Methods
    private getStageIcon(status: string): string {
        const statusMap: { [key: string]: string } = {
            approved: 'pi pi-check',
            pending: 'pi pi-hourglass',
            draft: 'pi pi-pencil',
            rejected: 'pi pi-times'
        };
        return statusMap[status.toLowerCase()] || 'pi pi-circle-on';
    }

    private getStageColor(status: string): string {
        const colorMap: { [key: string]: string } = {
            approved: '#16a34a',
            pending: '#202a5a',
            rejected: '#92193b',
            draft: '#4e7cf2'
        };
        return colorMap[status.toLowerCase()] || '#9ca3af';
    }

    getqcStatusText(status: string): string {
        const statusMap: { [key: string]: string } = {
            correct: 'Correct',
            wrong: 'Wrong',
            needsCorrection: 'Needs Correction',
            approved: 'Approved',
            rejected: 'Rejected'
        };
        return statusMap[status] || status;
    }

    // File Type Detection
    isImage(filename: string | null): boolean {
        return this.hasExtension(filename, this.FILE_EXTENSIONS.IMAGES);
    }

    isPdf(filename: string | null): boolean {
        return this.hasExtension(filename, this.FILE_EXTENSIONS.PDF);
    }

    isWord(filename: string | null): boolean {
        return this.hasExtension(filename, this.FILE_EXTENSIONS.WORD);
    }

    isExcel(filename: string | null): boolean {
        return this.hasExtension(filename, this.FILE_EXTENSIONS.EXCEL);
    }

    isPowerPoint(filename: string | null): boolean {
        return this.hasExtension(filename, this.FILE_EXTENSIONS.POWERPOINT);
    }

    isDocument(filename: string | null): boolean {
        const docExtensions = [...this.FILE_EXTENSIONS.WORD, ...this.FILE_EXTENSIONS.EXCEL, ...this.FILE_EXTENSIONS.POWERPOINT, '.txt'];
        return this.hasExtension(filename, docExtensions);
    }

    private hasExtension(filename: string | null, extensions: string[]): boolean {
        if (!filename) return false;
        return extensions.some((ext) => filename.toLowerCase().endsWith(ext));
    }

    getFileIcon(filename: string | null): string {
        if (!filename) return 'pi pi-file';
        if (this.isImage(filename)) return 'pi pi-image';
        if (this.isPdf(filename)) return 'pi pi-file-pdf';
        if (this.isWord(filename)) return 'pi pi-file-word';
        if (this.isExcel(filename)) return 'pi pi-file-excel';
        return 'pi pi-file';
    }

    getFileExtension(filename: string | null): string {
        if (!filename) return 'FILE';
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
    }

    formatDocumentName(name: string): string {
        if (!name) return '';
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, (c) => c.toUpperCase());
    }

    // Navigation
    scrollTo(sectionId: string): void {
        this.activeSection = sectionId;
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // @HostListener('window:scroll', [])
    // onWindowScroll(): void {
    //     const offset = 80;
    //     for (const section of this.SECTIONS) {
    //         const element = document.getElementById(section);
    //         if (!element) continue;

    //         const rect = element.getBoundingClientRect();
    //         if (rect.top <= offset && rect.bottom > offset) {
    //             this.activeSection = section;
    //             break;
    //         }
    //     }
    // }

    currentPdfBlob: Blob | null = null;

    // Document Preview
    openPreview(doc: any): void {
        this.previewName = doc?.documentName?.replace('.enc', '') || doc?.type || 'Document';
        this.previewVisible = true;
        this.pdfLoading = false;
        this.pdfError = false;
        this.pdfSrc = '';
        this.previewUrl = null; // Reset previewUrl for PDFs

        this.currentPdfBlob = null;

        this.reqService
            .previewDocument(doc.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: Blob) => {
                    console.log('Received blob:', response);
                    console.log('Blob size:', response.size);
                    console.log('Blob type:', response.type);
                    this.currentPdfBlob = response;

                    // Handle PDF files with ng2-pdf-viewer
                    if (this.isPdf(this.previewName)) {
                        this.loadPdf(response);
                    } else {
                        // For non-PDF files
                        const blob = new Blob([response], { type: response.type });
                        this.previewUrl = URL.createObjectURL(blob);
                    }
                },
                error: (error) => {
                    console.error('Error previewing document:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Preview Error',
                        detail: 'Unable to preview document'
                    });
                    this.previewUrl = null;
                    this.pdfError = true;
                }
            });
    }

    retryPdfLoad(): void {
        if (this.currentPdfBlob) {
            this.loadPdf(this.currentPdfBlob);
        }
    }

    private checkPdfViewerState(): void {
        console.log('PDF Viewer State:', {
            pdfLoading: this.pdfLoading,
            pdfError: this.pdfError,
            pdfSrc: this.pdfSrc,
            previewName: this.previewName,
            showPdfViewer: this.showPdfViewer,
            showPdfContainer: this.showPdfContainer
        });
    }

    // PDF Viewer Methods
    loadPdf(blob: Blob): void {
        this.pdfLoading = true;
        this.pdfError = false;
        this.pdfSrc = '';

        console.log('Starting PDF load...');

        // Use setTimeout to ensure the loading state is set
        setTimeout(() => {
            try {
                // Create blob URL
                const pdfUrl = URL.createObjectURL(blob);
                this.pdfSrc = pdfUrl;
                console.log('PDF source set:', pdfUrl);

                // Force change detection
                this.cdRef.detectChanges();

                // Set a timeout to auto-complete loading (fallback)
                setTimeout(() => {
                    if (this.pdfLoading) {
                        console.log('Auto-completing PDF load (fallback)');
                        this.pdfLoading = false;
                        this.cdRef.detectChanges();
                    }
                }, 2000);
            } catch (error) {
                console.error('Error loading PDF:', error);
                this.pdfError = true;
                this.pdfLoading = false;
                this.cdRef.detectChanges();
            }
        });
    }

    getFallbackPdfUrl(): string {
        if (this.currentPdfBlob) {
            return URL.createObjectURL(this.currentPdfBlob);
        }
        return '';
    }

    onPdfLoad(event: any): void {
        console.log('✅ PDF loaded successfully!', event);
        this.pdfLoading = false;
        this.cdRef.detectChanges();
    }

    onPdfError(error: any): void {
        console.error('❌ PDF loading error:', error);
        this.pdfError = true;
        this.pdfLoading = false;
        this.cdRef.detectChanges();
    }

    // SIMPLIFIED visibility check
    get showPdfViewer(): boolean {
        return !!this.pdfSrc && !this.pdfLoading && !this.pdfError;
    }

    onTextLayerRendered(event: any): void {
        console.log('PDF text layer rendered:', event);
    }

    // Add this method to check if we should show PDF container
    get showPdfContainer(): boolean {
        return this.isPdf(this.previewName);
    }

    onPageRendered(event: any): void {
        // PDF page rendered successfully
        console.log('PDF page rendered:', event);
    }

    // Zoom controls for PDF
    zoomIn(): void {
        this.pdfZoom += 0.1;
    }

    zoomOut(): void {
        if (this.pdfZoom > 0.2) {
            this.pdfZoom -= 0.1;
        }
    }

    resetZoom(): void {
        this.pdfZoom = 1.0;
    }

    // Stage Actions
    approveStage(stage: ApplicationStage): void {
        if (!stage) return;
        console.log(`Approved stage: ${stage.name}`);
        stage.status = 'Approved';
        stage.color = this.getStageColor('approved');
        stage.icon = this.getStageIcon('approved');
    }

    rejectStage(stage: ApplicationStage): void {
        if (!stage) return;
        console.log(`Rejected stage: ${stage.name}`);
        stage.status = 'Rejected';
        stage.color = this.getStageColor('rejected');
        stage.icon = this.getStageIcon('rejected');
    }

    // qc Progress Calculation
    private calculateqcProgress(): void {
        // Count basic fields (personal, passport, contact, employment, identification)
        const basicFieldsCount = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields, ...this.qatarResidentFields].length;

        // Count array items ONLY if they have valid data
        const arrayItemsCount =
            (this.hasValidArrayData(this.educationData) ? this.educationData.length : 0) +
            (this.hasValidArrayData(this.previousJobsData) ? this.previousJobsData.length : 0) +
            (this.hasValidArrayData(this.residencesData) ? this.residencesData.length : 0) +
            (this.hasValidArrayData(this.otherNationalitiesData) ? this.otherNationalitiesData.length : 0) +
            (this.hasValidArrayData(this.countriesVisitedData) ? this.countriesVisitedData.length : 0) +
            (this.hasValidArrayData(this.familyMembersData) ? this.familyMembersData.length : 0);

        // Count documents (each document counts as 1)
        const documentsCount = this.request?.documents?.length || 0;

        // Total fields to check
        this.qcProgress.total = basicFieldsCount + arrayItemsCount + documentsCount;

        // Count checked basic fields
        const checkedBasicFields = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields, ...this.identificationFields, ...this.qatarResidentFields].filter((field) => field.status).length;

        // Count checked array items (only from valid arrays)
        const checkedArrayItems =
            (this.hasValidArrayData(this.educationData) ? this.educationData.filter((edu) => edu.status).length : 0) +
            (this.hasValidArrayData(this.previousJobsData) ? this.previousJobsData.filter((job) => job.status).length : 0) +
            (this.hasValidArrayData(this.residencesData) ? this.residencesData.filter((res) => res.status).length : 0) +
            (this.hasValidArrayData(this.otherNationalitiesData) ? this.otherNationalitiesData.filter((nat) => nat.status).length : 0) +
            (this.hasValidArrayData(this.countriesVisitedData) ? this.countriesVisitedData.filter((visit) => visit.status).length : 0) +
            (this.hasValidArrayData(this.familyMembersData) ? this.familyMembersData.filter((family) => family.status).length : 0);

        // Count checked documents
        const checkedDocuments = this.request?.documents?.filter((doc: any) => doc.status)?.length || 0;

        // Total checked fields
        this.qcProgress.checked = checkedBasicFields + checkedArrayItems + checkedDocuments;
    }

    private loadExistingqcChecks(): void {
        if (!this.request?.qualityCheck?.meta) return;

        const allFields = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields, ...this.qatarResidentFields];

        this.request.qualityCheck.meta.forEach((check: qcCheck) => {
            // Load basic fields
            const field = allFields.find((f) => f.fieldPath === check.fieldPath);
            if (field) {
                field.status = check.status;
                field.qcComment = check.commentsEn;
            }

            // Load education qc status
            this.loadArrayqcCheck(check, 'employmentAndEducation.educations', this.educationData);

            // Load previous jobs qc status
            this.loadArrayqcCheck(check, 'employmentAndEducation.previousJobs', this.previousJobsData);

            // Load residences qc status
            this.loadArrayqcCheck(check, 'ResidencyAndTravelAndFamily.residences', this.residencesData);

            // Load other nationalities qc status
            this.loadArrayqcCheck(check, 'ResidencyAndTravelAndFamily.otherNationalities', this.otherNationalitiesData);

            // Load countries visited qc status
            this.loadArrayqcCheck(check, 'ResidencyAndTravelAndFamily.countriesVisitedLast10Years', this.countriesVisitedData);

            // Load family members qc status
            this.loadArrayqcCheck(check, 'ResidencyAndTravelAndFamily.familyMembers', this.familyMembersData);

            // Load documents qc status
            if (check.fieldPath.startsWith('documents.')) {
                const docType = check.fieldPath.replace('documents.', '');
                const doc = this.request.documents.find((d: any) => d.type === docType);
                if (doc) {
                    doc.status = check.status;
                }
            }
        });
    }

    private loadArrayqcCheck(check: qcCheck, arrayPath: string, targetArray: any[]): void {
        const regex = new RegExp(`${arrayPath}\\[(\\d+)\\]`);
        const match = check.fieldPath.match(regex);

        if (match && targetArray[parseInt(match[1])]) {
            targetArray[parseInt(match[1])].status = check.status;
            targetArray[parseInt(match[1])].qcComment = check.commentsEn;
        }
    }

    getFileTypeInfo(filename: string | null): string {
        if (!filename) return 'Unknown file type';

        if (this.isImage(filename)) return 'Image File';
        if (this.isPdf(filename)) return 'PDF Document';
        if (this.isWord(filename)) return 'Microsoft Word Document';
        if (this.isExcel(filename)) return 'Microsoft Excel Spreadsheet';
        if (this.isPowerPoint(filename)) return 'Microsoft PowerPoint';

        return 'Document File';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.removeSecurityProtection();

        // Clean up object URLs
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
        }
        if (typeof this.pdfSrc === 'string' && this.pdfSrc.startsWith('blob:')) {
            URL.revokeObjectURL(this.pdfSrc);
        }
    }

    hasEmploymentDetails(): boolean {
        const employment = this.request?.employmentAndEducation?.employmentDetails || {};
        return Object.values(employment).some((value) => value !== null && value !== '');
    }

    // Helper method to get applicant name
    getApplicantName(): string {
        const nameEn = this.request?.personalInfo?.applicantInfo?.nameEn;
        const nameAr = this.request?.personalInfo?.applicantInfo?.nameAr;
        return nameEn || nameAr || 'N/A';
    }

    // Helper method for status severity
    getStatusSeverity(status: string): string {
        if (!status) return 'secondary';

        const statusMap: { [key: string]: string } = {
            approved: 'success',
            'qc approved': 'success',
            resubmitted: 'warning',
            pending: 'warning',
            draft: 'info',
            rejected: 'danger'
        };

        return statusMap[status.toLowerCase()] || 'secondary';
    }

    // Helper method for qc status severity
    getqcStatusSeverity(status: string): string {
        const statusMap: { [key: string]: string } = {
            approved: 'success',
            correct: 'success',
            pending: 'warning',
            needsCorrection: 'warning',
            rejected: 'danger',
            wrong: 'danger'
        };
        return statusMap[status?.toLowerCase()] || 'secondary';
    }

    formatFieldValue(value: any): string {
        if (value === null || value === undefined) return '-';

        // Array
        if (Array.isArray(value)) {
            return value.map((v) => this.formatFieldValue(v)).join(', ');
        }

        // Object
        if (typeof value === 'object') {
            return Object.entries(value)
                .map(([key, val]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

                    return `${label}: ${this.formatFieldValue(val)}`;
                })
                .join(', ');
        }

        // Primitive (string, number, boolean)
        return value.toString();
    }

    private qcButtonVisibilityMap: Record<string, QCButton[]> = {
        null: ['START_QC'],

        Resubmitted: ['APPROVED_QC', 'START_QC'],

        'Action Required': []
    };

    isButtonVisible(button: QCButton): boolean {
        const jusourStatus = this.request?.status?.jusour?.[0]?.status?.toLowerCase();

        if (jusourStatus === 'approved' || jusourStatus === 'rejected') {
            return false;
        }

        if (this.isqcInProgress) {
            return [''].includes(button);
        }

        const status = this.request?.qualityCheck?.status ?? 'null';
        return this.qcButtonVisibilityMap[status]?.includes(button) ?? false;
    }

    // confirmation modal
    conformation: boolean = false;
    conformationText: string = '';

    async showReasonDialog(status: string) {
        this.conformationText = status;
        this.conformation = true;
    }

    buildCommentForm(): void {
        this.formComment = this.fb.group({
            commentsEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            commentsAr: ['', [Validators.minLength(3), Validators.maxLength(200)]]
        });
    }

    async updateStatus() {
        if (this.formComment.invalid) {
            console.warn('Form invalid', this.formComment);
            return;
        }
        const id = this.request.id;
        try {
            const payload = {
                status: this.conformationText,
                commentsEn: this.formComment.value.commentsEn,
                commentsAr: this.formComment.value.commentsAr
            };

            const response: any = await this.reqService.requestUpdateStatus(payload, id).pipe(takeUntil(this.destroy$)).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: this.conformationText,
                detail: `Request has been ${this.conformationText} successfully`
            });
            this.isqcInProgress = false;
            this.request.qualityCheck = response.data.request.qualityCheck;
            this.conformation = false;
        } catch (error) {
            console.error('status:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Status Failed',
                detail: 'Failed to update status. Please try again.'
            });
        }
    }

    confirm1(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Save'
            },
            accept: () => {
                this.approvedQc();
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You have rejected',
                    life: 3000
                });
            }
        });
    }
}
