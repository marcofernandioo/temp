import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

//Import all material modules
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Import Layouts
import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';

// Vertical Layout
import { SidebarComponent } from './layouts/full/sidebar/sidebar.component';
import { HeaderComponent } from './layouts/full/header/header.component';
import { BrandingComponent } from './layouts/full/sidebar/branding.component';
import { AppNavItemComponent } from './layouts/full/sidebar/nav-item/nav-item.component';


import { CreateGroupComponent } from './components/create-group/create-group.component';
import { CreateIntakeComponent } from './components/create-intake/create-intake.component';
import { CreateSemesterComponent } from './components/create-semester/create-semester.component';
import { EditSemesterComponent } from './components/edit-semester/edit-semester.component';
import { IntakeTableComponent } from './components/intake-table/intake-table.component';
import { TimelineTableComponent } from './components/timeline-table/timeline-table.component';
import { TimelineComponent } from './pages/timeline/timeline.component';
import { InfoComponent } from './pages/info/info.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import {NativeDateAdapter, DateAdapter, MatNativeDateModule} from '@angular/material/core';


@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    BlankComponent,
    SidebarComponent,
    HeaderComponent,
    BrandingComponent,
    AppNavItemComponent,
    TimelineTableComponent,
    TimelineComponent,
    InfoComponent,
    CreateGroupComponent,
    CreateIntakeComponent,
    CreateSemesterComponent,
    EditSemesterComponent,
    IntakeTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TablerIconsModule.pick(TablerIcons),
  ],
  exports: [TablerIconsModule],
  bootstrap: [AppComponent],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],

})
export class AppModule {}
