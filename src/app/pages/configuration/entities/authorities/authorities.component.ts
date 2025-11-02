import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Product, ProductService } from '@/pages/service/product.service';
import { ConfigurationService } from '@/services/configuration.service';
import { ActivatedRoute } from '@angular/router';
import { CustomValidators } from '@/common/validators/custom-validators';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-authorities',
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        ReactiveFormsModule,
        MultiSelectModule
    ],
    templateUrl: './authorities.component.html',
    styleUrl: './authorities.component.scss',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class AuthoritiesComponent implements OnInit {
    entityDialog: boolean = false;
    submitted: boolean = false;
    selectedEntities: any[] = [];
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
    entities: any[] = [];
    activities: any[] = [];
    entity: any = {};

    @ViewChild('dt') dt!: Table;

    exportColumns!: any[];
    cols!: any[];
    entityForm!: FormGroup;

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
        this.entities = this.activatedRoute.snapshot.data['entityResolver'][0]['data'];
        this.activities = this.activatedRoute.snapshot.data['entityResolver'][1]['data'];
        this.exportCSVData();
        this.formBuild();
    }

    exportCSV() {
        const formatted = this.entities.map((row: any) => ({
            ...row,
            activities: row.activities?.map((c: any) => c.name).join(', ') || 'No Activities',
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
            { field: 'name', header: 'Entity Name (English)' },
            { field: 'nameAr', header: 'Entity Name (Arabic)' },
            { field: 'activitiesName', header: 'Activities Name' },
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

    loadEntities(event: any) {
        const page = event.first / event.rows + 1;
        const perPage = event.rows;
        this.configurationService.getEntities(`?page=${page}&per_page=${perPage}`).subscribe({
            next: (res) => {
                this.entities = res.data;
                this.totalRecords = res.total;
                this.page = res.current_page;
            },
            error: (error: any) => {
                console.log(error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load entities',
                    life: 3000
                });
            }
        });
    }

    formBuild(entity?: any) {
        this.entityForm = this.fb.group({
            activityIds: [entity?.activityIds || [], [Validators.required]],
            name: [entity?.name || '', [Validators.required, Validators.maxLength(50), Validators.minLength(3), CustomValidators.alpha()]],
            nameAr: [entity?.nameAr || '', [Validators.required, Validators.maxLength(255), Validators.minLength(3), CustomValidators.arabic()]],
            status: [entity?.status || '', [Validators.required, Validators.maxLength(1)]]
        });
    }

    openNew() {
        this.formBuild();
        this.entity = {};
        this.submitted = false;
        this.entityDialog = true;
    }

    editEntity(entity: any) {
        this.formBuild(entity);
        this.entity = { ...entity };
        this.entityDialog = true;
    }

    deleteSelectedEntities() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected Entities?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deleteRequests = this.selectedEntities.map((cat: any) => this.configurationService.deleteEntity(cat.id));

                // Run all delete requests
                Promise.all(deleteRequests.map((req: any) => req.toPromise()))
                    .then(() => {
                        this.entities = this.entities.filter((val: any) => !this.selectedEntities.includes(val));
                        this.selectedEntities = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Entities Deleted',
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

    deleteEntity(entity: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + entity.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.configurationService.deleteEntity(entity.id).subscribe({
                    next: () => {
                        this.entities = this.entities.filter((val: any) => val.id !== entity.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Entity Deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.error.message,
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    saveEntity() {
        this.submitted = true;
        const formValue = this.entityForm.value;

        const obj = {
            activityIds: formValue.activityIds,
            name: formValue.name,
            nameAr: formValue.nameAr,
            status: formValue.status
        };

        if (this.entity.id) {
            // Update existing entity
            this.configurationService.updateEntity(this.entity.id, obj).subscribe({
                next: (res) => {
                    const index = this.entities.findIndex((c) => c.id === this.entity.id);
                    this.entities[index] = res;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Entity Updated',
                        life: 3000
                    });
                    this.entityDialog = false;
                    this.entity = {};
                },
                error: (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message,
                        life: 3000
                    });
                }
            });
        } else {
            // Create new entity
            this.configurationService.createEntity(obj).subscribe({
                next: (res) => {
                    this.entities.push(res);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Entity Created',
                        life: 3000
                    });
                    this.entityDialog = false;
                    this.entity = {};
                },
                error: (error) => {
                    console.log(error.error.message);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error.message,
                        life: 3000
                    });
                }
            });
        }
    }

    hideDialog() {
        this.entityDialog = false;
        this.submitted = false;
    }
}
