import { Component } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { AuthHelperService } from '@/services/auth-helper-service';
import { Menu } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';

@Component({
    selector: 'app-topbar',
    imports: [RouterModule, CommonModule, Menu, AvatarModule, StyleClassModule],
    templateUrl: './app-topbar.component.html',
    styleUrl: './app-topbar.component.scss'
})
export class AppTopbarComponent {
    items!: MenuItem[];
    MenuItems: MenuItem[] = [];
    lang: any
    constructor(public layoutService: LayoutService, private authHelpeService: AuthHelperService,
        private messageService: MessageService, private router: Router) {
        this.MenuItems = [
            {
                label: 'Profile',
                items: [
                    { label: 'Settings', icon: 'pi pi-cog' },
                    {
                        label: 'Logout', icon: 'pi pi-sign-out',
                        command: () => this.logout()
                    },
                ],
            },
        ];
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }


    logout() {
        const loggedOut = this.authHelpeService.forceLogoutClient();

        if (loggedOut) {
            this.messageService.add({
                severity: 'success',
                summary: 'Logged out',
                detail: 'You have been logged out successfully'
            });

            setTimeout(() => {
                this.router.navigate(['/auth/login']);
            }, 800);
        }
    }

}
