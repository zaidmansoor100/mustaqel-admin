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
    selector: 'app-sectors',
    imports: [
        ReactiveFormsModule,
        SelectModule,
        MultiSelectModule,
        TagModule,
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule
    ],

    templateUrl: './sectors.component.html',
    styleUrl: './sectors.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SectorsComponent implements OnInit {
    sectorDialog: boolean = false;
    submitted: boolean = false;
    selectedSectors: any[] = [];
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

    categories: any[] = [];

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    sectors: any[] = [];
    sector: any = {};
    sectorForm!: FormGroup;

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
        this.sectors = this.activatedRoute.snapshot.data['sectorsResolver'][0]['data'];
        this.categories = this.activatedRoute.snapshot.data['sectorsResolver'][1]['data'];
        console.log(this.categories);

        this.exportCSVData();
        this.formBuild();
        // this.loadSectors({ first: 0, rows: this.rows });
    }

    exportCSV() {
        const formatted = this.sectors.map((row: any) => ({
            ...row,
            categories: row.categories?.map((c: any) => c.name).join(', ') || 'No Categories',
            status: row.status === 1 ? 'Active' : 'Inactive'
        }));

        // temporarily replace table value
        const original = this.dt.value;
        this.dt.value = formatted;
        this.dt.exportCSV();
        this.dt.value = original; // restore original
    }

    exportCSVData() {
        this.cols = [
            { field: 'id', header: '#' },
            { field: 'name', header: 'sector (English)' },
            { field: 'nameAr', header: 'sector (Arabic)' },
            { field: 'categories', header: 'categories Name' },
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

    loadSectors(event: any) {
        console.log(event);
        
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getSectors(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.sectors = res.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error) => {
                console.log(error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load sectors',
                    life: 3000
                });
            }
        });
    }

    formBuild(sector?: any) {
        this.sectorForm = this.fb.group({
            categoryIds: [sector?.categoryIds || [], [Validators.required]],
            name: [sector?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [sector?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [sector?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.sector = {};
        this.submitted = false;
        this.sectorDialog = true;
    }

    editSector(sector: any) {
        this.formBuild(sector);
        this.sector = { ...sector };
        this.sectorDialog = true;
    }

    deleteSelectedSectors() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected sectors?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedSectors.map((sac) => this.configurationService.deleteSector(sac.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req) => req.toPromise()))
                    .then(() => {
                        this.sectors = this.sectors.filter((val) => !this.selectedSectors.includes(val));
                        this.selectedSectors = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'sectors Deleted',
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

    deleteSector(sector: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + sector.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteSector(sector.id).subscribe({
                    next: () => {
                        this.sectors = this.sectors.filter((val) => val.id !== sector.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'sector Deleted',
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

    saveSector() {
        this.submitted = true;
        const formValue = this.sectorForm.value;

        const obj = {
            categoryIds: formValue.categoryIds,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        console.log(obj);

        if (this.sector.id) {
            // Update existing sector
            this.configurationService.updateSector(this.sector.id, obj).subscribe({
                next: (res: any) => {
                    const index = this.sectors.findIndex((c) => c.id === this.sector.id);
                    this.sectors[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'sector Updated',
                        life: 3000
                    });
                    this.sectorDialog = false;
                    this.sector = {};
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
            // Create new sector
            this.configurationService.createSector(obj).subscribe({
                next: (res) => {
                    this.sectors.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'sector Created',
                        life: 3000
                    });
                    this.sectorDialog = false;
                    this.sector = {};
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
        this.sectorDialog = false;
        this.submitted = false;
    }
}
