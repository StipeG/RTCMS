import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ConfirmDialogComponent } from './utils/dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './utils/dialogs/alert-dialog/alert-dialog.component';
import { SharedTableComponent } from './utils/shared-table/shared-table.component';
import {ResizeColumnDirective} from './utils/shared-table/resize-column.directive';
import { TwoDigitDecimaNumberDirective } from './utils/directives/two-digit-decima-number.directive';
import { SafePipe } from './utils/pipes/safe-pipe.pipe';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ProgressComponent } from './components/progress/progress.component';
import { DndDirective2 } from './components/file-upload/dnd.directive';

const COMPONENTS = [
  AlertDialogComponent,
  ConfirmDialogComponent,
  SidenavComponent,
  SharedTableComponent,
  ResizeColumnDirective,
  FileUploadComponent, ProgressComponent,
  
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    TwoDigitDecimaNumberDirective,
    DndDirective2,
    SafePipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PerfectScrollbarModule,
    TwoDigitDecimaNumberDirective,
    DndDirective2,
    SafePipe,
    ...COMPONENTS
  ],
  entryComponents: [
    AlertDialogComponent,
    ConfirmDialogComponent
  ]
})
export class SharedModule { }
