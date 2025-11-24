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
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { SafeUrlPipe } from '@/pipes/safe-url.pipe';
import { RequestService } from '@/services/request.service';
import { ImageModule } from 'primeng/image';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Divider } from 'primeng/divider';

// Interfaces for type safety
interface QVCCheck {
    fieldName: string;
    fieldPath: string;
    status: QVCStatus;
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
    qvcStatus?: QVCStatus;
    qvcComment?: string;
    _targetObject?: any;
}

interface QVCField {
    label: string;
    fieldPath: string;
    value?: string;
    qvcStatus?: QVCStatus;
    qvcComment?: string;
    _targetObject?: any;
}

interface QVCProgress {
    checked: number;
    total: number;
}

type QVCStatus = 'correct' | 'wrong' | 'needsCorrection' | 'approved' | 'rejected';

@Component({
    selector: 'app-view-single-application',
    standalone: true,
    imports: [ImageModule, CommonModule, RouterModule, CardModule, ButtonModule, TagModule, DialogModule, TooltipModule, SelectModule, TextareaModule, FormsModule, PdfViewerModule, Divider],
    templateUrl: './view-single-application.component.html',
    styleUrls: ['./view-single-application.component.scss']
})
export class ViewSingleApplicationComponent implements OnInit, OnDestroy {
    @ViewChild('contentContainer', { static: true }) contentContainer!: ElementRef<HTMLDivElement>;

    // Component state
    request: any = null;
    stages: ApplicationStage[] = [];
    activeSection = 'personal';

    identificationFields: FieldData[] = [];
    qatarResidentFields: FieldData[] = [];

    readonly SECTIONS: string[] = ['overview', 'personal', 'employment', 'residency', 'documents', 'qvc'];

    // Preview state
    previewVisible = false;
    previewUrl: string | null = null;
    previewName: string | null = null;

    // PDF Viewer state
    pdfSrc: string = '';
    pdfLoading = false;
    pdfError = false;
    pdfZoom = 1.0;

    // QVC state
    isQVCInProgress = false;
    showQVCDetails = false;
    showCommentDialog = false;
    qvcChecks: QVCCheck[] = [];
    currentField: QVCField | null = null;
    currentFieldStatus: QVCStatus = 'correct';
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

    // Constants
    readonly QVC_STATUS_OPTIONS = [
        { label: 'Correct', value: 'correct' },
        { label: 'Wrong', value: 'wrong' },
        { label: 'Needs Correction', value: 'needsCorrection' }
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
    qvcProgress: QVCProgress = { checked: 0, total: 0 };

    private destroy$ = new Subject<void>();
    private securityEventListeners: { [key: string]: (event: any) => void } = {};

    constructor(
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private messageService: MessageService,
        private reqService: RequestService,
        private cdRef: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.initializeComponent();
        }
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
        this.calculateQVCProgress();
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
        const identification = this.request?.metas || {};

        // Initialize data arrays
        this.educationData = this.request?.employmentAndEducation?.educations || [];
        this.familyMembersData = this.request?.ResidencyAndTravelAndFamily?.familyMembers || [];
        this.previousJobsData = this.request?.employmentAndEducation?.previousJobs || [];
        this.residencesData = this.request?.ResidencyAndTravelAndFamily?.residences || [];
        this.otherNationalitiesData = this.request?.ResidencyAndTravelAndFamily?.otherNationalities || [];
        this.countriesVisitedData = this.request?.ResidencyAndTravelAndFamily?.countriesVisitedLast10Years || [];

        // Build field arrays
        this.identificationFields = this.buildIdentificationFields(identification);
        console.log(this.identificationFields);

        this.personalFields = this.buildPersonalFields(pi);
        this.passportFields = this.buildPassportFields(passport);
        this.contactFields = this.buildContactFields(contact);
        this.employmentFields = this.buildEmploymentFields(employment);
        this.qatarResidentFields = this.buildQatarResidentFields(pi);

        this.loadExistingQVCChecks();
    }

    private buildIdentificationFields(identificationData: any): FieldData[] {
        const fieldMappings = [
            { slug: 'catSlug', label: 'Category', fieldPath: 'metas.category', nameField: 'category' },
            { slug: 'subCatSlug', label: 'Sub Category', fieldPath: 'metas.subCategory', nameField: 'subCategory' },
            { slug: 'sectorSlug', label: 'Sector', fieldPath: 'metas.sector', nameField: 'sector' },
            { slug: 'activitySlug', label: 'Activity', fieldPath: 'metas.activity', nameField: 'activity' },
            { slug: 'subActivitySlug', label: 'Sub Activity', fieldPath: 'metas.subActivity', nameField: 'subActivity' },
            { slug: 'entitySlug', label: 'Entity', fieldPath: 'metas.entity', nameField: 'entity' },
            { slug: 'incubatorSlug', label: 'Incubator', fieldPath: 'metas.incubator', nameField: 'incubator' }
        ];

        return fieldMappings
            .filter((mapping) => identificationData[mapping.slug]) // Only include if slug exists
            .map((mapping) => ({
                label: mapping.label,
                value: identificationData[mapping.nameField]?.name || identificationData[mapping.slug],
                fieldPath: mapping.fieldPath
            }));
    }

    private buildQatarResidentFields(personalInfo: any): FieldData[] {
        if (!personalInfo.areYouQatarResident) return [];

        return [
            { label: 'QID Type', value: personalInfo.qidType || null, fieldPath: 'personalInfo.applicantInfo.qidType' },
            { label: 'QID Number', value: personalInfo.qidNumber || null, fieldPath: 'personalInfo.applicantInfo.qidNumber' },
            { label: 'Work Permit', value: personalInfo.workPermit || null, fieldPath: 'personalInfo.applicantInfo.workPermit' },
            { label: 'Maintain Work Permit', value: personalInfo.maintainWorkPermit || null, fieldPath: 'personalInfo.applicantInfo.maintainWorkPermit' }
        ];
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
        const catSlug = this.request?.metas?.catSlug;

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
            ]
        };

        return fieldMappings[catSlug] || [];
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

    // QVC Methods
    get showQVCButton(): boolean {
        const userRole = 'admin';
        const hasQVC = !!this.request?.qvc;
        const isPending = this.applicationStageStatus.toLowerCase() === 'pending';

        return userRole === 'admin' && !hasQVC && isPending && !this.isQVCInProgress;
    }

    startQVC(): void {
        this.isQVCInProgress = true;
        this.messageService.add({
            severity: 'info',
            summary: 'QVC Started',
            detail: 'Quality Verification Check has been started'
        });
    }

    verifySection(section: string): void {
        const sectionHandlers: { [key: string]: () => void } = {
            personalInfo: () => {
                [...this.identificationFields, ...this.personalFields, ...this.contactFields, ...this.passportFields].forEach((field) => !field.qvcStatus && this.markFieldCorrect(field));
            },
            employmentEducation: () => {
                this.employmentFields.forEach((field) => !field.qvcStatus && this.markFieldCorrect(field));
                this.previousJobsData.forEach((_, index) => !this.previousJobsData[index].qvcStatus && this.markPreviousJobCorrect(index));
                this.educationData.forEach((_, index) => !this.educationData[index].qvcStatus && this.markEducationCorrect(index));
            },
            residencyTravelFamily: () => {
                this.residencesData.forEach((_, index) => !this.residencesData[index].qvcStatus && this.markResidenceCorrect(index));
                this.otherNationalitiesData.forEach((_, index) => !this.otherNationalitiesData[index].qvcStatus && this.markOtherNationalityCorrect(index));
                this.countriesVisitedData.forEach((_, index) => !this.countriesVisitedData[index].qvcStatus && this.markCountryVisitCorrect(index));
                this.familyMembersData.forEach((_, index) => !this.familyMembersData[index].qvcStatus && this.markFamilyMemberCorrect(index));
            },
            documents: () => this.request.documents.forEach((_: any, index: number) => !this.request.documents[index].qvcStatus && this.markDocumentCorrect(index)),

            // Individual section handlers for specific arrays
            previousJobs: () => this.previousJobsData.forEach((_, index) => !this.previousJobsData[index].qvcStatus && this.markPreviousJobCorrect(index)),
            education: () => this.educationData.forEach((_, index) => !this.educationData[index].qvcStatus && this.markEducationCorrect(index)),
            residences: () => this.residencesData.forEach((_, index) => !this.residencesData[index].qvcStatus && this.markResidenceCorrect(index)),
            otherNationalities: () => this.otherNationalitiesData.forEach((_, index) => !this.otherNationalitiesData[index].qvcStatus && this.markOtherNationalityCorrect(index)),
            countriesVisited: () => this.countriesVisitedData.forEach((_, index) => !this.countriesVisitedData[index].qvcStatus && this.markCountryVisitCorrect(index)),
            familyMembers: () => this.familyMembersData.forEach((_, index) => !this.familyMembersData[index].qvcStatus && this.markFamilyMemberCorrect(index))
        };

        if (sectionHandlers[section]) {
            sectionHandlers[section]();
            this.messageService.add({
                severity: 'success',
                summary: 'Section Verified',
                detail: `${section} has been verified as correct`
            });
            this.calculateQVCProgress(); // Recalculate progress after verification
        }
    }

    markFieldCorrect(field: FieldData): void {
        field.qvcStatus = 'correct';
        field.qvcComment = 'Field is correct';
        this.addQVCCheck(field, 'correct', 'Field is correct', 'الحقل صحيح');
        this.calculateQVCProgress(); // Add this line
    }

    markFieldWrong(field: FieldData): void {
        this.currentField = field;
        this.currentFieldStatus = 'wrong';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
        this.showCommentDialog = true;
    }

    saveFieldComment(): void {
        if (this.currentField) {
            const targetObject = this.currentField._targetObject || this.currentField;

            targetObject.qvcStatus = this.currentFieldStatus;
            targetObject.qvcComment = this.currentFieldCommentEn;

            const corrections = this.currentFieldCorrections ? this.currentFieldCorrections.split('\n').filter((c) => c.trim()) : [];

            this.addQVCCheck(this.currentField, this.currentFieldStatus, this.currentFieldCommentEn, this.currentFieldCommentAr, corrections);

            this.calculateQVCProgress();

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
        this.currentFieldStatus = 'correct';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
    }

    private addQVCCheck(field: QVCField, status: QVCStatus, commentEn: string, commentAr: string, corrections: string[] = []): void {
        const existingIndex = this.qvcChecks.findIndex((check) => check.fieldPath === field.fieldPath);

        const check: QVCCheck = {
            fieldName: field.label,
            fieldPath: field.fieldPath,
            status,
            commentsEn: commentEn,
            commentsAr: commentAr,
            corrections
        };

        if (existingIndex >= 0) {
            this.qvcChecks[existingIndex] = check;
        } else {
            this.qvcChecks.push(check);
        }
    }

    async submitQVC(): Promise<void> {
        if (this.qvcChecks.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Checks',
                detail: 'Please perform at least one QVC check before submitting'
            });
            return;
        }

        try {
            const payload = {
                requestId: this.request.id,
                qvcChecks: this.qvcChecks,
                overallStatus: this.determineOverallStatus(),
                adminComments: 'QVC completed via web interface'
            };

            const response: any = await this.reqService.submitQVC(payload).pipe(takeUntil(this.destroy$)).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'QVC Submitted',
                detail: 'Quality Verification Check has been submitted successfully'
            });

            this.isQVCInProgress = false;
            this.request.qvc = response.data.request.qvc;
        } catch (error) {
            console.error('QVC submission error:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'QVC Failed',
                detail: 'Failed to submit QVC. Please try again.'
            });
        }
    }

    private determineOverallStatus(): QVCStatus {
        const wrongCount = this.qvcChecks.filter((check) => check.status === 'wrong').length;
        const needsCorrectionCount = this.qvcChecks.filter((check) => check.status === 'needsCorrection').length;

        if (wrongCount > 0) return 'rejected';
        if (needsCorrectionCount > 0) return 'needsCorrection';
        return 'approved';
    }

    // saveQVCProgress(): void {
    //     const progress = {
    //         requestId: this.request.id,
    //         checks: this.qvcChecks,
    //         timestamp: new Date().toISOString()
    //     };

    //     localStorage.setItem(`qvc-progress-${this.request.id}`, JSON.stringify(progress));

    //     this.messageService.add({
    //         severity: 'info',
    //         summary: 'Progress Saved',
    //         detail: 'QVC progress has been saved locally'
    //     });
    // }

    cancelQVC(): void {
        this.isQVCInProgress = false;
        this.qvcChecks = [];
        this.resetAllQVCChecks();
        this.calculateQVCProgress();

        this.messageService.add({
            severity: 'info',
            summary: 'QVC Cancelled',
            detail: 'Quality Verification Check has been cancelled'
        });
    }

    private resetAllQVCChecks(): void {
        const allFields = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields];

        allFields.forEach((field) => {
            delete field.qvcStatus;
            delete field.qvcComment;
        });

        const allArrays = [this.educationData, this.familyMembersData, this.previousJobsData, this.residencesData, this.otherNationalitiesData, this.countriesVisitedData];

        allArrays.forEach((array) => {
            array.forEach((item: any) => {
                delete item.qvcStatus;
                delete item.qvcComment;
            });
        });

        this.request.documents.forEach((doc: any) => {
            delete doc.qvcStatus;
        });
    }

    // Individual QVC methods for complex objects
    markEducationCorrect(index: number): void {
        const education = this.educationData[index];
        education.qvcStatus = 'correct';
        education.qvcComment = 'Education record is correct';

        this.addQVCCheck(
            {
                label: `Education ${index + 1}: ${education.qualification}`,
                fieldPath: `employmentAndEducation.educations[${index}]`,
                value: `${education.qualification} - ${education.university}`
            },
            'correct',
            'Education record is correct',
            'سجل التعليم صحيح'
        );
        this.calculateQVCProgress(); // Add this line
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
        job.qvcStatus = 'correct';
        job.qvcComment = 'Previous job record is correct';

        this.addQVCCheck(
            {
                label: `Previous Job ${index + 1}`,
                fieldPath: `employmentAndEducation.previousJobs[${index}]`,
                value: `${job.entity} - ${job.title}`
            },
            'correct',
            'Previous job record is correct',
            'سجل الوظيفة السابقة صحيح'
        );
        this.calculateQVCProgress();
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
        residence.qvcStatus = 'correct';
        residence.qvcComment = 'Residence record is correct';

        this.addQVCCheck(
            {
                label: `Residence ${index + 1}`,
                fieldPath: `ResidencyAndTravelAndFamily.residences[${index}]`,
                value: `${residence.country} - ${residence.type}`
            },
            'correct',
            'Residence record is correct',
            'سجل الإقامة صحيح'
        );
        this.calculateQVCProgress();
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
        nationality.qvcStatus = 'correct';
        nationality.qvcComment = 'Other nationality record is correct';

        this.addQVCCheck(
            {
                label: `Other Nationality ${index + 1}: ${nationality.country}`,
                fieldPath: `ResidencyAndTravelAndFamily.otherNationalities[${index}]`,
                value: `${nationality.country} - ${nationality.passportNumber}`
            },
            'correct',
            'Other nationality record is correct',
            'سجل الجنسية الأخرى صحيح'
        );
        this.calculateQVCProgress();
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
        visit.qvcStatus = 'correct';
        visit.qvcComment = 'Country visit record is correct';

        this.addQVCCheck(
            {
                label: `Country Visit ${index + 1}: ${visit.country}`,
                fieldPath: `ResidencyAndTravelAndFamily.countriesVisitedLast10Years[${index}]`,
                value: `${visit.country} - ${visit.period}`
            },
            'correct',
            'Country visit record is correct',
            'سجل زيارة البلد صحيح'
        );
        this.calculateQVCProgress();
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
        member.qvcStatus = 'correct';
        member.qvcComment = 'Family member information is correct';

        this.addQVCCheck(
            {
                label: `Family Member: ${member.name}`,
                fieldPath: `ResidencyAndTravelAndFamily.familyMembers[${index}]`,
                value: `${member.name} - ${member.relation}`
            },
            'correct',
            'Family member information is correct',
            'معلومات أفراد الأسرة صحيحة'
        );
        this.calculateQVCProgress();
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
        doc.qvcStatus = 'correct';

        this.addQVCCheck(
            {
                label: `Document: ${this.formatDocumentName(doc.type)}`,
                fieldPath: `documents.${doc.type}`,
                value: doc.documentName || doc.type
            },
            'correct',
            'Document is valid and complete',
            'الوثيقة صالحة وكاملة'
        );
        this.calculateQVCProgress();
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

    // Helper to check if section has data for QVC
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

    private promptForFieldCorrection(fieldData: QVCField, targetObject: any): void {
        this.currentField = {
            ...fieldData,
            value: fieldData.value || '',
            _targetObject: targetObject
        };
        this.currentFieldStatus = 'needsCorrection';
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

    getQVCStatusText(status: string): string {
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

    // QVC Progress Calculation
    private calculateQVCProgress(): void {
        // Count basic fields (personal, passport, contact, employment, identification)
        const basicFieldsCount = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields, ...this.identificationFields, ...this.qatarResidentFields].length;

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
        this.qvcProgress.total = basicFieldsCount + arrayItemsCount + documentsCount;

        // Count checked basic fields
        const checkedBasicFields = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields, ...this.identificationFields, ...this.qatarResidentFields].filter((field) => field.qvcStatus).length;

        // Count checked array items (only from valid arrays)
        const checkedArrayItems =
            (this.hasValidArrayData(this.educationData) ? this.educationData.filter((edu) => edu.qvcStatus).length : 0) +
            (this.hasValidArrayData(this.previousJobsData) ? this.previousJobsData.filter((job) => job.qvcStatus).length : 0) +
            (this.hasValidArrayData(this.residencesData) ? this.residencesData.filter((res) => res.qvcStatus).length : 0) +
            (this.hasValidArrayData(this.otherNationalitiesData) ? this.otherNationalitiesData.filter((nat) => nat.qvcStatus).length : 0) +
            (this.hasValidArrayData(this.countriesVisitedData) ? this.countriesVisitedData.filter((visit) => visit.qvcStatus).length : 0) +
            (this.hasValidArrayData(this.familyMembersData) ? this.familyMembersData.filter((family) => family.qvcStatus).length : 0);

        // Count checked documents
        const checkedDocuments = this.request?.documents?.filter((doc: any) => doc.qvcStatus)?.length || 0;

        // Total checked fields
        this.qvcProgress.checked = checkedBasicFields + checkedArrayItems + checkedDocuments;
    }

    private loadExistingQVCChecks(): void {
        if (!this.request?.qvc?.qvcChecks) return;

        const allFields = [...this.personalFields, ...this.passportFields, ...this.contactFields, ...this.employmentFields];

        this.request.qvc.qvcChecks.forEach((check: QVCCheck) => {
            // Load basic fields
            const field = allFields.find((f) => f.fieldPath === check.fieldPath);
            if (field) {
                field.qvcStatus = check.status;
                field.qvcComment = check.commentsEn;
            }

            // Load education QVC status
            this.loadArrayQVCCheck(check, 'employmentAndEducation.educations', this.educationData);

            // Load previous jobs QVC status
            this.loadArrayQVCCheck(check, 'employmentAndEducation.previousJobs', this.previousJobsData);

            // Load residences QVC status
            this.loadArrayQVCCheck(check, 'ResidencyAndTravelAndFamily.residences', this.residencesData);

            // Load other nationalities QVC status
            this.loadArrayQVCCheck(check, 'ResidencyAndTravelAndFamily.otherNationalities', this.otherNationalitiesData);

            // Load countries visited QVC status
            this.loadArrayQVCCheck(check, 'ResidencyAndTravelAndFamily.countriesVisitedLast10Years', this.countriesVisitedData);

            // Load family members QVC status
            this.loadArrayQVCCheck(check, 'ResidencyAndTravelAndFamily.familyMembers', this.familyMembersData);

            // Load documents QVC status
            if (check.fieldPath.startsWith('documents.')) {
                const docType = check.fieldPath.replace('documents.', '');
                const doc = this.request.documents.find((d: any) => d.type === docType);
                if (doc) {
                    doc.qvcStatus = check.status;
                }
            }
        });
    }

    private loadArrayQVCCheck(check: QVCCheck, arrayPath: string, targetArray: any[]): void {
        const regex = new RegExp(`${arrayPath}\\[(\\d+)\\]`);
        const match = check.fieldPath.match(regex);

        if (match && targetArray[parseInt(match[1])]) {
            targetArray[parseInt(match[1])].qvcStatus = check.status;
            targetArray[parseInt(match[1])].qvcComment = check.commentsEn;
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
        const statusMap: { [key: string]: string } = {
            approved: 'success',
            pending: 'warning',
            draft: 'info',
            rejected: 'danger'
        };
        return statusMap[status?.toLowerCase()] || 'secondary';
    }

    // Helper method for QVC status severity
    getQVCStatusSeverity(status: string): string {
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
}
