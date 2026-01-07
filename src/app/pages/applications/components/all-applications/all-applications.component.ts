import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RequestService } from '@/services/request.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedModule } from '@/common/modules/form.module';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule, FormBuilder, FormControl, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'applications-index',
    templateUrl: './all-applications.component.html',
    styleUrl: './all-applications.component.scss',
    imports: [DialogModule, CommonModule, TableModule, TextareaModule, TagModule, IconFieldModule,
        InputTextModule, InputIconModule, MultiSelectModule, SelectModule, SharedModule, RouterModule,
        Toolbar, ConfirmDialog, ReactiveFormsModule, FormsModule],
    providers: [MessageService, ConfirmationService]
})
export class AllApplicationsComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    requests: any = [];
    @Input() catSlug: any;
    selectedRequests: any[] = [];
    totalRecords = 0;
    private destroy$ = new Subject<void>();

    cols = [
        { field: 'requestId', header: 'Request No' },
        { field: 'name', header: 'Applicant Name' },
        { field: 'categoryName', header: 'Category' },
        { field: 'sectorName', header: 'Sector' },
        { field: 'activityName', header: 'Activity' },
        { field: 'createdDate', header: 'Created Date' },
        { field: 'status', header: 'Application Status' },
        { field: 'jStatus', header: 'Jusour Status' },
    ];

    // Dialog visibility & form fields
    statusDialogVisible: boolean = false;
    selectedRequest: any = null;
    selectedStatus: string | null = null;
    statusReason: string = '';


    // FormGroup
    updateStatus!: FormGroup;

    // Dropdown options
    statusOptions = [
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        // { label: 'Pending', value: 'Pending' },
        { label: 'On Hold', value: 'On Hold' },
        { label: 'Under Review', value: 'Under Review status' }
    ];

    cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    constructor(
        private requestService: RequestService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        this.loadRequests({ first: 0, rows: 10 });
        this.buildCommentForm()
    }

    loadRequests(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.requestService.getAllRequests(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                const all = res.data?.request?.data || [];

                // ✅ Only include TAL category
                this.requests = all.filter((r: any) => String(r.category?.slug).toLowerCase() === this.catSlug);

                this.totalRecords = this.requests.length;
            }
        });
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToView(id: number) {
        this.router.navigate(['/pages/applications/view', id], { relativeTo: this.route });
    }

    navigateToCreate() {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    // navigateToEdit(id: number) {
    //     this.router.navigate(['edit', id], { relativeTo: this.route });
    // }

    deleteRequest(request: any) {
        // this.confirmationService.confirm({
        //     message: `Are you sure to delete ${request.requestId}?`,
        //     accept: () => {
        //         this.requestService.deleteRequest(request.id).subscribe(() => {
        //             this.requests = this.requests.filter((r) => r.id !== request.id);
        //             this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Request removed' });
        //         });
        //     }
        // });
    }

    deleteSelectedRequests() {
        // this.confirmationService.confirm({
        //     message: 'Are you sure to delete selected requests?',
        //     accept: () => {
        //         const ids = this.selectedRequests.map((r) => r.id);
        //         this.requestService.bulkDelete(ids).subscribe(() => {
        //             this.requests = this.requests.filter((r) => !ids.includes(r.id));
        //             this.selectedRequests = [];
        //             this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Requests removed' });
        //         });
        //     }
        // });
    }

    getSeverity(status: any) {
        const normalized = String(status).toLowerCase();

        switch (normalized) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warn';
            case 'rejected':
                return 'danger';
            case 'draft':
                return 'info';
            default:
                return 'secondary';
        }
    }

    openStatusDialog(request: any) {

        this.selectedRequest = request;
        console.log(request?.statuses?.application?.status, 'status');

        this.selectedStatus = request?.statuses?.application?.status || null;
        this.statusReason = '';
        this.statusDialogVisible = true;
    }


    buildCommentForm(): void {
        this.updateStatus = this.fb.group({
            status: [Validators.required],
            commentsEn: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(200)
                ]
            ],
            commentsAr: [
                '',
                [
                    Validators.minLength(3),
                    Validators.maxLength(200)
                ]
            ]
        });
    }

    // Update status (call API or update locally)
    // updateRequestStatus() {
    //     if (!this.selectedRequest || !this.selectedStatus) return;

    //     // Replace with API call if needed
    //     this.selectedRequest.statuses.application.status = this.selectedStatus;
    //     this.selectedRequest.statuses.application.reason = this.statusReason;

    //     this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Request status updated' });

    //     // Close dialog
    //     this.statusDialogVisible = false;
    // }

    async updateRequestStatus() {
        if (this.updateStatus.invalid || !this.selectedRequest || !this.selectedStatus) {
            console.warn('Form invalid', this.updateStatus);
            return;
        }
        // console.log(this.selectedRequest)
        const id = this.selectedRequest?.id
        const val = this.updateStatus.value
        console.log(this.requests, 'before')
        try {
            const payload = {
                status: val.status,
                commentsEn: val.commentsEn,
                commentsAr: val.commentsAr,
            };

            const response: any = await this.requestService.requestUpdateStatus(payload, id).pipe(takeUntil(this.destroy$)).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'Status',
                detail: `Request has been   successfully`
            });

            this.selectedRequest.statuses = Object.keys(
                response.data?.request?.status || {}
            ).reduce((acc: any, key: string) => {
                const item = response.data.request.status[key]?.[0];

                if (item) {
                    acc[key] = {
                        status: item.status,
                        stage: item.stage,
                        username: item.username,
                        role: item.role
                    };
                }

                return acc;
            }, {});

            this.statusDialogVisible = false
        } catch (error) {
            console.error('status:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Status Failed',
                detail: 'Failed to update status. Please try again.'
            });
        }
    }
}
