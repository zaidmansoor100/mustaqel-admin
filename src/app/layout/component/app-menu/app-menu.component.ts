// src/app/layout/component/app-menu/app-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuItemComponent } from '../app-menu-item/app-menu-item.component';
import { PermissionService } from '../../../services/permission.service';
import { Permission } from '../../../enums/permission.enum';
import { AuthService } from '../../../services/http/auth.service';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuItemComponent, RouterModule],
    templateUrl: './app-menu.component.html',
    styleUrl: './app-menu.component.scss'
})
export class AppMenuComponent implements OnInit {
    model: MenuItem[] = [];
    private originalModel: MenuItem[] = [];

    constructor(
        private permissionService: PermissionService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.initializeMenu();
        
        // Listen for permission changes and re-filter menu
        this.authService.permissions$.subscribe(() => {
            this.filterMenuByPermissions();
        });
    }

    private initializeMenu(): void {
        this.originalModel = [
            {
                label: 'Home',
                items: [
                    { 
                        label: 'Dashboard', 
                        icon: 'pi pi-fw pi-home', 
                        routerLink: ['/'] 
                    }
                ]
            },
            {
                label: 'Operations',
                items: [
                    {
                        label: 'Endorsement Applications',
                        icon: 'pi pi-sitemap',
                        permissionMode: 'any',
                        permissions: [
                            Permission.VIEW_TALENT,
                            Permission.VIEW_ENTREPRENEUR,
                            Permission.VIEW_INVESTOR,
                            Permission.VIEW_EXECUTIVE
                        ],
                        items: [
                            {
                                label: 'Talent Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/endorsement-applications'],
                                permission: Permission.VIEW_TALENT
                            },
                            {
                                label: 'Entrepreneur Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/entrepreneur-applications'],
                                permission: Permission.VIEW_ENTREPRENEUR
                            },
                            {
                                label: 'Investor Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/investor-applications'],
                                permission: Permission.VIEW_INVESTOR
                            },
                            {
                                label: 'Executive Applications',
                                icon: 'pi pi-file-edit',
                                routerLink: ['/pages/applications/executive-applications'],
                                permission: Permission.VIEW_EXECUTIVE
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Configuration',
                items: [
                    { 
                        label: 'Categories', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/categories'],
                        permission: Permission.VIEW_CATEGORIES
                    },
                    { 
                        label: 'Sub Categories', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/sub-categories'],
                        permission: Permission.VIEW_SUB_CATEGORIES
                    },
                    { 
                        label: 'Sectors', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/sectors'],
                        permission: Permission.VIEW_SECTORS
                    },
                    { 
                        label: 'Activities', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/activities'],
                        permission: Permission.VIEW_ACTIVITIES
                    },
                    { 
                        label: 'Sub Activities', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/sub-activities'],
                        permission: Permission.VIEW_SUB_ACTIVITIES
                    },
                    { 
                        label: 'Entities', 
                        icon: 'pi pi-th-large',
                        permissionMode: 'any',
                        permissions: [Permission.VIEW_ENTITIES, Permission.VIEW_INCUBATORS],
                        items: [
                            {
                                label: 'Authorities',
                                icon: 'pi pi-id-card',
                                routerLink: ['/pages/configurations/authorities'],
                                permission: Permission.VIEW_ENTITIES
                            },
                            {
                                label: 'Incubators',
                                icon: 'pi pi-id-card',
                                routerLink: ['/pages/configurations/incubators'],
                                permission: Permission.VIEW_INCUBATORS
                            },
                        ]
                    },
                    { 
                        label: 'Extra Form Fields', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/extra-fields'],
                        permission: Permission.VIEW_FORM_FIELDS
                    },
                    { 
                        label: 'Stages', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/stages'],
                        permission: Permission.VIEW_STAGES
                    },
                    { 
                        label: 'Stage Statuses', 
                        icon: 'pi pi-th-large', 
                        routerLink: ['/pages/configurations/stage-statuses'],
                        permission: Permission.VIEW_STAGE_STATUSES
                    }
                ]
            },
            {
                label: 'Administration',
                items: [
                    {
                        label: 'Users',
                        icon: 'pi pi-users',
                        permissionMode: 'any',
                        permissions: [
                            Permission.VIEW_ADMIN_USERS,
                            Permission.VIEW_APPLICANT_USERS,
                            Permission.VIEW_ENTITY_USERS
                        ],
                        items: [
                            {
                                label: 'Admin Users',
                                icon: 'pi pi-user',
                                routerLink: ['/pages/administration/admin-users'],
                                permission: Permission.VIEW_ADMIN_USERS
                            },
                            {
                                label: 'Applicant Users',
                                icon: 'pi pi-user',
                                routerLink: ['/pages/administration/applicant-users'],
                                permission: Permission.VIEW_APPLICANT_USERS
                            },
                            {
                                label: 'Entities Users',
                                icon: 'pi pi-user',
                                routerLink: ['/pages/administration/entity-users'],
                                permission: Permission.VIEW_ENTITY_USERS
                            }
                        ]
                    },
                    { 
                        label: 'Roles', 
                        icon: 'pi pi-cog', 
                        routerLink: ['/pages/administration/roles'],
                        permission: Permission.VIEW_ROLES
                    },
                    { 
                        label: 'Delete Audits', 
                        icon: 'pi pi-cog', 
                        routerLink: ['/dashboard'],
                        permission: Permission.VIEW_DELETED_AUDIT
                    },
                    { 
                        label: 'Promotion Emails', 
                        icon: 'pi pi-envelope', 
                        routerLink: ['/dashboard'],
                        permission: Permission.VIEW_PROMOTIONAL_EMAILS
                    }
                ]
            }
        ];

        this.filterMenuByPermissions();
    }

    private filterMenuByPermissions(): void {
        // Create an array of observables for each top-level menu item
        const menuObservables = this.originalModel.map(item => this.filterMenuItemObservable(item));
        
        // Combine all observables and subscribe
        combineLatest(menuObservables).subscribe(filteredItems => {
            this.model = filteredItems.filter(item => item !== null) as MenuItem[];
        });
    }

    private filterMenuItemObservable(item: MenuItem): Observable<MenuItem | null> {
        // Check single permission
        if (item['permission']) {
            return this.permissionService.hasPermission(item['permission'] as string).pipe(
                map(hasPermission => {
                    if (!hasPermission) return null;
                    return this.filterChildren(item);
                })
            );
        }

        // Check multiple permissions
        if (item['permissions'] && item['permissions'].length > 0) {
            const mode = (item as any).permissionMode || 'any';
            let permissionCheck$: Observable<boolean>;
            
            if (mode === 'all') {
                permissionCheck$ = this.permissionService.hasAllPermissions(item['permissions'] as string[]);
            } else {
                permissionCheck$ = this.permissionService.hasAnyPermission(item['permissions'] as string[]);
            }
            
            return permissionCheck$.pipe(
                map(hasPermission => {
                    if (!hasPermission) return null;
                    return this.filterChildren(item);
                })
            );
        }

        // No permissions required
        return of(this.filterChildren(item));
    }

    private filterChildren(item: MenuItem): MenuItem | null {
        // Clone the item
        const filteredItem = { ...item };
        
        // If no children, return the item
        if (!filteredItem.items || filteredItem.items.length === 0) {
            return filteredItem;
        }
        
        // Filter children recursively (using sync check since they're already loaded)
        const filteredChildren: MenuItem[] = [];
        
        for (const child of filteredItem.items) {
            // For children, we need to check permissions as well
            // Since this is called after parent permission is confirmed, we need to check child permissions
            if (child['permission']) {
                if (this.permissionService.hasPermissionSync(child['permission'] as string)) {
                    const filteredChild = this.filterChildren(child);
                    if (filteredChild) {
                        filteredChildren.push(filteredChild);
                    }
                }
            } else if (child['permissions'] && child['permissions'].length > 0) {
                const mode = (child as any).permissionMode || 'any';
                let hasPermission = false;
                
                if (mode === 'all') {
                    hasPermission = this.permissionService.hasAllPermissionsSync(child['permissions'] as string[]);
                } else {
                    hasPermission = this.permissionService.hasAnyPermissionSync(child['permissions'] as string[]);
                }
                
                if (hasPermission) {
                    const filteredChild = this.filterChildren(child);
                    if (filteredChild) {
                        filteredChildren.push(filteredChild);
                    }
                }
            } else {
                const filteredChild = this.filterChildren(child);
                if (filteredChild) {
                    filteredChildren.push(filteredChild);
                }
            }
        }
        
        filteredItem.items = filteredChildren;
        
        // If no children left and this is not a root item, return null
        if (filteredItem.items.length === 0 && !this.isRootItem(filteredItem)) {
            return null;
        }
        
        return filteredItem;
    }

    private isRootItem(item: MenuItem): boolean {
        // Check if this is a top-level menu item (has no parent)
        return this.originalModel.some(originalItem => originalItem === item);
    }
}