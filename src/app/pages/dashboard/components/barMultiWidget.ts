import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexXAxis,
  ApexYAxis,
  ApexFill,
  ApexTooltip
} from 'ng-apexcharts';

@Component({
  standalone: true,
  selector: 'app-bar-multi-widget',
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="">
      <apx-chart
        *ngIf="series?.length"
        [series]="series"
        [chart]="chart"
        [plotOptions]="plotOptions"
        [dataLabels]="dataLabels"
        [stroke]="stroke"
        [xaxis]="xaxis"
        [yaxis]="yaxis"
        [fill]="fill"
        [tooltip]="tooltip">
      </apx-chart>
    </div>
  `
})
export class BarMultiWidgetComponent implements OnChanges {

  /** 👇 incoming data from parent */
  @Input() chartSeries: ApexAxisChartSeries = [];
  @Input() categories: string[] = [];

  /** 👇 internal binding */
  series: ApexAxisChartSeries = [];

  chart: ApexChart = {
    type: 'bar',
    height: 200,
    toolbar: { show: false }
  };

  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      // columnWidth: '55%',
      borderRadius: 0,
      borderRadiusApplication: 'end'
    }
  };

  dataLabels: ApexDataLabels = {
    enabled: false
  };

  stroke: ApexStroke = {
    show: true,
    width: 2,
    colors: ['transparent']
  };

  xaxis: ApexXAxis = {
    categories: []
  };

  yaxis: ApexYAxis = {
    // title: {
    //   text: '$ (thousands)'
    // }
  };

  fill: ApexFill = {
    opacity: 1
  };

  tooltip: ApexTooltip = {
    y: {
      formatter: (val: number) => `${val}`
    }
  };

  ngOnChanges() {
    if (this.chartSeries?.length) {
      this.series = [...this.chartSeries];
    }

    if (this.categories?.length) {
      this.xaxis = {
        ...this.xaxis,
        categories: this.categories
      };
    }
  }
}
