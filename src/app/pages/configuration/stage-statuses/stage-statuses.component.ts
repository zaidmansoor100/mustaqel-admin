import { CustomValidators } from '@/common/validators/custom-validators';
import { ConfigurationService } from '@/services/configuration.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-stage-statuses',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
  templateUrl: './stage-statuses.component.html',
  styleUrl: './stage-statuses.component.scss',
  providers: [MessageService, ConfirmationService]
  
})
export class StageStatusesComponent implements OnInit {
    stageStatusDialog: boolean = false;
    submitted: boolean = false;
    selectedStageStatuses: any[] = [];
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
    stageStatuses: any[] = [];
    stages: any[] = [];
    stageStatus: any = {};
    stageStatusForm!: FormGroup;

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
        this.stageStatuses = this.activatedRoute.snapshot.data['stageStatusesResolver'][0]['data'];
        this.stages = this.activatedRoute.snapshot.data['stageStatusesResolver'][1]['data'];
        console.log(this.stageStatuses);

        this.exportCSVData();
        this.formBuild();
        // this.loadStageStatuses({ first: 0, rows: this.rows });
    }

    exportCSV() {
        // Flatten any fields for export
        const formatted = this.stageStatuses.map((row: any) => ({
            ...row,
            stageName: row.stage?.name || 'No Stage',
            status: row.status === 1 ? 'Active' : 'Inactive'
        }));

        const original = this.dt.value;
        this.dt.value = formatted;
        this.dt.exportCSV();
        this.dt.value = original; // restore original
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'stage (English)' },
            { field: 'nameAr', header: 'stage (Arabic)' },
            { field: 'stageName', header: 'stage Name' },
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

    loadstages(event: any) {
        console.log(event);

        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getAllStageStatuses(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.stageStatuses = res.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error) => {
                console.log(error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load stages',
                    life: 3000
                });
            }
        });
    }

    formBuild(stageStatus?: any) {
        this.stageStatusForm = this.fb.group({
            stageId: [stageStatus?.stageId || [], [Validators.required]],
            name: [stageStatus?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [stageStatus?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [stageStatus?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.stageStatus = {};
        this.submitted = false;
        this.stageStatusDialog = true;
    }

    editstage(stage: any) {
        this.formBuild(stage);
        this.stageStatus = { ...stage };
        this.stageStatusDialog = true;
    }

    deleteselectedStages() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected stages?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedStageStatuses.map((sac) => this.configurationService.deleteStageStatuses(sac.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
                    .then(() => {
                        this.stageStatuses = this.stageStatuses.filter((val) => !this.selectedStageStatuses.includes(val));
                        this.selectedStageStatuses = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'stageStatuses Deleted',
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

    deletestage(stage: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + stage.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteStageStatuses(stage.id).subscribe({
                    next: () => {
                        this.stageStatuses = this.stageStatuses.filter((val) => val.id !== stage.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'stageStatus Deleted',
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

    savestage() {
        this.submitted = true;
        const formValue = this.stageStatusForm.value;

        const obj = {
            stageId: formValue.stageId,
            name: formValue.name,
            nameAr: formValue.nameAr,
            order: formValue.order,
            status: formValue.status
        };

        console.log(obj);

        if (this.stageStatus.id) {
            // Update existing stage
            this.configurationService.updateStageStatuses(this.stageStatus.id, obj).subscribe({
                next: (res: any) => {
                    const index = this.stageStatuses.findIndex((c) => c.id === this.stageStatus.id);
                    this.stageStatuses[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'stageStatus Updated',
                        life: 3000
                    });
                    this.stageStatusDialog = false;
                    this.stageStatus = {};
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
            // Create new stage
            this.configurationService.createStageStatuses(obj).subscribe({
                next: (res) => {
                    this.stageStatuses.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'stageStatus Created',
                        life: 3000
                    });
                    this.stageStatusDialog = false;
                    this.stageStatus = {};
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
        this.stageStatusDialog = false;
        this.submitted = false;
    }
}