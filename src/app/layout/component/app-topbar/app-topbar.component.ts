import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';

@Component({
    selector: 'app-topbar',
    imports: [RouterModule, CommonModule, StyleClassModule],
    templateUrl: './app-topbar.component.html',
    styleUrl: './app-topbar.component.scss'
})
export class AppTopbarComponent {
    items!: MenuItem[];

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
