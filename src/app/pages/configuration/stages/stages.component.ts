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
    selector: 'app-stages',
    standalone: true,
    imports: [ReactiveFormsModule, SelectModule, TagModule, CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, ToastModule, ToolbarModule, InputTextModule, DialogModule, InputIconModule, IconFieldModule, ConfirmDialogModule],
    templateUrl: './stages.component.html',
    styleUrl: './stages.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class StagesComponent implements OnInit {
    stageDialog: boolean = false;
    submitted: boolean = false;
    selectedStages: any[] = [];
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
    stages: any[] = [];
    stage: any = {};
    stageForm!: FormGroup;

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
        this.stages = this.activatedRoute.snapshot.data['stagesResolver'][0]['data'];
        console.log(this.stages);

        this.exportCSVData();
        this.formBuild();
        // this.loadstages({ first: 0, rows: this.rows });
    }

    exportCSV() {
        // Flatten any fields for export
        const formatted = this.stages.map((row: any) => ({
            ...row,
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
            { field: 'order', header: 'Order' },
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
        this.configurationService.getAllStages(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.stages = res.data;
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

    formBuild(stage?: any) {
        this.stageForm = this.fb.group({
            name: [stage?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [stage?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            order: [stage?.order || '', [Validators.required, Validators.maxLength(20)]],
            status: [stage?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.stage = {};
        this.submitted = false;
        this.stageDialog = true;
    }

    editstage(stage: any) {
        this.formBuild(stage);
        this.stage = { ...stage };
        this.stageDialog = true;
    }

    deleteselectedStages() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected stages?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedStages.map((sac) => this.configurationService.deleteStage(sac.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
                    .then(() => {
                        this.stages = this.stages.filter((val) => !this.selectedStages.includes(val));
                        this.selectedStages = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'stages Deleted',
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
                this.configurationService.deleteStage(stage.id).subscribe({
                    next: () => {
                        this.stages = this.stages.filter((val) => val.id !== stage.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'stage Deleted',
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
        const formValue = this.stageForm.value;

        const obj = {
            name: formValue.name,
            nameAr: formValue.nameAr,
            order: formValue.order,
            status: formValue.status
        };

        console.log(obj);

        if (this.stage.id) {
            // Update existing stage
            this.configurationService.updateStage(this.stage.id, obj).subscribe({
                next: (res: any) => {
                    const index = this.stages.findIndex((c) => c.id === this.stage.id);
                    this.stages[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'stage Updated',
                        life: 3000
                    });
                    this.stageDialog = false;
                    this.stage = {};
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
            this.configurationService.createStage(obj).subscribe({
                next: (res) => {
                    this.stages.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'stage Created',
                        life: 3000
                    });
                    this.stageDialog = false;
                    this.stage = {};
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
        this.stageDialog = false;
        this.submitted = false;
    }
}
