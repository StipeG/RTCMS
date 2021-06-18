import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
import { AlertDialogComponent } from 'src/app/shared/utils/dialogs/alert-dialog/alert-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/utils/dialogs/confirm-dialog/confirm-dialog.component';
import { Column } from 'src/app/shared/utils/shared-table/shared-table.component';
import { AssociateEarningSpecifications, AssociateEarningSpecificationsView, AssociateRecords, AssociateRecordsStatuses, ChangeReportRetunerHelper, EarningReports, EarningReportStatuses, HomeServiceService } from '../home-service.service';
import { ChangereportComponent } from './changereport/changereport.component';
import { ChangespecificationComponent } from './changespecification/changespecification.component';

@Component({
  selector: 'app-specificationlist',
  templateUrl: './specificationlist.component.html',
  styleUrls: ['./specificationlist.component.scss']
})
export class SpecificationlistComponent implements OnInit {

  f_dataSource: MatTableDataSource<AssociateEarningSpecificationsView>;
  f_displayedColumns: Column[];
  annotiator: string = "records-list-items";
  placeholder: string = "Pretraži podatke";
  selectionMode: boolean = true;
  f_selection = new SelectionModel<AssociateEarningSpecificationsView>(false, []);

  @ViewChild('f_table', {static: true}) table: MatTable<AssociateEarningSpecificationsView>;

  f_data: AssociateEarningSpecificationsView[] = [];

  associate_record: AssociateRecords;
  report: EarningReports;

  f_totalHelper: TotalViewHelper[] = [];
  s_totalHelper: TotalViewHelper[] = [];
  NeedToChange: boolean = false;


  constructor(private dialogRef: MatDialogRef<SpecificationlistComponent>, 
    private dialog: MatDialog,
    private homeService: HomeServiceService,
    private loadingBackdropService: LoadingBackdropService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) {responseRecord}) { 
      this.associate_record = responseRecord.Report.Associaterecord;
      this.report = responseRecord.Report; 
      this.f_displayedColumns = 
      [ {id:'Id',label:'Id',hideOrder:0, type: 'number', isPrimary:true, hidden:true}, 
        {id:'AssigmentString',label:'Org. jedinica', hideOrder:1, type: 'string', isPrimary:false},
        {id:'Quantityreported',label:'Kol. vrijednost prijavljena', hideOrder:2, type: 'number', isPrimary:false},
        {id:'Quantityapproved',label:'Kol. vrijednost odobrena', hideOrder:3, type: 'number', isPrimary:false},
        {id:'Unitpricearchived',label:'Jedinična cijena prijavljenja', hideOrder:4, type: 'number', isPrimary:false},
        {id:'Unitpriceapproved',label:'Jedinična cijena odobrena', hideOrder:5, type: 'number', isPrimary:false},
      ];
      this.f_dataSource = new MatTableDataSource(this.f_data);
      for(let u of responseRecord.Specifications)
        this.f_data.push(new AssociateEarningSpecificationsView(u));
      this.f_dataSource._updateChangeSubscription();
      this.GeneretaeTotalHelper();
    }
    public onNoClick(event: Event)
    {
      event.preventDefault();
      this.dialogRef.close({
        NeedToChange: this.NeedToChange,
      });
    }
  
    ngOnInit(): void {
    }
    public GetStatusString(): string
    {
      if(this.report)
        return EarningReportStatuses[this.report.Status];
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
    public updateReport_clicked(event: Event)
    {
      event.preventDefault();
      this.loadingBackdropService.showModal();
      this.homeService
      .GetEarningReportChange(this.report.Id)
      .pipe(finalize(() => 
        this.loadingBackdropService.hide()
      ))
      .subscribe((response:ChangeReportRetunerHelper) => {
  
        const dialogRef = this.dialog.open(ChangereportComponent, {
          data: {
            report: response.Report,
            IsInvOnDisk: response.IsInvOnDisk,
            IsPNOnDisk: response.IsPnOnDisk
          },
        });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.NeedToChange = true;
        }
        });
      },
      error => {
        this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
          duration: 3000
        });
      });
    }
    public updateRecords_clicked(event: Event)
    {
      event.preventDefault();
      let selected = this.f_selection.selected[0];
      this.loadingBackdropService.showModal();
      this.homeService
      .GetEarningSpecification(selected.Id)
      .pipe(finalize(() => 
        this.loadingBackdropService.hide()
      ))
      .subscribe((response:AssociateEarningSpecifications) => {
  
        const dialogRef = this.dialog.open(ChangespecificationComponent, {
          data: {
            item: response,
            report: this.report
          },
        });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          selected.Quantityapproved = result.Quantityapproved;
          selected.Unitpriceapproved = result.Unitpriceapproved;
          this.f_dataSource._updateChangeSubscription();
          this.GeneretaeTotalHelper();
          this.NeedToChange = true;
        }
        });
      },
      error => {
        this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
          duration: 3000
        });
      });
    }

    public GeneretaeTotalHelper()
    {
      this.f_totalHelper.length = 0;
      this.s_totalHelper.length = 0;
      for(let i of this.f_data)
      {
        let item1 = new TotalViewHelper();
        item1.AssigmentId = i.AssignmentId;
        item1.AssigmentName = i.AssigmentString;
        item1.Amount = i.Quantityreported;
        item1.Price = i.Unitpricearchived;
        item1.TotalPrice = i.Quantityreported * i.Unitpricearchived;
        this.f_totalHelper.push(item1);

        let item2 = new TotalViewHelper();
        item2.AssigmentId = i.AssignmentId;
        item2.AssigmentName = i.AssigmentString;
        item2.Amount = i.Quantityapproved;
        item2.Price = i.Unitpriceapproved;
        item2.TotalPrice =  i.Quantityapproved * i.Unitpriceapproved;
        this.s_totalHelper.push(item2);
      }
    }
    public UpdateReportToCleared_clicked(event: Event)
    {
      event.preventDefault();
       const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Validiraj izvještaj',
          body: 'Ova funckionalost će validirati izvještaj i ako je sve ispravno postavit ga u potvrdan oblik. Da li želite nastaviti?'
        },
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadingBackdropService.showModal();
          this.homeService
          .UpdateReportToCleared(this.report.Id)
          .pipe(finalize(() => 
            this.loadingBackdropService.hide()
          ))
          .subscribe((response:string[]) => {
            if(response.length > 0)
            {
              let str = "<ul>";
              for(let s of response)
              {
                str += "<li>" + s + "</li>";
              }
              str += "</ul>";
              this.dialog.open(AlertDialogComponent, {
                data: {
                  title: 'Nedostaju potrebne informacije',
                  body: 'Ovaj izvještaj se ne može validirati zato što nije do kraja završen ili su informacije krivo unesene. Detalji o pogrešci su: ' +
                  '<br />' + str
                },
              });
            }
            else
            {
              this.report.Status = 3;
              this.NeedToChange = true;
            }
              
          },
          error => {
            this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
              duration: 3000
            });
          });
        }
      });
    }
    UpdateReportToApproved_clicked(event: Event)
    {
      event.preventDefault();
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Potvrdi izvještaj',
          body: 'Ova funckionalost će potvrditi izvještaj. Da li želite nastaviti?'
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadingBackdropService.showModal();
          this.homeService
          .UpdateReportToApproved(this.report.Id)
          .pipe(finalize(() => 
            this.loadingBackdropService.hide()
          ))
          .subscribe((response:boolean) => {
            this.report.Status = 4;
            this.associate_record.Status = 5;
            this.report.Associaterecord.Status = 5;
            this.NeedToChange = true;
          },
          error => {
            this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
              duration: 3000
            });
          });
        }
      });
    }
    UpdateReportToDeclined_clicked(event: Event)
    {
      event.preventDefault();
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Odbaci izvještaj',
          body: 'Ova funckionalost će odbaciti izvještaj. Da li želite nastaviti?'
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadingBackdropService.showModal();
          this.homeService
          .UpdateReportToDeclined(this.report.Id)
          .pipe(finalize(() => 
            this.loadingBackdropService.hide()
          ))
          .subscribe((response:boolean) => {
            this.report.Status = 5;
            this.NeedToChange = true;
          },
          error => {
            this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
              duration: 3000
            });
          });
        }
      });
    }
    UpdateReportToRevive_clicked(event: Event)
    {
      event.preventDefault();
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Ponovno postavi izvještaj',
          body: 'Ova funckionalost će ponovno postaviti izvještaj. Da li želite nastaviti?'
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadingBackdropService.showModal();
          this.homeService
          .UpdateReportToRevive(this.report.Id)
          .pipe(finalize(() => 
            this.loadingBackdropService.hide()
          ))
          .subscribe((response:boolean) => {
            this.report.Status = 0;
            this.NeedToChange = true;
          },
          error => {
            this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
              duration: 3000
            });
          });
        }
      });
    }

}
class TotalViewHelper {
  AssigmentId: number;
  AssigmentName: string;
  Amount: number;
  Price: number;
  TotalPrice: number;
}
