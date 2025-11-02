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
                    { label: 'Extra Form Fields', icon: 'pi pi-th-large', routerLink: ['/pages/configurations/extra-fields'] }
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
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Applicant Users',
                                icon: 'pi pi-user',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Entity & Incubator Users',
                                icon: 'pi pi-user',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    { label: 'Roles', icon: 'pi pi-cog', routerLink: ['/dashboard'] },
                    { label: 'Delete Audits', icon: 'pi pi-cog', routerLink: ['/dashboard'] },
                    { label: 'Promotion Emails', icon: 'pi pi-envelope', routerLink: ['/dashboard'] }
                ]
            }
        ];
    }
}
