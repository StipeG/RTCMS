import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component';
import { SharedModule } from './shared/shared.module';
import { SpecificationlistComponent } from './dashboard/home/specificationlist/specificationlist.component';
import { ChangespecificationComponent } from './dashboard/home/specificationlist/changespecification/changespecification.component';
import { ChangereportComponent } from './dashboard/home/specificationlist/changereport/changereport.component';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HomeComponent,
    SpecificationlistComponent,
    ChangespecificationComponent,
    ChangereportComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    //AppRoutingModule, // Main routes for application
    CoreModule,       // Singleton objects (services, components and resources that are loaded only at app.module level)
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [SpecificationlistComponent, ChangespecificationComponent, ChangereportComponent]
})
export class AppModule { }
