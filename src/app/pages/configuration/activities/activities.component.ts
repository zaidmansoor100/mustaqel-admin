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
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-activities',
    imports: [MultiSelectModule, ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],

    templateUrl: './activities.component.html',
    styleUrl: './activities.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class ActivitiesComponent implements OnInit {
    activityDialog: boolean = false;
    submitted: boolean = false;
    selectedActivities: any[] = [];
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
    activities: any[] = [];
    activity: any = {};
    sectors: any[] = [];
    activityForm!: FormGroup;

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
        this.activities = this.activatedRoute.snapshot.data['activitiesResolver'][0]['data'];
        this.sectors = this.activatedRoute.snapshot.data['activitiesResolver'][1]['data'];
        this.exportCSVData();
        this.formBuild();
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'Activity (English)' },
            { field: 'nameAr', header: 'Activity (Arabic)' },
            { field: 'sectorName', header: 'Sector Name' },
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

    loadActivities(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getActivities(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.activities = res.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error) => {
                console.log(error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.errors.message,
                    life: 3000
                });
            }
        });
    }

    formBuild(activity?: any) {
        this.activityForm = this.fb.group({
            sectorId: [activity?.sectorId || [], [Validators.required]],
            name: [activity?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [activity?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [activity?.status || '', [Validators.required, Validators.maxLength(1)]],
            
        });
    }

    openNew() {
        this.formBuild();
        this.activity = {};
        this.submitted = false;
        this.activityDialog = true;
    }

    editActivity(activity: any) {
        this.formBuild(activity);
        this.activity = { ...activity };
        this.activityDialog = true;
    }

    deleteSelectedActivities() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected activities?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedActivities.map((cat) => this.configurationService.deleteActivity(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
                    .then(() => {
                        this.activities = this.activities.filter((val) => !this.selectedActivities.includes(val));
                        this.selectedActivities = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'activities Deleted',
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

    deleteActivity(activity: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + activity.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteActivity(activity.id).subscribe({
                    next: () => {
                        this.activities = this.activities.filter((val) => val.id !== activity.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'activity Deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.errors.message,
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    saveActivity() {
        this.submitted = true;
        const formValue = this.activityForm.value;

        const obj = {
            sectorId: formValue.sectorId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.activity.id) {
            // Update existing activity
            this.configurationService.updateActivity(this.activity.id, obj).subscribe({
                next: (res) => {
                    const index = this.activities.findIndex((c) => c.id === this.activity.id);
                    this.activities[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'activity Updated',
                        life: 3000
                    });
                    this.activityDialog = false;
                    this.activity = {};
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.errors.message,
                        life: 3000
                    });
                }
            });
        } else {
            // Create new activity
            this.configurationService.createActivity(obj).subscribe({
                next: (res: any) => {
                    this.activities.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'activity Created',
                        life: 3000
                    });
                    this.activityDialog = false;
                    this.activity = {};
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.errors.message,
                        life: 3000
                    });
                }
            });
        }
    }

    hideDialog() {
        this.activityDialog = false;
        this.submitted = false;
    }
}
