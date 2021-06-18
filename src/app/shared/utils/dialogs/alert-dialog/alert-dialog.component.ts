import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafePipe } from  '../../pipes/safe-pipe.pipe';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

}
