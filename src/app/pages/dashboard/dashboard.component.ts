import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { ApplicationWidget } from './components/applicationWidget';
import { ProcessWidget } from './components/processWidget';
import { EntityWidget } from './components/entityWidget';
import { LineWidgetComponent } from './components/recentsaleswidget';
import { ConfigurationService } from '@/services/configuration.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AreaChartComponent } from './components/lineWidgetComponent';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ApplicationWidget, ProcessWidget, EntityWidget, LineWidgetComponent, CommonModule, FormsModule,
    DatePickerModule, SelectModule, FloatLabelModule, AreaChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  tabs = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4'];
  activeTab = 0;

  constructor(
    private configuration: ConfigurationService,
    private messageService: MessageService
  ) { }
  value1: Date | undefined;
  categories = []
  seriesData = [
    { name: 'Submission stage', value: 80, color: '#1b9ff0' },
    { name: 'QC stage', value: 60, color: '#c4d8fa' },
    { name: 'Endorsement stage', value: 30, color: '#46b6e7' },
    { name: 'MOL stage', value: 20, color: '#ffae4c' },
    { name: 'Hayya stage', value: 17, color: '#2db2cd' },
    { name: 'Printed stage', value: 41, color: '#1d65d1' }
  ];

  processData = [
    { name: 'Jusour', value: 2.9, color: '#1D65D1' },
    { name: 'MOL', value: 1.5, color: '#2FBACB' },
    { name: 'Endorser', value: 5.0, color: '#A0D467' },
    { name: 'Hayya', value: 4.5, color: '#FFAE4C' },
  ];

  entityData = [
    { name: 'Jusour', value: 420, color: '#1D65D1' },
    { name: 'MOL', value: 850, color: '#2FBACB' },
    { name: 'Endorser', value: 23, color: '#A0D467' },
    { name: 'Hayya', value: 22, color: '#FFAE4C' },
  ];

  series = [
    {
      name: 'Series 1',
      data: [42, 55, 38, 60, 45, 70]
    },
    {
      name: 'Series 2',
      data: [60, 48, 52, 40, 58, 46]
    },
    {
      name: 'Series 3',
      data: [30, 35, 28, 45, 32, 40]
    },
    {
      name: 'Series 4',
      data: [20, 25, 22, 30, 28, 34]
    }
  ];

  getCats() {
    this.configuration.getCategories('?page=1').subscribe({
      next: (res: any) => {
        console.log(res)
        this.categories = res.data
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
          life: 3000
        });
      }
    });
  }

  ngOnInit(): void {
    this.getCats();
  }


}
