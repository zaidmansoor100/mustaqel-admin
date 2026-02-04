import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuItemComponent } from '../app-menu-item/app-menu-item.component';

@Component({
    selector: 'app-menu',
    imports: [CommonModule, AppMenuItemComponent, RouterModule],
    templateUrl: './app-menu.component.html',
    styleUrl: './app-menu.component.scss'
})
export class AppMenuComponent {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Operations',
                items: [
                    {
                        label: 'Endorsement Applications',
                        icon: 'pi pi-sitemap',
                        items: [
                            {
                                label: 'Talent Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/endorsement-applications']
                            },
                            {
                                label: 'Entrepreneur Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/entrepreneur-applications']
                            },
                            {
                                label: 'Investor Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/investor-applications']
                            },
                            {
                                label: 'Executive Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/executive-applications']
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Configuration',
                items: [
                    { label: 'Categories', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/categories'] },
                    { label: 'Sub Categories', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/sub-categories'] },
                    { label: 'Sectors', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/sectors'] },
                    { label: 'Activities', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/activities'] },
                    { label: 'Sub Activities', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/sub-activities'] },
                    { 
                        label: 'Entities', 
                        icon: 'pi pi-th-large', 
                        items: [
                            {
                                label: 'Authorities',
                                icon: 'pi pi-id-card',
                                routerLink: ['/pages/configurations/authorities']
                            },
                            {
                                label: 'Incubators',
                                icon: 'pi pi-id-card',
                                routerLink: ['/pages/configurations/incubators']
                            },
                        ]
                    },
                    { label: 'Extra Form Fields', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/extra-fields'] },
                    { label: 'Stages', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/stages'] },
                    { label: 'Stage Statuses', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/stage-statuses'] }
                ]
            },
            {
                label: 'Administration',
                items: [
                    {
                        label: 'Users',
                        icon: 'pi pi-users',
                        items: [
                            {
                                label: 'Admin Users',
                                icon: 'pi pi-user',
                                routerLink: ['/pages/administration/admin-users']
                            },
                            {
                                label: 'Applicant Users',
                                icon: 'pi pi-user',
                                routerLink: ['/pages/administration/applicant-users']
                            },
                            {
                                label: 'Entity & Incubator Users',
                                icon: 'pi pi-user',
                                routerLink: ['/pages/administration/entity-users']
                            }
                        ]
                    },
                    { label: 'Roles', icon: 'pi pi-cog', routerLink: ['/pages/administration/roles'] },
                    { label: 'Delete Audits', icon: 'pi pi-cog', routerLink: ['/dashboard'] },
                    { label: 'Promotion Emails', icon: 'pi pi-envelope', routerLink: ['/dashboard'] }
                ]
            }
        ];
    }
}
