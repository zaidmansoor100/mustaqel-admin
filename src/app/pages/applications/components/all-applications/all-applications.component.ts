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

@Component({
    selector: 'applications-index',
    templateUrl: './all-applications.component.html',
    styleUrl: './all-applications.component.scss',
    imports: [DialogModule, CommonModule, TableModule, TagModule, IconFieldModule, InputTextModule, InputIconModule, MultiSelectModule, SelectModule, SharedModule, RouterModule, Toolbar, ConfirmDialog],
    providers: [MessageService, ConfirmationService]
})
export class AllApplicationsComponent implements OnInit {
    @ViewChild('dt') dt!: Table;

    requests: any = [];
    @Input() catSlug: any;
    selectedRequests: any[] = [];
    totalRecords = 0;

    cols = [
        { field: 'requestId', header: 'Request No' },
        { field: 'name', header: 'Applicant Name' },
        { field: 'categoryName', header: 'Category' },
        { field: 'sectorName', header: 'Sector' },
        { field: 'activityName', header: 'Activity' },
        { field: 'createdDate', header: 'Created Date' },
        { field: 'status', header: 'Application Status' }
    ];

    // Dialog visibility & form fields
    statusDialogVisible: boolean = false;
    selectedRequest: any = null;
    selectedStatus: string | null = null;
    statusReason: string = '';

    // Dropdown options
    statusOptions = [
        { label: 'Accepted', value: 'Accepted' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Pending', value: 'Pending' },
        { label: 'On Hold', value: 'On Hold' }
    ];

    constructor(
        private requestService: RequestService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.loadRequests({ first: 0, rows: 10 });
    }

    loadRequests(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.requestService.getAllRequests(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                const all = res.data?.request?.data || [];

                // ✅ Only include TAL category
                this.requests = all.filter((r: any) => String(r.metas?.catSlug).toLowerCase() === this.catSlug);

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
        this.selectedStatus = request.statuses?.application?.status || null;
        this.statusReason = '';
        this.statusDialogVisible = true;
    }

    // Update status (call API or update locally)
    updateRequestStatus() {
        if (!this.selectedRequest || !this.selectedStatus) return;

        // Replace with API call if needed
        this.selectedRequest.statuses.application.status = this.selectedStatus;
        this.selectedRequest.statuses.application.reason = this.statusReason;

        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Request status updated' });

        // Close dialog
        this.statusDialogVisible = false;
    }
}
