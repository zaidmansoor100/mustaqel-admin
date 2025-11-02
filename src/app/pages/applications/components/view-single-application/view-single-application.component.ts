import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SafeUrlPipe } from '@/pipes/safe-url.pipe';

@Component({
    selector: 'app-view-single-application',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, DialogModule, TooltipModule, SafeUrlPipe],
    templateUrl: './view-single-application.component.html',
    styleUrls: ['./view-single-application.component.scss']
})
export class ViewSingleApplicationComponent implements OnInit {
    request: any = null;
    stages: any[] = [];
    activeSection = 'overview';
    sections: string[] = ['overview', 'personal', 'passport', 'contact', 'education', 'family', 'documents', 'timeline'];
    previewVisible = false;
    previewUrl: string | null = null;
    previewName: string | null = null;

    // In ViewSingleApplicationComponent
    applicationStageStatus: string = 'N/A';
    isDraft: boolean = false;

    @ViewChild('contentContainer', { static: true }) contentContainer!: ElementRef<HTMLDivElement>;

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        // load request from resolver safely
        this.request = this.activatedRoute.snapshot.data?.['singleRequestResolver']?.[0]?.['data']?.['request'] || null;

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

        // Set application stage status safely
        const appStage = this.stages.find((s) => s.key === 'application');
        this.applicationStageStatus = appStage?.status || 'N/A';
        this.isDraft = this.applicationStageStatus.toLowerCase() === 'draft';

        // Build field arrays for easy templating
        this.buildFieldArrays();
    }

    // build small arrays to iterate in templates
    personalFields: { label: string; value: any }[] = [];
    passportFields: { label: string; value: any }[] = [];
    contactFields: { label: string; value: any }[] = [];

    buildFieldArrays() {
        const pi = this.request?.personalInfo?.applicantInfo || {};
        const passport = this.request?.personalInfo?.passportDetails || {};
        const contact = this.request?.personalInfo?.contactInfo || {};

        this.personalFields = [
            { label: 'Name (EN)', value: pi.nameEn || '-' },
            { label: 'Name (AR)', value: pi.nameAr || '-' },
            { label: 'Gender', value: pi.gender || '-' },
            { label: 'Date of Birth', value: pi.dob ? new Date(pi.dob).toLocaleDateString() : '-' },
            { label: 'Nationality', value: pi.nationality || '-' },
            { label: 'Place of Birth', value: pi.placeOfBirth || '-' }
        ];

        this.passportFields = [
            { label: 'Passport #', value: passport.number || this.request?.passportNumber || '-' },
            { label: 'Type', value: passport.type || '-' },
            { label: 'Issue Place', value: passport.issuePlace || '-' },
            { label: 'Issue Country', value: passport.issueCountry || '-' },
            { label: 'Issue Date', value: passport.issueDate ? new Date(passport.issueDate).toLocaleDateString() : '-' },
            { label: 'Expiry Date', value: passport.expiryDate ? new Date(passport.expiryDate).toLocaleDateString() : '-' }
        ];

        this.contactFields = [
            { label: 'Email', value: contact.email || this.request?.email || '-' },
            { label: 'Mobile', value: contact.mobile || this.request?.mobileNumber || '-' },
            { label: 'Permanent Address', value: contact.permanentAddress || '-' },
            { label: 'PO Box', value: contact.poBox || '-' },
            { label: 'Qatar Address', value: contact.qatarAddress || '-' }
        ];
    }

    // icons & colors
    getIcon(status?: string) {
        const s = (status || '').toString().toLowerCase();
        switch (s) {
            case 'approved':
                return 'pi pi-check';
            case 'pending':
                return 'pi pi-hourglass';
            case 'draft':
                return 'pi pi-pencil';
            case 'rejected':
                return 'pi pi-times';
            default:
                return 'pi pi-circle-on';
        }
    }

    getColor(status?: string) {
        const s = (status || '').toString().toLowerCase();
        switch (s) {
            case 'approved':
                return '#16a34a'; // green
            case 'pending':
                return '#202a5a'; // primary
            case 'rejected':
                return '#92193b'; // accent
            case 'draft':
                return '#4e7cf2';
            default:
                return '#9ca3af';
        }
    }

    // smooth scroll to section
    scrollTo(sectionId: string) {
        this.activeSection = sectionId;
        const el = document.getElementById(sectionId);
        if (!el) return;

        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // update active section on scroll
    @HostListener('window:scroll', [])
    onWindowScroll() {
        const offset = 80; // adjust to sticky bar height
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

    // documents
    openPreview(doc: any) {
        // assume you have an endpoint to get a file URL (or streaming)
        // for now show filename and fake preview; replace with actual file URL logic
        this.previewName = doc?.documentName || doc?.type;
        // If image
        const ext = doc?.meta?.extension?.toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
            // If you have a download URL, use it
            this.previewUrl = `/api/v1/requests/${this.request?.id}/documents/${doc.id}/download`;
        } else {
            this.previewUrl = null;
        }
        this.previewVisible = true;
    }

    downloadDocument(doc: any) {
        // Replace with real download endpoint
        const url = `/api/v1/requests/${this.request?.id}/documents/${doc.id}/download`;
        window.open(url, '_blank');
    }

    // pretty doc name
    formatDocumentName(name: string): string {
        if (!name) return '';
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^\w/, (c) => c.toUpperCase());
    }

    approveStage(stage: any) {
        if (!stage) return;
        // Here you would call your backend API to approve the stage
        console.log(`Approved stage: ${stage.name}`);
        stage.status = 'Approved';
        stage.color = this.getColor('approved');
        stage.icon = this.getIcon('approved');
    }

    /**
     * Reject a specific stage (QA action)
     */
    rejectStage(stage: any) {
        if (!stage) return;
        // Here you would call your backend API to reject the stage
        console.log(`Rejected stage: ${stage.name}`);
        stage.status = 'Rejected';
        stage.color = this.getColor('rejected');
        stage.icon = this.getIcon('rejected');
    }

    
}
