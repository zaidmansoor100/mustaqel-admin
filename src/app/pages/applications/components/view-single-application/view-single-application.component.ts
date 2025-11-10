import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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

@Component({
    selector: 'app-view-single-application',
    standalone: true,
    imports: [
        CommonModule, RouterModule, CardModule, ButtonModule, 
        TagModule, DialogModule, TooltipModule, SelectModule,
        TextareaModule, FormsModule, SafeUrlPipe
    ],
    templateUrl: './view-single-application.component.html',
    styleUrls: ['./view-single-application.component.scss']
})
export class ViewSingleApplicationComponent implements OnInit {
    request: any = null;
    stages: any[] = [];
    activeSection = 'overview';
    sections: string[] = [
        'overview', 'personal', 'passport', 'contact', 'employment', 
        'previousJobs', 'education', 'residences', 'otherNationalities', 
        'countriesVisited', 'family', 'documents', 'timeline'
    ];
    previewVisible = false;
    previewUrl: string | null = null;
    previewName: string | null = null;

    // QVC Properties
    isQVCInProgress = false;
    showQVCDetails = false;
    showCommentDialog = false;
    qvcChecks: any[] = [];
    currentField: any = null;
    currentFieldStatus: string = '';
    currentFieldCommentEn: string = '';
    currentFieldCommentAr: string = '';
    currentFieldCorrections: string = '';
    
    // QVC Progress
    qvcProgress = {
        checked: 0,
        total: 0
    };

    // Data arrays for complex objects
    educationData: any[] = [];
    familyMembersData: any[] = [];
    previousJobsData: any[] = [];
    residencesData: any[] = [];
    otherNationalitiesData: any[] = [];
    countriesVisitedData: any[] = [];

    // Field arrays
    personalFields: any[] = [];
    passportFields: any[] = [];
    contactFields: any[] = [];
    employmentFields: any[] = [];

    // QVC Status Options
    qvcStatusOptions = [
        { label: 'Correct', value: 'correct' },
        { label: 'Wrong', value: 'wrong' },
        { label: 'Needs Correction', value: 'needs_correction' }
    ];

    applicationStageStatus: string = 'N/A';
    isDraft: boolean = false;

    @ViewChild('contentContainer', { static: true }) contentContainer!: ElementRef<HTMLDivElement>;

    constructor(
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
        private messageService: MessageService,
        private reqService: RequestService
    ) {}

    ngOnInit() {
        this.request = this.activatedRoute.snapshot.data?.['singleRequestResolver']?.[0]?.['data']?.['request'] || null;
        this.initializeStages();
        this.buildFieldArrays();
        this.calculateQVCProgress();
    }

    initializeStages() {
        const order = ['jusour', 'vfs', 'entity', 'moci', 'application', 'mol', 'hayya'];
        const displayNames: any = {
            jusour: 'Jusour',
            vfs: 'VFS',
            entity: 'Entity',
            moci: 'MOCI',
            application: 'Application',
            mol: 'MOL',
            hayya: 'Hayya'
        };

        const statusObj = this.request?.status || {};

        this.stages = order.map((key) => {
            const stage = statusObj[key]?.[0] || {};
            return {
                key,
                name: displayNames[key] || key,
                status: stage?.status || 'Pending',
                role: stage?.role || '',
                username: stage?.username || '',
                icon: this.getIcon(stage?.status),
                color: this.getColor(stage?.status)
            };
        });

        const appStage = this.stages.find((s) => s.key === 'application');
        this.applicationStageStatus = appStage?.status || 'N/A';
        this.isDraft = this.applicationStageStatus.toLowerCase() === 'draft';
    }

    // Computed property to show QVC button
    get showQVCButton(): boolean {
        const userRole = 'admin'; // You should get this from your auth service
        const hasQVC = !!this.request?.qvc;
        const isPending = this.applicationStageStatus.toLowerCase() === 'pending';
        
        return userRole === 'admin' && !hasQVC && isPending && !this.isQVCInProgress;
    }

    buildFieldArrays() {
        const pi = this.request?.personalInfo?.applicantInfo || {};
        const passport = this.request?.personalInfo?.passportDetails || {};
        const contact = this.request?.personalInfo?.contactInfo || {};
        const employment = this.request?.employmentAndEducation?.employmentDetails || {};

        // Build arrays for complex objects
        this.educationData = this.request?.employmentAndEducation?.educations || [];
        this.familyMembersData = this.request?.ResidencyAndTravelAndFamily?.familyMembers || [];
        this.previousJobsData = this.request?.employmentAndEducation?.previousJobs || [];
        this.residencesData = this.request?.ResidencyAndTravelAndFamily?.residences || [];
        this.otherNationalitiesData = this.request?.ResidencyAndTravelAndFamily?.otherNationalities || [];
        this.countriesVisitedData = this.request?.ResidencyAndTravelAndFamily?.countriesVisitedLast10Years || [];

        // Personal Information Fields
        this.personalFields = [
            { label: 'Name (EN)', value: pi.nameEn || '-', fieldPath: 'personalInfo.applicantInfo.nameEn' },
            { label: 'Name (AR)', value: pi.nameAr || '-', fieldPath: 'personalInfo.applicantInfo.nameAr' },
            { label: 'Gender', value: pi.gender || '-', fieldPath: 'personalInfo.applicantInfo.gender' },
            { label: 'Date of Birth', value: pi.dob ? new Date(pi.dob).toLocaleDateString() : '-', fieldPath: 'personalInfo.applicantInfo.dob' },
            { label: 'Nationality', value: pi.nationality || '-', fieldPath: 'personalInfo.applicantInfo.nationality' },
            { label: 'Place of Birth', value: pi.placeOfBirth || '-', fieldPath: 'personalInfo.applicantInfo.placeOfBirth' },
            { label: 'Religion', value: pi.religion || '-', fieldPath: 'personalInfo.applicantInfo.religion' },
            { label: 'Marital Status', value: pi.maritalStatus || '-', fieldPath: 'personalInfo.applicantInfo.maritalStatus' },
            { label: 'Current Country', value: pi.currentCountry || '-', fieldPath: 'personalInfo.applicantInfo.currentCountry' },
            { label: 'Short Bio', value: pi.shortBio || '-', fieldPath: 'personalInfo.applicantInfo.shortBio' },
            { label: 'Arabic Proficiency', value: pi.langProficiencyAr || '-', fieldPath: 'personalInfo.applicantInfo.langProficiencyAr' },
            { label: 'English Proficiency', value: pi.langProficiencyEn || '-', fieldPath: 'personalInfo.applicantInfo.langProficiencyEn' }
        ];

        // Passport Fields
        this.passportFields = [
            { label: 'Passport #', value: passport.number || this.request?.passportNumber || '-', fieldPath: 'personalInfo.passportDetails.number' },
            { label: 'Type', value: passport.type || '-', fieldPath: 'personalInfo.passportDetails.type' },
            { label: 'Issue Place', value: passport.issuePlace || '-', fieldPath: 'personalInfo.passportDetails.issuePlace' },
            { label: 'Issue Country', value: passport.issueCountry || '-', fieldPath: 'personalInfo.passportDetails.issueCountry' },
            { label: 'Issue Date', value: passport.issueDate ? new Date(passport.issueDate).toLocaleDateString() : '-', fieldPath: 'personalInfo.passportDetails.issueDate' },
            { label: 'Expiry Date', value: passport.expiryDate ? new Date(passport.expiryDate).toLocaleDateString() : '-', fieldPath: 'personalInfo.passportDetails.expiryDate' },
            { label: 'Issued By', value: passport.issueBy || '-', fieldPath: 'personalInfo.passportDetails.issueBy' }
        ];

        // Contact Fields
        this.contactFields = [
            { label: 'Email', value: contact.email || this.request?.email || '-', fieldPath: 'personalInfo.contactInfo.email' },
            { label: 'Mobile', value: contact.mobile || this.request?.mobileNumber || '-', fieldPath: 'personalInfo.contactInfo.mobile' },
            { label: 'Phone', value: contact.phone || '-', fieldPath: 'personalInfo.contactInfo.phone' },
            { label: 'Permanent Address', value: contact.permanentAddress || '-', fieldPath: 'personalInfo.contactInfo.permanentAddress' },
            { label: 'PO Box', value: contact.poBox || '-', fieldPath: 'personalInfo.contactInfo.poBox' },
            { label: 'Qatar Address', value: contact.qatarAddress || '-', fieldPath: 'personalInfo.contactInfo.qatarAddress' }
        ];

        // Employment Fields
        this.employmentFields = [
            { label: 'Company Name', value: employment.companyName || '-', fieldPath: 'employmentAndEducation.employmentDetails.companyName' },
            { label: 'Share of Capital', value: employment.shareOfTheCapital || '-', fieldPath: 'employmentAndEducation.employmentDetails.shareOfTheCapital' },
            { label: 'Amount of Capital', value: employment.amountOfCapital || '-', fieldPath: 'employmentAndEducation.employmentDetails.amountOfCapital' },
            { label: 'Profession', value: employment.profession || '-', fieldPath: 'employmentAndEducation.employmentDetails.profession' },
            { label: 'Sponsor Name', value: employment.nameOfSponsor || '-', fieldPath: 'employmentAndEducation.employmentDetails.nameOfSponsor' },
            { label: 'Sponsor Address', value: employment.addressOfSponsor || '-', fieldPath: 'employmentAndEducation.employmentDetails.addressOfSponsor' }
        ];

        // Load existing QVC data if available
        this.loadExistingQVCChecks();
    }

    loadExistingQVCChecks() {
        if (!this.request?.qvc?.qvc_checks) return;

        const allFields = [
            ...this.personalFields, 
            ...this.passportFields, 
            ...this.contactFields, 
            ...this.employmentFields
        ];
        
        this.request.qvc.qvc_checks.forEach((check: any) => {
            // Load basic fields
            const field = allFields.find(f => f.fieldPath === check.fieldPath);
            if (field) {
                field.qvcStatus = check.status;
                field.qvcComment = check.commentsEn;
            }

            // Load education QVC status
            if (check.fieldPath.startsWith('employmentAndEducation.educations')) {
                const indexMatch = check.fieldPath.match(/employmentAndEducation\.educations\[(\d+)\]/);
                if (indexMatch && this.educationData[parseInt(indexMatch[1])]) {
                    this.educationData[parseInt(indexMatch[1])].qvcStatus = check.status;
                    this.educationData[parseInt(indexMatch[1])].qvcComment = check.commentsEn;
                }
            }

            // Load previous jobs QVC status
            if (check.fieldPath.startsWith('employmentAndEducation.previousJobs')) {
                const indexMatch = check.fieldPath.match(/employmentAndEducation\.previousJobs\[(\d+)\]/);
                if (indexMatch && this.previousJobsData[parseInt(indexMatch[1])]) {
                    this.previousJobsData[parseInt(indexMatch[1])].qvcStatus = check.status;
                    this.previousJobsData[parseInt(indexMatch[1])].qvcComment = check.commentsEn;
                }
            }

            // Load residences QVC status
            if (check.fieldPath.startsWith('ResidencyAndTravelAndFamily.residences')) {
                const indexMatch = check.fieldPath.match(/ResidencyAndTravelAndFamily\.residences\[(\d+)\]/);
                if (indexMatch && this.residencesData[parseInt(indexMatch[1])]) {
                    this.residencesData[parseInt(indexMatch[1])].qvcStatus = check.status;
                    this.residencesData[parseInt(indexMatch[1])].qvcComment = check.commentsEn;
                }
            }

            // Load other nationalities QVC status
            if (check.fieldPath.startsWith('ResidencyAndTravelAndFamily.otherNationalities')) {
                const indexMatch = check.fieldPath.match(/ResidencyAndTravelAndFamily\.otherNationalities\[(\d+)\]/);
                if (indexMatch && this.otherNationalitiesData[parseInt(indexMatch[1])]) {
                    this.otherNationalitiesData[parseInt(indexMatch[1])].qvcStatus = check.status;
                    this.otherNationalitiesData[parseInt(indexMatch[1])].qvcComment = check.commentsEn;
                }
            }

            // Load countries visited QVC status
            if (check.fieldPath.startsWith('ResidencyAndTravelAndFamily.countriesVisitedLast10Years')) {
                const indexMatch = check.fieldPath.match(/ResidencyAndTravelAndFamily\.countriesVisitedLast10Years\[(\d+)\]/);
                if (indexMatch && this.countriesVisitedData[parseInt(indexMatch[1])]) {
                    this.countriesVisitedData[parseInt(indexMatch[1])].qvcStatus = check.status;
                    this.countriesVisitedData[parseInt(indexMatch[1])].qvcComment = check.commentsEn;
                }
            }

            // Load family members QVC status
            if (check.fieldPath.startsWith('ResidencyAndTravelAndFamily.familyMembers')) {
                const indexMatch = check.fieldPath.match(/ResidencyAndTravelAndFamily\.familyMembers\[(\d+)\]/);
                if (indexMatch && this.familyMembersData[parseInt(indexMatch[1])]) {
                    this.familyMembersData[parseInt(indexMatch[1])].qvcStatus = check.status;
                    this.familyMembersData[parseInt(indexMatch[1])].qvcComment = check.commentsEn;
                }
            }

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

    calculateQVCProgress() {
        const allBasicFields = [
            ...this.personalFields, 
            ...this.passportFields, 
            ...this.contactFields, 
            ...this.employmentFields
        ];
        
        const educationCount = this.educationData.length;
        const previousJobsCount = this.previousJobsData.length;
        const residencesCount = this.residencesData.length;
        const nationalitiesCount = this.otherNationalitiesData.length;
        const countriesVisitedCount = this.countriesVisitedData.length;
        const familyCount = this.familyMembersData.length;
        const documentCount = this.request?.documents?.length || 0;
        
        this.qvcProgress.total = allBasicFields.length + educationCount + previousJobsCount + 
                                residencesCount + nationalitiesCount + countriesVisitedCount + 
                                familyCount + documentCount;
        
        const checkedBasic = allBasicFields.filter(f => f.qvcStatus).length;
        const checkedEducation = this.educationData.filter(e => e.qvcStatus).length;
        const checkedPreviousJobs = this.previousJobsData.filter(j => j.qvcStatus).length;
        const checkedResidences = this.residencesData.filter(r => r.qvcStatus).length;
        const checkedNationalities = this.otherNationalitiesData.filter(n => n.qvcStatus).length;
        const checkedCountriesVisited = this.countriesVisitedData.filter(c => c.qvcStatus).length;
        const checkedFamily = this.familyMembersData.filter(f => f.qvcStatus).length;
        const checkedDocuments = this.request?.documents?.filter((d: any) => d.qvcStatus)?.length || 0;
        
        this.qvcProgress.checked = checkedBasic + checkedEducation + checkedPreviousJobs + 
                                  checkedResidences + checkedNationalities + checkedCountriesVisited + 
                                  checkedFamily + checkedDocuments;
    }

    // QVC Methods
    startQVC() {
        this.isQVCInProgress = true;
        this.messageService.add({
            severity: 'info',
            summary: 'QVC Started',
            detail: 'Quality Verification Check has been started'
        });
    }

    markFieldCorrect(field: any) {
        field.qvcStatus = 'correct';
        field.qvcComment = 'Field is correct';
        this.addQVCCheck(field, 'correct', 'Field is correct', 'الحقل صحيح');
        this.calculateQVCProgress();
    }

    markFieldWrong(field: any) {
        this.currentField = field;
        this.currentFieldStatus = 'wrong';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
        this.showCommentDialog = true;
    }

    verifySection(section: string) {
        switch (section) {
            case 'personalInfo':
                this.personalFields.forEach(field => {
                    if (!field.qvcStatus) this.markFieldCorrect(field);
                });
                break;
            case 'passportDetails':
                this.passportFields.forEach(field => {
                    if (!field.qvcStatus) this.markFieldCorrect(field);
                });
                break;
            case 'contactInfo':
                this.contactFields.forEach(field => {
                    if (!field.qvcStatus) this.markFieldCorrect(field);
                });
                break;
            case 'employmentDetails':
                this.employmentFields.forEach(field => {
                    if (!field.qvcStatus) this.markFieldCorrect(field);
                });
                break;
            case 'previousJobs':
                this.previousJobsData.forEach((job, index) => {
                    if (!job.qvcStatus) this.markPreviousJobCorrect(index);
                });
                break;
            case 'education':
                this.educationData.forEach((edu, index) => {
                    if (!edu.qvcStatus) this.markEducationCorrect(index);
                });
                break;
            case 'residences':
                this.residencesData.forEach((residence, index) => {
                    if (!residence.qvcStatus) this.markResidenceCorrect(index);
                });
                break;
            case 'otherNationalities':
                this.otherNationalitiesData.forEach((nationality, index) => {
                    if (!nationality.qvcStatus) this.markOtherNationalityCorrect(index);
                });
                break;
            case 'countriesVisited':
                this.countriesVisitedData.forEach((visit, index) => {
                    if (!visit.qvcStatus) this.markCountryVisitCorrect(index);
                });
                break;
            case 'familyMembers':
                this.familyMembersData.forEach((member, index) => {
                    if (!member.qvcStatus) this.markFamilyMemberCorrect(index);
                });
                break;
            case 'documents':
                this.request.documents.forEach((doc: any, index: number) => {
                    if (!doc.qvcStatus) this.markDocumentCorrect(index);
                });
                break;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Section Verified',
            detail: `${section} has been verified as correct`
        });
    }

    saveFieldComment() {
        if (this.currentField) {
            this.currentField.qvcStatus = this.currentFieldStatus;
            this.currentField.qvcComment = this.currentFieldCommentEn;
            
            const corrections = this.currentFieldCorrections 
                ? this.currentFieldCorrections.split('\n').filter((c: string) => c.trim())
                : [];

            this.addQVCCheck(
                this.currentField,
                this.currentFieldStatus,
                this.currentFieldCommentEn,
                this.currentFieldCommentAr,
                corrections
            );

            this.calculateQVCProgress();
        }

        this.showCommentDialog = false;
        this.resetFieldComment();
    }

    cancelFieldComment() {
        this.showCommentDialog = false;
        this.resetFieldComment();
    }

    resetFieldComment() {
        this.currentField = null;
        this.currentFieldStatus = '';
        this.currentFieldCommentEn = '';
        this.currentFieldCommentAr = '';
        this.currentFieldCorrections = '';
    }

    addQVCCheck(field: any, status: string, commentEn: string, commentAr: string, corrections: string[] = []) {
        const existingIndex = this.qvcChecks.findIndex(check => check.fieldPath === field.fieldPath);
        
        const check = {
            fieldName: field.label,
            fieldPath: field.fieldPath,
            status: status,
            commentsEn: commentEn,
            commentsAr: commentAr,
            corrections: corrections
        };

        if (existingIndex >= 0) {
            this.qvcChecks[existingIndex] = check;
        } else {
            this.qvcChecks.push(check);
        }
    }

    async submitQVC() {
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

            const response: any = await this.reqService.submitQVC(payload).toPromise();
            
            this.messageService.add({
                severity: 'success',
                summary: 'QVC Submitted',
                detail: 'Quality Verification Check has been submitted successfully'
            });

            this.isQVCInProgress = false;
            this.request.qvc = response.data.request.qvc;
            
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'QVC Failed',
                detail: 'Failed to submit QVC. Please try again.'
            });
        }
    }

    determineOverallStatus(): string {
        const wrongCount = this.qvcChecks.filter(check => check.status === 'wrong').length;
        const needsCorrectionCount = this.qvcChecks.filter(check => check.status === 'needs_correction').length;

        if (wrongCount > 0) return 'rejected';
        if (needsCorrectionCount > 0) return 'needs_correction';
        return 'approved';
    }

    saveQVCProgress() {
        const progress = {
            requestId: this.request.id,
            checks: this.qvcChecks,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`qvc-progress-${this.request.id}`, JSON.stringify(progress));
        
        this.messageService.add({
            severity: 'info',
            summary: 'Progress Saved',
            detail: 'QVC progress has been saved locally'
        });
    }

    cancelQVC() {
        this.isQVCInProgress = false;
        this.qvcChecks = [];
        
        // Reset all field statuses
        this.resetAllQVCChecks();
        this.calculateQVCProgress();
        
        this.messageService.add({
            severity: 'info',
            summary: 'QVC Cancelled',
            detail: 'Quality Verification Check has been cancelled'
        });
    }

    resetAllQVCChecks() {
        // Reset basic fields
        const allBasicFields = [
            ...this.personalFields, 
            ...this.passportFields, 
            ...this.contactFields, 
            ...this.employmentFields
        ];
        allBasicFields.forEach(field => {
            field.qvcStatus = undefined;
            field.qvcComment = undefined;
        });

        // Reset arrays
        [this.educationData, this.familyMembersData, this.previousJobsData, 
         this.residencesData, this.otherNationalitiesData, this.countriesVisitedData]
        .forEach(array => {
            array.forEach((item: any) => {
                item.qvcStatus = undefined;
                item.qvcComment = undefined;
            });
        });

        // Reset documents
        this.request.documents.forEach((doc: any) => {
            doc.qvcStatus = undefined;
        });
    }

    getQVCStatusText(status: string): string {
        const statusMap: { [key: string]: string } = {
            'correct': 'Correct',
            'wrong': 'Wrong',
            'needs_correction': 'Needs Correction',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    // Education QVC methods
    markEducationCorrect(index: number) {
        const edu = this.educationData[index];
        edu.qvcStatus = 'correct';
        edu.qvcComment = 'Education record is correct';
        
        this.addQVCCheck(
            { 
                label: `Education ${index + 1}: ${edu.qualification}`, 
                fieldPath: `employmentAndEducation.educations[${index}]` 
            },
            'correct',
            'Education record is correct',
            'سجل التعليم صحيح'
        );
        this.calculateQVCProgress();
    }

    markEducationNeedsCorrection(index: number) {
        const edu = this.educationData[index];
        edu.qvcStatus = 'needs_correction';
        edu.qvcComment = 'Education record needs verification';
        
        this.addQVCCheck(
            { 
                label: `Education ${index + 1}: ${edu.qualification}`, 
                fieldPath: `employmentAndEducation.educations[${index}]` 
            },
            'needs_correction',
            'Education record needs verification',
            'سجل التعليم يحتاج إلى التحقق'
        );
        this.calculateQVCProgress();
    }

    // Previous Jobs QVC methods
    markPreviousJobCorrect(index: number) {
        const job = this.previousJobsData[index];
        job.qvcStatus = 'correct';
        job.qvcComment = 'Previous job record is correct';
        
        this.addQVCCheck(
            { 
                label: `Previous Job ${index + 1}`, 
                fieldPath: `employmentAndEducation.previousJobs[${index}]` 
            },
            'correct',
            'Previous job record is correct',
            'سجل الوظيفة السابقة صحيح'
        );
        this.calculateQVCProgress();
    }

    markPreviousJobNeedsCorrection(index: number) {
        const job = this.previousJobsData[index];
        job.qvcStatus = 'needs_correction';
        job.qvcComment = 'Previous job record needs verification';
        
        this.addQVCCheck(
            { 
                label: `Previous Job ${index + 1}`, 
                fieldPath: `employmentAndEducation.previousJobs[${index}]` 
            },
            'needs_correction',
            'Previous job record needs verification',
            'سجل الوظيفة السابقة يحتاج إلى التحقق'
        );
        this.calculateQVCProgress();
    }

    // Residences QVC methods
    markResidenceCorrect(index: number) {
        const residence = this.residencesData[index];
        residence.qvcStatus = 'correct';
        residence.qvcComment = 'Residence record is correct';
        
        this.addQVCCheck(
            { 
                label: `Residence ${index + 1}`, 
                fieldPath: `ResidencyAndTravelAndFamily.residences[${index}]` 
            },
            'correct',
            'Residence record is correct',
            'سجل الإقامة صحيح'
        );
        this.calculateQVCProgress();
    }

    markResidenceNeedsCorrection(index: number) {
        const residence = this.residencesData[index];
        residence.qvcStatus = 'needs_correction';
        residence.qvcComment = 'Residence record needs verification';
        
        this.addQVCCheck(
            { 
                label: `Residence ${index + 1}`, 
                fieldPath: `ResidencyAndTravelAndFamily.residences[${index}]` 
            },
            'needs_correction',
            'Residence record needs verification',
            'سجل الإقامة يحتاج إلى التحقق'
        );
        this.calculateQVCProgress();
    }

    // Other Nationalities QVC methods
    markOtherNationalityCorrect(index: number) {
        const nationality = this.otherNationalitiesData[index];
        nationality.qvcStatus = 'correct';
        nationality.qvcComment = 'Other nationality record is correct';
        
        this.addQVCCheck(
            { 
                label: `Other Nationality ${index + 1}: ${nationality.country}`, 
                fieldPath: `ResidencyAndTravelAndFamily.otherNationalities[${index}]` 
            },
            'correct',
            'Other nationality record is correct',
            'سجل الجنسية الأخرى صحيح'
        );
        this.calculateQVCProgress();
    }

    markOtherNationalityNeedsCorrection(index: number) {
        const nationality = this.otherNationalitiesData[index];
        nationality.qvcStatus = 'needs_correction';
        nationality.qvcComment = 'Other nationality record needs verification';
        
        this.addQVCCheck(
            { 
                label: `Other Nationality ${index + 1}: ${nationality.country}`, 
                fieldPath: `ResidencyAndTravelAndFamily.otherNationalities[${index}]` 
            },
            'needs_correction',
            'Other nationality record needs verification',
            'سجل الجنسية الأخرى يحتاج إلى التحقق'
        );
        this.calculateQVCProgress();
    }

    // Countries Visited QVC methods
    markCountryVisitCorrect(index: number) {
        const visit = this.countriesVisitedData[index];
        visit.qvcStatus = 'correct';
        visit.qvcComment = 'Country visit record is correct';
        
        this.addQVCCheck(
            { 
                label: `Country Visit ${index + 1}: ${visit.country}`, 
                fieldPath: `ResidencyAndTravelAndFamily.countriesVisitedLast10Years[${index}]` 
            },
            'correct',
            'Country visit record is correct',
            'سجل زيارة البلد صحيح'
        );
        this.calculateQVCProgress();
    }

    markCountryVisitNeedsCorrection(index: number) {
        const visit = this.countriesVisitedData[index];
        visit.qvcStatus = 'needs_correction';
        visit.qvcComment = 'Country visit record needs verification';
        
        this.addQVCCheck(
            { 
                label: `Country Visit ${index + 1}: ${visit.country}`, 
                fieldPath: `ResidencyAndTravelAndFamily.countriesVisitedLast10Years[${index}]` 
            },
            'needs_correction',
            'Country visit record needs verification',
            'سجل زيارة البلد يحتاج إلى التحقق'
        );
        this.calculateQVCProgress();
    }

    // Family member QVC methods
    markFamilyMemberCorrect(index: number) {
        const member = this.familyMembersData[index];
        member.qvcStatus = 'correct';
        member.qvcComment = 'Family member information is correct';
        
        this.addQVCCheck(
            { 
                label: `Family Member: ${member.name}`, 
                fieldPath: `ResidencyAndTravelAndFamily.familyMembers[${index}]` 
            },
            'correct',
            'Family member information is correct',
            'معلومات أفراد الأسرة صحيحة'
        );
        this.calculateQVCProgress();
    }

    markFamilyMemberNeedsCorrection(index: number) {
        const member = this.familyMembersData[index];
        member.qvcStatus = 'needs_correction';
        member.qvcComment = 'Family member information needs verification';
        
        this.addQVCCheck(
            { 
                label: `Family Member: ${member.name}`, 
                fieldPath: `ResidencyAndTravelAndFamily.familyMembers[${index}]` 
            },
            'needs_correction',
            'Family member information needs verification',
            'معلومات أفراد الأسرة تحتاج إلى التحقق'
        );
        this.calculateQVCProgress();
    }

    // Document QVC methods
    markDocumentCorrect(index: number) {
        const doc = this.request.documents[index];
        doc.qvcStatus = 'correct';
        
        this.addQVCCheck(
            { 
                label: `Document: ${this.formatDocumentName(doc.type)}`, 
                fieldPath: `documents.${doc.type}` 
            },
            'correct',
            'Document is valid and complete',
            'الوثيقة صالحة وكاملة'
        );
        this.calculateQVCProgress();
    }

    // Existing helper methods
    getIcon(status?: string) {
        const s = (status || '').toString().toLowerCase();
        switch (s) {
            case 'approved': return 'pi pi-check';
            case 'pending': return 'pi pi-hourglass';
            case 'draft': return 'pi pi-pencil';
            case 'rejected': return 'pi pi-times';
            default: return 'pi pi-circle-on';
        }
    }

    getColor(status?: string) {
        const s = (status || '').toString().toLowerCase();
        switch (s) {
            case 'approved': return '#16a34a';
            case 'pending': return '#202a5a';
            case 'rejected': return '#92193b';
            case 'draft': return '#4e7cf2';
            default: return '#9ca3af';
        }
    }

    scrollTo(sectionId: string) {
        this.activeSection = sectionId;
        const el = document.getElementById(sectionId);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const offset = 80;
        for (const s of this.sections) {
            const el = document.getElementById(s);
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (rect.top <= offset && rect.bottom > offset) {
                this.activeSection = s;
                break;
            }
        }
    }

    openPreview(doc: any) {
        this.previewName = doc?.documentName || doc?.type;
        const ext = doc?.meta?.extension?.toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
            this.previewUrl = `/api/v1/requests/${this.request?.id}/documents/${doc.id}/download`;
        } else {
            this.previewUrl = null;
        }
        this.previewVisible = true;
    }

    downloadDocument(doc: any) {
        const url = `/api/v1/requests/${this.request?.id}/documents/${doc.id}/download`;
        window.open(url, '_blank');
    }

    formatDocumentName(name: string): string {
        if (!name) return '';
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, (c) => c.toUpperCase());
    }

    approveStage(stage: any) {
        if (!stage) return;
        console.log(`Approved stage: ${stage.name}`);
        stage.status = 'Approved';
        stage.color = this.getColor('approved');
        stage.icon = this.getIcon('approved');
    }

    rejectStage(stage: any) {
        if (!stage) return;
        console.log(`Rejected stage: ${stage.name}`);
        stage.status = 'Rejected';
        stage.color = this.getColor('rejected');
        stage.icon = this.getIcon('rejected');
    }
}