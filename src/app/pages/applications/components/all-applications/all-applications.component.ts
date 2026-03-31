// src/app/pages/applications/components/all-applications/all-applications.component.ts
import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
import { PermissionDirective } from '@/directives/permission.directive';
import { PermissionService } from '@/services/permission.service';
import { Permission } from '@/enums/permission.enum';

@Component({
    selector: 'applications-index',
    templateUrl: './all-applications.component.html',
    styleUrl: './all-applications.component.scss',
    imports: [
        DialogModule,
        CommonModule,
        TableModule,
        TextareaModule,
        TagModule,
        IconFieldModule,
        InputTextModule,
        InputIconModule,
        MultiSelectModule,
        SelectModule,
        SharedModule,
        RouterModule,
        Toolbar,
        ConfirmDialog,
        ReactiveFormsModule,
        FormsModule,
        PermissionDirective
    ],
    providers: [MessageService, ConfirmationService]
})
export class AllApplicationsComponent implements OnInit, OnDestroy {
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
        { field: 'jStatus', header: 'Jusour Status' }
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
        { label: 'On Hold', value: 'On Hold' },
        { label: 'Under Review', value: 'Under Review status' }
    ];

    // Permission flags for UI
    canCreate$: any;
    canDelete$: any;
    canView$: any;
    canEdit$: any;
    canExport$: any;
    canUpdateStatus$: any;

    // Make Permission enum available in template
    Permission = Permission;

    constructor(
        private requestService: RequestService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private permissionService: PermissionService
    ) {}

    ngOnInit() {
        this.canCreate$ = this.permissionService.hasPermission(this.getCreatePermission());
        this.canDelete$ = this.permissionService.hasPermission(this.getDeletePermission());
        this.canView$ = this.permissionService.hasPermission(this.getViewPermission());
        this.canEdit$ = this.permissionService.hasPermission(this.getEditPermission());
        this.canExport$ = this.permissionService.hasPermission(Permission.EXPORT_DATA_TALENT);
        this.canUpdateStatus$ = this.permissionService.hasPermission(this.getUpdateStatusPermission());
        this.loadRequests({ first: 0, rows: 10 });
        this.buildCommentForm();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getCreatePermission(): string {
        switch (this.catSlug) {
            case 'tal':
                return Permission.CREATE_TALENT;
            case 'ent':
                return Permission.CREATE_ENTREPRENEUR;
            case 'inv':
                return Permission.CREATE_INVESTOR;
            case 'exe':
                return Permission.CREATE_EXECUTIVE;
            default:
                return Permission.CREATE_TALENT;
        }
    }

    getDeletePermission(): string {
        switch (this.catSlug) {
            case 'tal':
                return Permission.DELETE_TALENT;
            case 'ent':
                return Permission.DELETE_ENTREPRENEUR;
            case 'inv':
                return Permission.DELETE_INVESTOR;
            case 'exe':
                return Permission.DELETE_EXECUTIVE;
            default:
                return Permission.DELETE_TALENT;
        }
    }

    getViewPermission(): string {
        switch (this.catSlug) {
            case 'tal':
                return Permission.VIEW_TALENT;
            case 'ent':
                return Permission.VIEW_ENTREPRENEUR;
            case 'inv':
                return Permission.VIEW_INVESTOR;
            case 'exe':
                return Permission.VIEW_EXECUTIVE;
            default:
                return Permission.VIEW_TALENT;
        }
    }

    getEditPermission(): string {
        switch (this.catSlug) {
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

    getUpdateStatusPermission(): string {
        switch (this.catSlug) {
            case 'tal':
                return Permission.APPROVE_TALENT;
            case 'ent':
                return Permission.APPROVE_ENTREPRENEUR;
            case 'inv':
                return Permission.APPROVE_INVESTOR;
            case 'exe':
                return Permission.APPROVE_EXECUTIVE;
            default:
                return Permission.APPROVE_TALENT;
        }
    }

    loadRequests(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;

        this.requestService.getAllRequests(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                const all = res.data?.request?.data || [];

                // Filter by category slug
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
        this.selectedStatus = request?.statuses?.application?.status || null;
        this.statusReason = '';
        this.statusDialogVisible = true;
    }

    buildCommentForm(): void {
        this.updateStatus = this.fb.group({
            status: ['', Validators.required],
            commentsEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            commentsAr: ['', [Validators.minLength(3), Validators.maxLength(200)]]
        });
    }

    async updateRequestStatus() {
        if (this.updateStatus.invalid || !this.selectedRequest) {
            return;
        }

        const id = this.selectedRequest?.id;
        const val = this.updateStatus.value;

        try {
            const payload = {
                status: val.status,
                commentsEn: val.commentsEn,
                commentsAr: val.commentsAr
            };

            const response: any = await this.requestService.requestUpdateStatus(payload, id).pipe(takeUntil(this.destroy$)).toPromise();

            this.messageService.add({
                severity: 'success',
                summary: 'Status',
                detail: `Request has been ${val.status} successfully`
            });

            this.selectedRequest.statuses = Object.keys(response.data?.request?.status || {}).reduce((acc: any, key: string) => {
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

            this.statusDialogVisible = false;
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
