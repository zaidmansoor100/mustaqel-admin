import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reporting-graph',
  standalone: true,
  imports:[CommonModule],
  template: `
    <div class="chart-wrapper">
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" preserveAspectRatio="xMidYMid meet">

        <!-- Background vertical bands -->
        <rect [attr.x]="0" [attr.y]="0" [attr.width]="band1W" [attr.height]="height" [attr.fill]="colors.light" />
        <rect [attr.x]="band1W" [attr.y]="0" [attr.width]="band2W" [attr.height]="height" [attr.fill]="colors.mid" />
        <rect [attr.x]="band1W+band2W" [attr.y]="0" [attr.width]="band3W" [attr.height]="height" [attr.fill]="colors.aqua" />
        <rect [attr.x]="band1W+band2W+band3W" [attr.y]="0" [attr.width]="band4W" [attr.height]="height" [attr.fill]="colors.dark" />

        <!-- Y axis -->
        <line [attr.x1]="marginLeft" [attr.y1]="marginTopArrow" [attr.x2]="marginLeft" [attr.y2]="height - marginBottom" [attr.stroke]="colors.stroke" stroke-width="4"/>
        <polygon [attr.points]="yArrowPoints" [attr.fill]="colors.stroke"/>

        <!-- X axis -->
        <line [attr.x1]="marginLeft" [attr.y1]="height - marginBottom" [attr.x2]="width - marginRightArrow" [attr.y2]="height - marginBottom" [attr.stroke]="colors.stroke" stroke-width="4"/>
        <polygon [attr.points]="xArrowPoints" [attr.fill]="colors.stroke"/>

        <!-- Target line -->
        <line [attr.x1]="marginLeft" [attr.x2]="width - marginRightArrow"
              [attr.y1]="yForValue(targetValue)" [attr.y2]="yForValue(targetValue)"
              stroke-dasharray="6 6" [attr.stroke]="colors.stroke" stroke-width="2"/>
        <text [attr.x]="width - marginRightArrow - 8" [attr.y]="yForValue(targetValue) - 6"
              text-anchor="end" font-weight="700" fill="#083344">Target {{targetValue}} APP</text>

        <!-- Month ticks -->
        <g *ngFor="let m of months; let i = index">
          <line [attr.x1]="xForIndex(i)" [attr.x2]="xForIndex(i)" [attr.y1]="height - marginBottom" [attr.y2]="height - marginBottom + 8" stroke="#083344" stroke-width="3"/>
          <text [attr.x]="xForIndex(i)" [attr.y]="height - marginBottom + 26" text-anchor="middle" font-size="12" fill="#083344">{{ m }}</text>
        </g>

        <!-- Polygon -->
        <polygon [attr.points]="polygonPoints"
                 [attr.fill]="colors.polygon"
                 [attr.stroke]="colors.stroke"
                 stroke-width="2" opacity="0.98" />

        <!-- Data labels -->
        <g *ngFor="let p of dataPoints">
          <text *ngIf="p.value > 0" [attr.x]="p.x" [attr.y]="p.y - 12" text-anchor="middle" font-size="11" fill="#083344">{{ p.value }}</text>
        </g>

        <!-- Circle markers -->
        <g>
          <circle [attr.cx]="xForIndex(2)" [attr.cy]="yForValue(dataValues[2])" r="18" [attr.fill]="colors.stroke" stroke="#ffffff" stroke-width="2"/>
          <text [attr.x]="xForIndex(2)" [attr.y]="yForValue(dataValues[2]) + 5" text-anchor="middle" font-weight="700" font-size="13" fill="#fff">3</text>

          <circle [attr.cx]="xForIndex(6)" [attr.cy]="yForValue(dataValues[6])" r="18" [attr.fill]="colors.stroke" stroke="#ffffff" stroke-width="2"/>
          <text [attr.x]="xForIndex(6)" [attr.y]="yForValue(dataValues[6]) + 5" text-anchor="middle" font-weight="700" font-size="13" fill="#fff">2</text>

          <circle [attr.cx]="xForIndex(8)" [attr.cy]="yForValue(dataValues[8])" r="18" [attr.fill]="colors.stroke" stroke="#ffffff" stroke-width="2"/>
          <text [attr.x]="xForIndex(8)" [attr.y]="yForValue(dataValues[8]) + 5" text-anchor="middle" font-weight="700" font-size="13" fill="#fff">1</text>
        </g>

      </svg>
    </div>
  `,
  styles: [`
    .chart-wrapper { width: 100%; max-width: 1200px; margin: 0 auto; background: white; padding: 8px 0; }
    svg { display:block; }
  `]
})
export class ReportingGraphComponent {

  width = 1000;
  height = 360;

  marginLeft = 60;
  marginBottom = 60;
  marginTopArrow = 4;
  marginRightArrow = 24;

  colors = {
    light: '#D9EFFA',
    mid: '#A8D7F2',
    aqua: '#47ABE0',
    dark: '#123F4E',
    polygon: '#F9E3D7',
    stroke: '#123F4E'
  };

  band1W = 250;
  band2W = 275;
  band3W = 120;
  band4W = this.width - (250 + 275 + 120);

  months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  dataValues = [35,0,0,0,0,0,0,0,9,34,34,0];
  targetValue = 10;

  xPositions = [60,123,187,250,314,378,441,505,569,632,696,760];

  xForIndex(i: number) { return this.xPositions[i]; }

  yForValue(v: number) {
    const maxValue = 36;
    const top = 24;
    const bottom = this.height - this.marginBottom;
    return Math.round(bottom - (v / maxValue) * (bottom - top));
  }

  get polygonPoints(): string {
    const pts: [number,number][] = [];
    for (let i = 0; i < this.dataValues.length; i++) {
      pts.push([this.xForIndex(i), this.yForValue(this.dataValues[i])]);
    }
    const baselineY = this.height - this.marginBottom;
    pts.push([this.xForIndex(this.dataValues.length - 1), baselineY]);
    pts.push([this.xForIndex(0), baselineY]);
    return pts.map(p => p.join(',')).join(' ');
  }

  get dataPoints() {
    return this.dataValues.map((v, i) => ({ x: this.xForIndex(i), y:     this.yForValue(v), value: v }));
  }

  get yArrowPoints(): string {
    const cx = this.marginLeft;
    const top = 0;
    const points = [[cx, top], [cx-8, top+18], [cx+8, top+18]];
    return points.map(p => p.join(',')).join(' ');
  }

  get xArrowPoints(): string {
    const y = this.height - this.marginBottom;
    const right = this.width - this.marginRightArrow + 16;
    const points = [[right, y], [right-18, y-8], [right-18, y+8]];
    return points.map(p => p.join(',')).join(' ');
  }

}
