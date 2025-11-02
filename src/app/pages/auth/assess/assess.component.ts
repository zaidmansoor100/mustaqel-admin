import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfiguratorComponent } from '@/layout/component/app-floating-configurator/app-floating-configurator.component';


@Component({
  selector: 'app-assess',
  imports: [ButtonModule, RouterModule, RippleModule, AppFloatingConfiguratorComponent, ButtonModule],
  templateUrl: './assess.component.html',
  styleUrl: './assess.component.scss'
})
export class AssessComponent {

}
