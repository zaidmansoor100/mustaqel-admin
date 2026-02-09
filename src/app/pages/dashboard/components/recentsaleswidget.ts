import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexStroke,
    ApexMarkers,
    ApexGrid,
    ApexXAxis,
    ApexYAxis,
    ApexTooltip
} from 'ng-apexcharts';

@Component({
    standalone: true,
    selector: 'app-line-widget',
    imports: [CommonModule, NgApexchartsModule],
    template: `
    <div class="bg-white rounded-2xl shadow-slate-400/15 shadow card-ch py-2">
        <h3 class="text-center !mb-0 !text-lg !font-semibold">Monthly Statistics</h3>
        <div class="chart-label">
            <apx-chart
            [series]="series"
            [chart]="chart"
            [stroke]="stroke"
            [markers]="markers"
            [grid]="grid"
            [xaxis]="xaxis"
            [yaxis]="yaxis"
            [tooltip]="tooltip"
            [legend]="legend">
            </apx-chart>
            <div class="px-6 grid grid-cols-2 gap-2">
                <div>
                    <div class="font-semibold text-base text-black">Current Month</div>
                    <div class="text-xs">Submitted <strong class="text-semibold">550</strong></div>
                    <div class="text-xs">Approved <strong class="text-semibold">550</strong></div>
                </div>
                <div class="line-bf">
                    <div class="font-semibold text-base text-black">Last Month</div>
                    <div class="text-xs">Submitted <strong class="text-semibold">550</strong></div>
                    <div class="text-xs">Approved <strong class="text-semibold">550</strong></div>
                </div>
            </div>
        </div>
    </div> 
  `
})
export class LineWidgetComponent implements OnChanges {

    @Input() seriesA: number[] = [];
    @Input() seriesB: number[] = [];

    series: ApexAxisChartSeries = [];

    chart: ApexChart = {
        // height: 200,
        type: 'line',
        toolbar: { show: false },
        zoom: { enabled: false }
    };

    stroke: ApexStroke = {
        curve: 'smooth',
        width: 2
    };

    markers: ApexMarkers = {
        size: 4,
        colors: ['#46B6E7', '#1D65D1'],
        strokeColors: '#fff',
        strokeWidth: 1,
        hover: { size: 6 }
    };

    grid: ApexGrid = {
        borderColor: 'rgba(0,0,0,0.15)',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, bottom: 0 } // reduce extra padding
    };

    xaxis: ApexXAxis = {
        categories: [],
        labels: {
            show: true,
            offsetY: -4,
            style: {
                colors: '#6b7280',
                fontSize: '10px',

            }
        },
        axisBorder: { show: true },
        axisTicks: { show: true }
    };

    yaxis: ApexYAxis = { 
        labels: { show: false },
        min: 0,
        forceNiceScale: false

    };

    tooltip: ApexTooltip = {
        shared: true,
        intersect: false
    };
    legend = {
        show: false
    };

    ngOnChanges() {
        this.xaxis.categories = this.getLast6Months();

        this.series = [
            {
                name: 'Series A',
                data: this.seriesA,
                color: '#46B6E7',
            },
            {
                name: 'Series B',
                data: this.seriesB,
                color: '#1D65D1'
            }
        ];
    }

    private getLast6Months(): string[] {
        const months = [];
        const date = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            months.push(d.toLocaleString('default', { month: 'short' })); // e.g., 'Jan'
        }
        return months;
    }
}
