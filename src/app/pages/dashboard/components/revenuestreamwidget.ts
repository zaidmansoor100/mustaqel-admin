import { Component, Input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart } from 'chart.js';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `
            <div class="mt-4 bg-white/25 p-2 mb-8!">
                <div class="font-extrabold text-xl mb-4 text-primary uppercase">{{title}} <span class="text-[#82163a]">Residency</span></div>
                <div class="flex justify-evenly flex-wrap gap-4 mb-8">
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#9a1a45] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">204</div>
                        <div class="text-center text-[#21295c] leading-5 font-bold text-base flex flex-col justify-center">
                            <span>Nominated</span>
                            <span>25 + 12 + 130</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#a93c61] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">111</div>
                        <div class="text-center text-[#21295c] leading-5 font-bold text-base flex flex-col justify-center">
                            <span>Validated</span>
                            <span>C2: (MOI/GTA) <br> N/A + 20 + 150</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#c88199] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">30</div>
                        <div class="text-center text-[#21295c] leading-5 font-bold text-base flex flex-col justify-center">
                            <span>Onboarded</span>
                            <span>12 + 16 + 83</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#d7a3b5] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">24</div>
                        <div class="text-center text-[#21295c] leading-5 font-bold text-base flex flex-col justify-center">
                            <span>Submitted to MoL</span>
                            <span>25 + 12 + 130</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#d7a3b5] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">18</div>
                        <div class="text-center text-[#21295c] leading-5 font-bold text-base flex flex-col justify-center">
                            <span>Submitted to <br> Jusour</span>
                            <span>25 + 12 + 130</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#d1b3bd] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">13</div>
                        <div class="text-center font-bold text-base flex leading-5 flex-col justify-center">
                            <span>Submitted to <br> Hayya</span>
                            <span>4+12+2</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#21295c] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">20%</div>
                        <div class="text-center font-bold text-base flex leading-5 flex-col justify-center">
                            <span>QID Awarded</span>
                            <span>3 + 10</span>
                            <span class="text-red-800">Rejected: 1+1</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="circle bg-[#9094ad] text-white text-xl h-[90px] w-[90px] rounded-full flex items-center justify-center text-center font-semibold">204</div>
                        <div class="text-center text-[#21295c] font-bold leading-5 text-base flex flex-col justify-center">
                            <span>Conversion</span>
                            <span>RATE(C1+2)</span>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 justify-between">
                    <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-100" />
                    <div class="justify-self-center w-[400px] text-primary">
                        <div class="font-bold text-xl text-primary">Key activities</div>
                        <div class="font-bold text-primary">Operational:</div>
                        <div>Cohort 1: 3 QIDs / 25 Nominated</div>
                        <div>Cohort 2: 10 QIDs / 40 Nominated</div>
                        <div>Cohort 3: 139 nominated / 83 Onboarded / 11 applied of jusour / <strong>9 mol</strong> / 2 successfull to Hayya / 1 failed Submission</div>
                        <div class="font-bold text-primary mt-4">Strategic:</div>
                        <div>Business case and collaboration agreement shared with MOCI to prepare meeting with jusour</div>
                        <div class="font-bold text-xl text-primary mt-6">Observation</div>
                        <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sed ultrices est, sit amet facilisis ex</div>
                    </div>
                </div>
            </div>`
})
export class RevenueStreamWidget {
    chartData: any;

    chartOptions: any;

    subscription!: Subscription;
    @Input() title: string = '';

    constructor(public layoutService: LayoutService) {
        Chart.register(ChartDataLabels, annotationPlugin);
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }


    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        const chartBars = [
            { value: 10, color: '#c47a93', label: 'Cohort 1' },
            { value: 20, color: '#104862', label: 'Cohort 2' },
            { value: 22, color: '#c1e5f5', label: 'Cohort 3' },
            { value: 30, color: '#c47a93', label: 'Cohort 1' },
            { value: 21, color: '#104862', label: 'Cohort 2' },
            { value: 50, color: '#c1e5f5', label: 'Cohort 3' },
            { value: 33, color: '#c47a93', label: 'Cohort 1' },
            { value: 43, color: '#104862', label: 'Cohort 2' },
            { value: 31, color: '#c1e5f5', label: 'Cohort 3' },
            { value: 40, color: '#c47a93', label: 'Cohort 1' },
            { value: 34, color: '#104862', label: 'Cohort 2' },
            { value: 70, color: '#c1e5f5', label: 'Cohort 3' }
        ];

        this.chartData = {
            labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
            datasets: [
                {
                    type: 'bar',
                    // label: 'Subscriptions',
                    data: chartBars.map(bar => bar.value),
                    backgroundColor: chartBars.map(bar => bar.color),
                    barThickness: 30
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: (chart: any) => {
                            const uniqueColors: any = [];
                            chartBars.forEach(bar => {
                                if (!uniqueColors.find((c: any) => c.color === bar.color)) {
                                    uniqueColors.push({ text: bar.label, color: bar.color });
                                }
                            });

                            return uniqueColors.map((item: any) => ({
                                text: item.text,
                                fillStyle: item.color,
                                strokeStyle: item.color,
                                hidden: false,
                                lineCap: 'butt',
                                lineDash: [],
                                lineDashOffset: 0,
                                lineJoin: 'miter',
                                width: 20,
                                font: { weight: 'bold' }
                            }));
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'start',
                    rotation: -90,
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    formatter: (value: number, context: any) => {
                        // return chartBars[context.dataIndex].label + ' (' + value + ')';
                        return value    
                    }
                },
                annotation: {
                    annotations: {
                        targetLine: {
                            type: 'line',
                            yMin: 50,
                            yMax: 50,           // horizontal line at 50
                            borderColor: '#333',
                            borderWidth: 2,
                            borderDash: [2, 2],
                            label: {
                                display: true,           // must be `display` instead of `enabled`
                                content: 'Target 13/50 APP',
                                position: 'start',      // center aligns on the line
                                backgroundColor: 'transparent',
                                color: '#333',
                                font: { weight: 'bold', size: 12 },
                                xAdjust: 0,
                                yAdjust: -10,
                                // rotation: 0,
                                clip: false
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { drawOnChartArea: false, drawTicks: true, tickLength: 10, color: textMutedColor },
                    ticks: { color: textMutedColor, font: { weight: 'bold' } }
                },
                y: {
                    grid: { drawTicks: true, drawOnChartArea: false, tickLength: 10, color: textMutedColor },
                    ticks: { color: textMutedColor, beginAtZero: true, padding: 5, font: { weight: 'bold' } }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
