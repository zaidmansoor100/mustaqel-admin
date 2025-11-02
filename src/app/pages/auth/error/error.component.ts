import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfiguratorComponent } from '@/layout/component/app-floating-configurator/app-floating-configurator.component';

@Component({
  selector: 'app-error',
  imports: [ButtonModule, RippleModule, RouterModule, AppFloatingConfiguratorComponent, ButtonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {

}
