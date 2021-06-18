import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pipe } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
import { AssociateEarningSpecifications, AssociateRecords, AssociateRecordsStatuses, EarningReports, HomeServiceService } from '../../home-service.service';

@Component({
  selector: 'app-changespecification',
  templateUrl: './changespecification.component.html',
  styleUrls: ['./changespecification.component.scss']
})
export class ChangespecificationComponent implements OnInit {

  form: FormGroup;
  isValidFormSubmitted: true;
  item: AssociateEarningSpecifications;
  associate_record: AssociateRecords;
  report: EarningReports;
  constructor(private dialogRef: MatDialogRef<ChangespecificationComponent>, 
    private dialog: MatDialog,
    private homeService: HomeServiceService,
    private loadingBackdropService: LoadingBackdropService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) {item, report}) { 
      this.item = item;
      this.report = report;
      this.associate_record = this.report.Associaterecord;
      this.form = new FormGroup({
        Quantityapproved: new FormControl({ value: this.item.Quantityapproved, disabled: false }, [
          Validators.required
        ]),
        Unitpriceapproved: new FormControl({ value: this.item.Unitpriceapproved, disabled: false }, [
          Validators.required
        ]),
      });
    }

  ngOnInit(): void {
  }
  onNoClick(event:Event)
  {
    event.preventDefault();
    this.dialogRef.close();
  }
  public GetStatusString(): string
  {
    if(this.associate_record)
      return AssociateRecordsStatuses[this.associate_record.Status];
    else
      return "";
  }
  public GetAssociateName(): string
  {
    if(this.associate_record)
      return this.associate_record.Associate.Op_name + " " + this.associate_record.Associate.Op_lastname; 
    else
      return "";
  }
  save(event:Event)
  {
    event.preventDefault();
    this.loadingBackdropService.showModal();

      this.homeService
      .UpdateSpecification(this.item.Id, this.form.controls["Quantityapproved"].value, this.form.controls["Unitpriceapproved"].value)
      .pipe(finalize(() => 
        this.loadingBackdropService.hide()
      ))
      .subscribe((response:boolean) => {
        this.dialogRef.close({
          Quantityapproved: this.form.controls["Quantityapproved"].value,
          Unitpriceapproved: this.form.controls["Unitpriceapproved"].value
        });
      },
      error => {
        this.snackBar.open('Nešto je pošlo po krivu ili nemate prava na unos! Molimo pokušajte ponovno ili osvježite stranicu!', 'OK', {
          duration: 3000
        });
      });
  }

}
