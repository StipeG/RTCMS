import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pipe } from 'rxjs';
import { catchError, filter, finalize, map, tap } from 'rxjs/operators';
import { HttpApi } from 'src/app/core/http/http-api';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
import { requiredFileType } from 'src/app/upload-file-validators';
import { environment } from 'src/environments/environment';
import { AssociateRecords, AssociateRecordsStatuses, EarningReports, HomeServiceService } from '../../home-service.service';
import {  
  saveAs as importedSaveAs  
} from "file-saver";
import { AlertDialogComponent } from 'src/app/shared/utils/dialogs/alert-dialog/alert-dialog.component';

export function uploadProgress<T>( cb: ( progress: number ) => void ) {
  return tap(( event: HttpEvent<T> ) => {
    if ( event.type === HttpEventType.UploadProgress ) {
      cb(Math.round((100 * event.loaded) / event.total));
    }
  });
}

export function toResponseBody<T>() {
  return pipe(
    filter(( event: HttpEvent<T> ) => event.type === HttpEventType.Response),
    map(( res: HttpResponse<T> ) => res.body)
  );
}

@Component({
  selector: 'app-changereport',
  templateUrl: './changereport.component.html',
  styleUrls: ['./changereport.component.scss']
})
export class ChangereportComponent implements OnInit {
  form: FormGroup;
  isValidFormSubmitted: true;
  associate_record: AssociateRecords;
  report: EarningReports;

  progress_inv = 0;
  progress_pn = 0;
  IsInvOnDisk: boolean = false;
  IsPNOnDisk: boolean = false;

  inv_download_link: string = "";
  pn_download_link: string = "";


  constructor(private dialogRef: MatDialogRef<ChangereportComponent>, 
    private dialog: MatDialog,
    private homeService: HomeServiceService,
    private loadingBackdropService: LoadingBackdropService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) {report, IsInvOnDisk, IsPNOnDisk}) { 
      this.report = report;
      this.associate_record = this.report.Associaterecord;
      this.IsInvOnDisk = IsInvOnDisk;
      this.IsPNOnDisk = IsPNOnDisk;
      let paymentType = null;
      this.inv_download_link = '/FileDownload.ashx?report=' + this.report.Id + "&type=1";
      this.pn_download_link = '/FileDownload.ashx?report=' + this.report.Id + "&type=2";
      if(this.report.Inv_enabled)
        paymentType = '2';
      else if(this.report.Netearnings > 0)
        paymentType = '1';
      this.form = new FormGroup({
        PaymentType: new FormControl({ value: paymentType, disabled: false }, [
          Validators.required
        ]),
        INVFile: new FormControl(null, [requiredFileType('pdf')]),
        PN_Enabled: new FormControl(this.report.Pn_enabled, [Validators.required]),
        PNAmount: new FormControl({ value: this.report.Pn_amount, disabled: false }, [
          Validators.required
        ]),
        PNFile: new FormControl(null, [requiredFileType('pdf')]),
        AspiraComment: new FormControl(this.report.Aspira_comment),
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
  public fileadded_pn(event: any)
  {
    if(!event.file)
    return;

    var content = new FormData();
    content.append("report", this.report.Id.toString());
    content.append("type", (2).toString());
    content.append("extension", 'pdf');
    content.append("file", event.file);
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.loadingBackdropService.showModal();
    this.http.post(HttpApi.uploadFile, content, {
      reportProgress: true,
      observe: 'events',
      headers: headers
    }).pipe(
      uploadProgress(progress => (this.progress_pn = progress)),
      toResponseBody(),
      finalize(() => 
        this.loadingBackdropService.hide()
      )
    ).subscribe(res => {
      this.progress_pn = 0;
      this.form.controls["PNFile"].reset();
      this.IsPNOnDisk = true;
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: 'Upload datoteke',
          body: 'Putni nalog je uspješno pohranjen na serveru!'
        },
      });
    },
    error => {
      this.progress_pn = 0;
      this.IsPNOnDisk = false;
      this.form.controls["PNFile"].reset();
      this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
        duration: 3000
      });
    });
  }
  public fileadded_inv(event:any)
  {
    if(!event.file)
      return;

    var content = new FormData();
    content.append("report", this.report.Id.toString());
    content.append("type", (1).toString());
    content.append("extension", 'pdf');
    content.append("file", event.file);
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.loadingBackdropService.showModal();
    this.http.post(HttpApi.uploadFile, content, {
      reportProgress: true,
      observe: 'events',
      headers: headers
    }).pipe(
      uploadProgress(progress => (this.progress_inv = progress)),
      toResponseBody(),
      finalize(() => 
        this.loadingBackdropService.hide()
      )
    ).subscribe(res => {
      this.progress_inv = 0;
      this.form.controls["INVFile"].reset();
      this.IsInvOnDisk = true;
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: 'Upload datoteke',
          body: 'Račun je uspješno pohranjen na serveru!'
        },
      });
    },
    error => {
      this.progress_inv = 0;
      this.IsInvOnDisk = false;
      this.form.controls["INVFile"].reset();
      this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
        duration: 3000
      });
    });

  }
  save(event:Event)
  {
      event.preventDefault();
      if(!this.form.valid || (this.form.controls['PaymentType'].value === '2' && this.IsInvOnDisk === false) || (this.form.controls['PN_Enabled'].value === true && this.IsPNOnDisk === false))
        return;
      this.loadingBackdropService.showModal();
      this.homeService
      .SaveReportChange(this.report.Id, this.form.controls['PaymentType'].value, this.form.controls['PN_Enabled'].value, this.form.controls['PNAmount'].value, this.form.controls['AspiraComment'].value)
      .subscribe((response:boolean) => {
        this.loadingBackdropService.hide();
        const adialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            title: 'Snimanje izvještaja',
            body: 'Izvještaj je uspješno pohranjen na serveru!'
          },
        });
        adialogRef.afterClosed().subscribe(result => {
          this.dialogRef.close({
            PaymentType: this.form.controls['PaymentType'].value,
            report: this.report.Id,
            PN_Enabled: this.form.controls['PN_Enabled'].value,
            PNAmount: this.form.controls['PNAmount'].value,
            AspiraComment: this.form.controls['AspiraComment'].value,

          });
        });
      },
      error => {
        this.loadingBackdropService.hide();
        this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
          duration: 3000
        });
      });
  }

  hasError( field: string, error: string ) {
    const control = this.form.get(field);
    return control.dirty && control.hasError(error);
  }
  downloadFile(event: Event, what: number)
  {
    event.preventDefault();

    let link = "";
    let suffix = "";
    if(what === 1)
    {
      link = this.inv_download_link;
      suffix = "INV";
    }
    else if(what === 2)
    {
      link = this.pn_download_link;
      suffix = "PN";
    }
    this.loadingBackdropService.showModal();
    this.homeService
    .downloadFile(link)
    .pipe(finalize(() => 
      this.loadingBackdropService.hide()
    ))
    .subscribe((response) => {

      importedSaveAs(response, this.report.Id + "_" + suffix)
    },
    error => {
      this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
        duration: 3000
      });
    });   
  }
}
export function markAllAsDirty( form: FormGroup ) {
  for ( const control of Object.keys(form.controls) ) {
    form.controls[control].markAsDirty();
  }
}

export function toFormData<T>( formValue: T ) {
  const formData = new FormData();

  for ( const key of Object.keys(formValue) ) {
    const value = formValue[key];
    formData.append(key, value);
  }

  return formData;
}


