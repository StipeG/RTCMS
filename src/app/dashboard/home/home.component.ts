import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
import { Column } from 'src/app/shared/utils/shared-table/shared-table.component';
import {  AssociateRecordsStatuses, EarningReports, EarningReportStatuses, EarningReportsView, HomeServiceService, SpecificationsRetunerHelper } from './home-service.service';
import { SpecificationlistComponent } from './specificationlist/specificationlist.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private homeService: HomeServiceService,
    private loadingBackdropService: LoadingBackdropService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { 

    }
    dataSource: MatTableDataSource<EarningReportsView>;
    displayedColumns: Column[];
    gatherSuccess: boolean;
    annotiator: string = "records-list";
    placeholder: string = "Pretraži podatke";
    selectionMode: boolean = true;
    selection = new SelectionModel<EarningReportsView>(false, []);
  
    @ViewChild('table', {static: true}) table: MatTable<EarningReportsView>;

    data: EarningReportsView[] = [];

    statuses: StatusesHelper[] = [];
    selectedStatus: number = 1;
    ngOnInit() {
      this.displayedColumns = 
      [ {id:'Id',label:'Id',hideOrder:0,width:75, type: 'number', isPrimary:true, hidden:true},
        {id:'AssociateName',label:'Suradnik', hideOrder:1, type: 'string', isPrimary:false},
        {id:'AssociateOIB',label:'OIB', hideOrder:7, type: 'string', isPrimary:false},
        {id:'AssociateEmail',label:'Email', hideOrder:8, type: 'string', isPrimary:false},    
        {id:'E_year',label:'Godina', hideOrder:2, type: 'number', isPrimary:false},
        {id:'E_month',label:'Mjesec', hideOrder:3, type: 'number', isPrimary:false},
        {id:'OrganizationUnitName',label:'Organizacijska jedinica', hideOrder:4, type: 'string', isPrimary:false},
        {id:'TimestampString',label:'Vrijeme kreiranja', hideOrder:9, type: 'date', isPrimary:false},
        {id:'StatusStringReport',label:'Status Financije', hideOrder:5, type: 'string', isPrimary:false},
        {id:'StatusStringRecord',label:'Status Izvještaj', hideOrder:6, type: 'string', isPrimary:false},
      ];
      this.dataSource = new MatTableDataSource(this.data);
      this.statuses.length = 0;
      this.statuses.push(new StatusesHelper(-1, "Sve"));
      for(let s of EarningReportStatuses)
      {
        this.statuses.push(new StatusesHelper(EarningReportStatuses.indexOf(s), s));
      }
    }
    
    loadRecords() {
      this.loadingBackdropService.show();
      let status = null;
      if(this.selectedStatus && this.selectedStatus >= 0)
        status = this.selectedStatus;
      this.homeService
        .list(status)
        .pipe(finalize(() => 
          this.loadingBackdropService.hide()
        ))
        .subscribe((response:EarningReports[]) => {
          this.data.length = 0;
          this.selection.clear();
          for(let u of response)
            this.data.push(new EarningReportsView(u));
          this.dataSource._updateChangeSubscription();
        },
        error => {
          this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
            duration: 3000
          });
        });
    }
    public loadData_click(event: Event)
    {
      event.preventDefault();
      this.loadRecords();
    }
    clickChild(val: any)
    {
      //this.openDialog(val.action, val.element);
    }
    public updateRecordsSpecification_clicked(event: Event)
    {
      event.preventDefault();
      this.loadingBackdropService.show();
      let selected = this.selection.selected[0];
      this.homeService
      .GetEarningSpecifications(selected.Id)
      .subscribe((responseRecord:SpecificationsRetunerHelper) => { 
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.height = 'auto';
        dialogConfig.width = '98%';
        dialogConfig.data = {
          responseRecord: responseRecord
        };
        this.loadingBackdropService.hide();
        let dialogRef = this.dialog.open(SpecificationlistComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if(result.NeedToChange)
            {
              this.loadingBackdropService.show();
              this.homeService
                .GetAdminBasicRecord(selected.Id)
                .pipe(finalize(() => 
                  this.loadingBackdropService.hide()
                ))
                .subscribe((response:EarningReports) => {
                  selected.clone(response);
                  this.dataSource._updateChangeSubscription();
                },
                error => {
                  this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
                    duration: 3000
                  });
                });
            }
        });
      },
      error => {
        this.loadingBackdropService.hide();
        this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
          duration: 3000
        });
      });

    }
    public returnreport_clicked(event: Event)
    {
      event.preventDefault();
      this.loadingBackdropService.show();
      let selected = this.selection.selected[0];
      this.homeService
      .ReturnReportToOrganizationUnitLeader(selected.Id)
      .subscribe((response:boolean) => { 
        this.loadingBackdropService.hide();
        selected.StatusRecord = 2;
        selected.StatusStringRecord = AssociateRecordsStatuses[selected.StatusRecord];
        this.dataSource._updateChangeSubscription();
      },
      error => {
        this.loadingBackdropService.hide();
        this.snackBar.open('Nešto je pošlo po krivu!', 'OK', {
          duration: 3000
        });
      });

    }

}
class  StatusesHelper {
  Id: number;
  Text:String;
  constructor(Id: number, Text: string) {
    this.Id = Id;
    this.Text = Text;
  }
}
