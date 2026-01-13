import { Component } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { BarsWidget } from './components/barsWidgets';
import { talentWidgets } from './components/talentWidgets';
import { ReportingGraphComponent } from './components/reportingGraphComponent';

@Component({
  selector: 'app-dashboard',
  // imports: [RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
  imports: [BarsWidget, RevenueStreamWidget],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
