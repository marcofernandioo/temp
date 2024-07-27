import { Routes } from '@angular/router';
import { AppDashboardComponent } from './dashboard/dashboard.component';
import { TimelineComponent } from './timeline/timeline.component';
import { InfoComponent } from './info/info.component';

export const PagesRoutes: Routes = [
  {
    path: 'scheduler',
    component: TimelineComponent,
    data: {
      title: '',
    },
  },
  {
    path: 'admin',
    component: InfoComponent,
    data: {
      title: '',
    },
  }
];
