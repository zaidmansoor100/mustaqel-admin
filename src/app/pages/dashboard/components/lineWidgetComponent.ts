import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '@/services/request.service';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexMarkers,
  ApexTooltip,
  ApexLegend,
  ApexGrid
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  grid: ApexGrid;
};

@Component({
  selector: 'app-area-chart',
  imports: [CommonModule, NgApexchartsModule],
  standalone: true,
  template: `
    <apx-chart
      [series]="chartOptions.series"
      [chart]="chartOptions.chart"
      [xaxis]="chartOptions.xaxis"
      [yaxis]="chartOptions.yaxis"
      [dataLabels]="chartOptions.dataLabels"
      [stroke]="chartOptions.stroke"
      [fill]="chartOptions.fill"
      [markers]="chartOptions.markers"
      [tooltip]="chartOptions.tooltip"
      [legend]="chartOptions.legend"
      [grid]="chartOptions.grid">
    </apx-chart>
  `
})
export class AreaChartComponent implements OnChanges {

  @Input() seriesData!: ApexAxisChartSeries;


  chartOptions!: ChartOptions;

  ngOnChanges(): void {
    this.initChart();
  }

  private initChart() {
    if (!this.seriesData?.length) return;

    this.chartOptions = {
      series: this.seriesData, // ✅ DIRECT USE

      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
        parentHeightOffset: 0
      },

      xaxis: {
        categories: this.lastSixMonths(),
        axisBorder: { show: false },
        axisTicks: { show: false }
      },

      yaxis: {
        labels: { show: false }
      },

      grid: {
        padding: {
          top: 0,
          bottom: 0
        }
      },

      dataLabels: { enabled: false },

      stroke: {
        curve: 'smooth',
        width: 2
      },

      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0,
          stops: [0, 100]
        }
      },

      markers: {
        size: 6,
        hover: { size: 7 },
        strokeWidth: 2
      },

      tooltip: {
        y: {
          formatter: (val: number) => `${val}`
        }
      },

      legend: { show: false }
    };
  }


  private lastSixMonths(): string[] {
    const months = [];
    const date = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push(
        d.toLocaleString('default', { month: 'short' })
      );
    }
    return months;
  }
}
