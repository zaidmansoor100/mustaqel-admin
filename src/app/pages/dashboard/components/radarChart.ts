import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts'; import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexMarkers,
  ApexLegend,
  ApexPlotOptions,
  ApexYAxis
} from 'ng-apexcharts';

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  markers: ApexMarkers;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
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
      [legend]="chartOptions.legend"
      [plotOptions]="chartOptions.plotOptions">
    </apx-chart>
  `
})
export class RadarChartComponent implements OnChanges {

  @Input() series: number[] = [];

  chartOptions!: RadarChartOptions;

  ngOnChanges(): void {
    this.initChart();
  }

  private initChart() {
    this.chartOptions = {
      series: [
        {
          name: 'Metrics',
          data: this.series
        }
      ],

      chart: {
        type: 'radar',
        toolbar: { show: false }
      },

      xaxis: {
        categories: [
          'Approval Rate',
          'Processing Rate',
          'Processing Time',
          'Backlog Score',
          'Skewness',
        ]
      },

      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5
      },

      dataLabels: {
        enabled: false  
      },

      stroke: {
        width: 2
      },

      fill: {
        opacity: 0.3
      },

      markers: {
        size: 4,
        hover: {
          size: 6
        }
      },

      plotOptions: {
        radar: {
          polygons: {
            strokeColors: '#e5e7eb',
            connectorColors: '#B7C2FD',
            fill: {
              colors: ['transparent']
            }
          }
        }
      },

      legend: {
        show: true,
        position: 'bottom'
      }
    };
  }
}
