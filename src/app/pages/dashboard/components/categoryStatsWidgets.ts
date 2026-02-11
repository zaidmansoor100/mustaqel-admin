import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '@/services/request.service';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
    ApexNonAxisChartSeries,
    ApexChart,
    ApexStroke,
    ApexPlotOptions,
    ApexLegend,
    ApexTooltip,
    ApexDataLabels,
    ApexResponsive
} from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { LayoutService } from '@/layout/service/layout.service';

@Component({
    standalone: true,
    selector: 'category-stage-widget',
    imports: [CommonModule, NgApexchartsModule, FormsModule, SelectModule],
    template: `
        <div class="">
                <div class="flex justify-between px-4">
                    <h3 class="!mb-0 !text-lg !font-semibold">Applications</h3>
                    <div class="filters">
                        <p-select [options]="categories" size="small" placeholder="Categories" class="w-full"
                            optionLabel="name"> 
                        </p-select>
                    </div>
                </div>
                <div class="chart-label">
                    <apx-chart [series]="series" [chart]="chart" [colors]="colors" [stroke]="stroke"
                        [plotOptions]="plotOptions" [legend]="legend" [dataLabels]="dataLabels" [tooltip]="tooltip">
                    </apx-chart>
                </div>
            </div>
    `
})
export class CategoryStatsWidget implements OnChanges {
    constructor() { }
    @Input() seriesData!: { name: string; value: number; color: string }[];


    series: ApexNonAxisChartSeries = [];
    colors: string[] = [];


    chart: ApexChart = {
        type: 'donut',
        redrawOnParentResize: true,
        redrawOnWindowResize: true
    };

    stroke: ApexStroke = { width: 1, colors: ['#ffffff'] };

    plotOptions: ApexPlotOptions = {
        pie: {
            donut: {
                size: '75%',
                labels: {
                    show: true,
                    name: {
                        show: true, fontSize: '12px', color: '#888', offsetY: 0,

                    },
                    value: { show: true, fontSize: '18px', fontWeight: 600, color: '#111', offsetY: 4 },
                    total: {
                        show: true,
                        label: 'Total Applications',
                        fontSize: '12px',
                        fontWeight: 500,
                        formatter: () =>
                            this.seriesData.reduce((sum, d) => sum + d.value, 0).toString()

                    }
                }
            }
        }
    };

    dataLabels: ApexDataLabels = { enabled: false };

    legend: ApexLegend = {
        position: 'bottom',
        fontSize: '10px',
        horizontalAlign: 'left',
        markers: { shape: 'square' },

        formatter: (seriesName, opts) => {
            const index = opts.seriesIndex;
            const data = this.seriesData[index];
            return `${data.name} <strong>${data.value}</strong>`;
        },
        itemMargin: { horizontal: 0, vertical: 1.5 }
    };

    tooltip: ApexTooltip = {
        custom: ({ seriesIndex }) => {
            const d = this.seriesData[seriesIndex];

            return `
      <div style="display:flex;align-items:center;gap:6px;padding:8px">
        <span style="
          width:8px;
          height:8px;
          border-radius:50%;
          background:${d.color};
        "></span>
        <span style="font-size:12px">
          ${d.name}: <b>${d.value}</b>
        </span>
      </div>
    `;
        }
    };
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['seriesData'] && this.seriesData.length) {
            this.series = this.seriesData.map(d => d.value);
            this.colors = this.seriesData.map(d => d.color);
        }
    }

    categories = [
        { name: 'By Category' },
        { name: 'By Stage' },
    ]

}
