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

@Component({
    selector: 'app-subActivities',
    imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],

    templateUrl: './subActivities.component.html',
    styleUrl: './subActivities.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SubActivitiesComponent implements OnInit {
    subActivityDialog: boolean = false;
    submitted: boolean = false;
    selectedSubActivities: any[] = [];
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

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    subActivities: any[] = [];
    activities: any[] = [];
    subActivity: any = {};
    subActivityForm!: FormGroup;

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
        this.subActivities = this.activatedRoute.snapshot.data['subActivitiesResolver'][0]['data'];
        this.activities = this.activatedRoute.snapshot.data['subActivitiesResolver'][1]['data'];

        this.exportCSVData();
        this.formBuild();
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'subActivity (English)' },
            { field: 'nameAr', header: 'subActivity (Arabic)' },
            { field: 'activityName', header: 'Activity Name' },
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

    loadSubActivities(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getSubActivities(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.subActivities = res.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error) => {
                console.log(error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load subActivities',
                    life: 3000
                });
            }
        });
    }

    formBuild(subActivity?: any) {
        this.subActivityForm = this.fb.group({
            activityId:[subActivity?.activityId ||'', [Validators.required]],
            name: [subActivity?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [subActivity?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [subActivity?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.subActivity = {};
        this.submitted = false;
        this.subActivityDialog = true;
    }

    editSubActivity(subActivity: any) {
        this.formBuild(subActivity);
        this.subActivity = { ...subActivity };
        this.subActivityDialog = true;
    }

    deleteSelectedSubActivities() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected subActivities?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedSubActivities.map((cat) => this.configurationService.deleteSubActivity(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
                    .then(() => {
                        this.subActivities = this.subActivities.filter((val) => !this.selectedSubActivities.includes(val));
                        this.selectedSubActivities = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'subActivities Deleted',
                            life: 3000
                        });
                    })
                    .catch(() => {
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

    deleteSubActivity(subActivity: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + subActivity.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteSubActivity(subActivity.id).subscribe({
                    next: () => {
                        this.subActivities = this.subActivities.filter((val) => val.id !== subActivity.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'subActivity Deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Delete failed',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    saveSubActivity() {
        this.submitted = true;
        const formValue = this.subActivityForm.value;

        const obj = {
            activityId: formValue.activityId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };


        if (this.subActivity.id) {
            // Update existing subActivity
            this.configurationService.updateSubActivity(this.subActivity.id, obj).subscribe({
                next: (res) => {
                    const index = this.subActivities.findIndex((c) => c.id === this.subActivity.id);
                    this.subActivities[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'subActivity Updated',
                        life: 3000
                    });
                    this.subActivityDialog = false;
                    this.subActivity = {};
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Update failed',
                        life: 3000
                    });
                }
            });
        } else {
            // Create new subActivity
            this.configurationService.createSubActivity(obj).subscribe({
                next: (res: any) => {
                    this.subActivities.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'subActivity Created',
                        life: 3000
                    });
                    this.subActivityDialog = false;
                    this.subActivity = {};
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Create failed',
                        life: 3000
                    });
                }
            });
        }
    }

    hideDialog() {
        this.subActivityDialog = false;
        this.submitted = false;
    }
}
