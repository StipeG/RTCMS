import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, pipe, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { HttpApi } from 'src/app/core/http/http-api';

export let AssociateRecordsStatuses: string[] = [ "In Progress", "Submitted", "In Reviewed", "Declined", "Accepted", "Approved" ];
export let EarningReportStatuses: string[] = [   "Submited", "In Progress", "FileUpload", "ReportCleared", "Approved", "Declined" ];

export interface AssociateRecords
{
  Id: number;
  Associate_id: number;
  Associate: Associates;
  E_month: number;
  E_year: number;
  Status: number;
  Organizationunit_id : number;
  Organizationunit: OrganizationUnits;
  Timestamp: Date;
  Expense: string;
}
export interface Associates
{
  Id: number;
  Ei_address: string;
  Ei_email : string;
  Ei_uid : string;
  Mu_name : string;
  Mu_code : string;
  Org_unit_name : string;
  Org_unit_code : string;
  Op_name : string;
  Op_lastname : string;
  Op_oib : string;
  Op_mark : string;
  Sz_mark : string;
  Sz_name: string;
  Sz_active : boolean;
  Comment : string;
  Description : string;
  Op_mbz : string;
  Op_phone : string;
  Op_email : string;
  Ei_mark : string;
  Last_sync : Date;
  IsAdmin: boolean;
}


export interface OrganizationUnits
{
  Id : number;
  Name : string;
  Designation : string;
}

export interface Assignments
{
  Id: number;
  Type: string;
}

export interface AssociateRecordsItems
{
  Id: number;
  Associaterecord_id: number;
  Associaterecord: AssociateRecords;
  Ordinal_number: number;
  Title: string;
  Amount: number;
  Assignment_id: number;
  Assignment: Assignments;
  Moodle: boolean;
  Comment_associate: string;
  Comment_aspira_private: string;
  Comment_aspira_public: string;
  Amount_moodle: number;
  Is_alias: boolean;
}

export interface MapAssociateRecordsItemsProfesorAttend
{
  AssociaterecorditemId: number;
  Associaterecorditem: AssociateRecordsItems;
  ProfesorattendId : number;
  Profesorattend: profesor_attend_subjects;
}
export interface SubjectsAliases 
{
  Id: number;
  Alias: string;
}
export interface Subjects
{
  Id: number;
  Sifra: number;
  Naziv: string;
  Nastavniprogram_predmet : string;
  Nastavniprogram_predmetuakademskojgodini : string;
  AliasId : number;
  Alias : SubjectsAliases;
  Comment : string;
  Description : string;
  MoodleID : number;
  Last_sync: Date;
}
export interface profesor_attend
{
    Id: number;
    Profesor_id: number;
    Profesor_email: string;
    SessionId : number;
    SubjectId : number;
    Date_from: Date;
    Date_to: Date;
    Date_login: Date;
}
export interface profesor_attend_subjects extends profesor_attend
{
    Subject : Subjects;
    DateFromString : string;
    DateToString : string;
    DateLoginString : string;
    Amount : number;
}

export interface AdminRecordItems
{
    Record :AssociateRecords;
    RegularItems: AssociateRecordsItems[];
    AutoMoodleItems: MapAssociateRecordsItemsProfesorAttend[];
    BaseMoodleItems: profesor_attend_subjects[];
}

export interface EarningReports
{
  Id: number;
  AssociaterecordId: number;
  Associaterecord: AssociateRecords;
  Status: number;
  Timestamp: Date;
  Netearnings: number;
  Pn_enabled: boolean;
  Pn_amount: number;
  Inv_enabled: boolean;
  Inv_amount: number;
  Aspira_comment: string;
}

export class EarningReportsView
{
  Id: number = -1;
  Associate_id: number = -1;
  Associate: Associates = null;
  E_month: number = 1;
  E_year: number = 2015;
  StatusReport: number = 0;
  StatusRecord: number = 0;
  Organizationunit_id : number = -1;
  Organizationunit: OrganizationUnits = null;
  Timestamp: Date;
  TimestampString: string = "";
  Expense: string;
  Netearnings: number;
  Pn_enabled: boolean;
  Pn_amount: number;
  Inv_enabled: boolean;
  Inv_amount: number;
  Aspira_comment: string;

  StatusStringReport: string = "";
  StatusStringRecord: string = "";
  OrganizationUnitName: string = "";
  AssociateName: string = "";
  AssociateOIB: string = "";
  AssociateEmail: string = "";

  constructor(report: EarningReports)
  {
    this.clone(report);
  }
  clone(report: EarningReports)
  {
    if(report)
    {
      this.Id = report.Id;
      this.Associate_id = report.Associaterecord.Associate_id;
      this.Associate = report.Associaterecord.Associate;
      this.E_month = report.Associaterecord.E_month;
      this.E_year = report.Associaterecord.E_year;
      this.StatusReport = report.Status;
      this.StatusRecord = report.Associaterecord.Status;
      this.Organizationunit = report.Associaterecord.Organizationunit;
      this.Organizationunit_id = report.Associaterecord.Organizationunit_id;
      this.Timestamp = new Date((report.Timestamp as any).match(/\d+/).map(Number)[0]);
      this.StatusStringRecord = AssociateRecordsStatuses[report.Associaterecord.Status];
      this.StatusStringReport = EarningReportStatuses[report.Status];
      this.Expense = report.Associaterecord.Expense;
      
      this.Netearnings = report.Netearnings;
      this.Pn_amount = report.Pn_amount;
      this.Pn_enabled = report.Pn_enabled;
      this.Inv_enabled = report.Inv_enabled;
      this.Inv_amount = report.Inv_amount;
      this.Aspira_comment = report.Aspira_comment;
      
      this.OrganizationUnitName = report.Associaterecord.Organizationunit.Name;
      this.TimestampString =  this.Timestamp.toDateString();
      this.AssociateName = (report.Associaterecord.Associate.Op_name ? report.Associaterecord.Associate.Op_name: '')  + " " + (report.Associaterecord.Associate.Op_lastname ? report.Associaterecord.Associate.Op_lastname : '');
      this.AssociateOIB = report.Associaterecord.Associate.Op_oib ? report.Associaterecord.Associate.Op_oib : '';
      if(report.Associaterecord.Associate.Ei_email)
        this.AssociateEmail = report.Associaterecord.Associate.Ei_email;
      else if(report.Associaterecord.Associate.Op_email)
        this.AssociateEmail = report.Associaterecord.Associate.Op_email;

    }
  }

}

export interface AssociateEarningSpecifications
{
  Id: number;
  EarningreportId: number;
  Earningreport: EarningReports;
  AssignmentId: number;
  Assignment: Assignments;
  Quantityreported: number;
  Quantityapproved: number;
  Unitpricearchived: number;
  Unitpriceapproved: number;
}
export class AssociateEarningSpecificationsView
{
  Id: number;
  EarningreportId: number;
  Earningreport: EarningReports;
  AssignmentId: number;
  Assignment: Assignments;
  Quantityreported: number;
  Quantityapproved: number;
  Unitpricearchived: number;
  Unitpriceapproved: number;
  constructor(item: AssociateEarningSpecifications)
  {
    if(item)
    {
      this.Id = item.Id;
      this.EarningreportId = item.EarningreportId;
      this.Earningreport = item.Earningreport;
      this.AssignmentId = item.AssignmentId;
      this.Assignment = item.Assignment;
      this.Quantityapproved = item.Quantityapproved;
      this.Quantityreported = item.Quantityreported;
      this.Unitpriceapproved = item.Unitpriceapproved;
      this.Unitpricearchived = item.Unitpricearchived;
      this.AssigmentString = item.Assignment.Type;
    }
  }
  AssigmentString: string = "";
}

export interface SpecificationsRetunerHelper
{
  Report : EarningReports;
  Specification: AssociateEarningSpecifications[];
}

export interface ChangeReportRetunerHelper
{
  Report : EarningReports;
  IsPnOnDisk : boolean;
  IsInvOnDisk : boolean;
}


@Injectable({
  providedIn: 'root'
})
export class HomeServiceService {

  constructor(private http: HttpClient) { }
  list(status: number): Observable<EarningReports[]> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {status: status};
    return this.http.post<AssociateRecords[]>(HttpApi.reportList, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as EarningReports[];
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }

  GetEarningSpecifications(report: number): Observable<SpecificationsRetunerHelper> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {report: report};
    return this.http.post<SpecificationsRetunerHelper>(HttpApi.getEarningSpecifications, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as SpecificationsRetunerHelper;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }

  GetEarningSpecification(specification: number): Observable<AssociateEarningSpecifications> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {specification: specification};
    return this.http.post<AssociateEarningSpecifications>(HttpApi.getEarningSpecification, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as AssociateEarningSpecifications;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  UpdateSpecification(specification: number, quantityapproved: number, unitpriceapproved: number): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      specification: specification,
      quantityapproved: quantityapproved,
      unitpriceapproved: unitpriceapproved
    };
    return this.http.post<boolean>(HttpApi.updateSpecification, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  GetEarningReportChange(report: number): Observable<ChangeReportRetunerHelper> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<ChangeReportRetunerHelper>(HttpApi.getEarningReportChange, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as ChangeReportRetunerHelper;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  UploadFile(report: number, type: number, extension: string, file: any): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report,
      type: type,
      extension: extension,
      file: file
    };
    return this.http.post<boolean>(HttpApi.uploadFile, content, {headers:headers, reportProgress: true,
      observe: 'events'})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  public downloadFile(link: string): Observable < Blob > {  
    return this.http.get(link, {  
        responseType: 'blob'  
    }).pipe(
    catchError( error => {
        return throwError(error); 
    })
    );;  
  }  
  SaveReportChange(report: number, paymenttype : string, pn_enabled: boolean, pn_amount: number, comment: string): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report,
      paymenttype: paymenttype,
      pn_enabled: pn_enabled,
      pn_amount: pn_amount,
      comment: comment
    };
    return this.http.post<boolean>(HttpApi.saveReportChange, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  UpdateReportToCleared(report: number): Observable<string[]> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<string[]>(HttpApi.updateReportToCleared, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as string[];
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  UpdateReportToApproved(report: number): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<boolean>(HttpApi.updateReportToApproved, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  UpdateReportToDeclined(report: number): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<boolean>(HttpApi.updateReportToDeclined, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  UpdateReportToRevive(report: number): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<boolean>(HttpApi.updateReportToRevive, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  GetAdminBasicRecord(report: number): Observable<EarningReports> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<EarningReports>(HttpApi.getAdminBasicRecord, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as EarningReports;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  ReturnReportToOrganizationUnitLeader(report: number): Observable<boolean> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    var content = {
      report: report
    };
    return this.http.post<boolean>(HttpApi.returnReportToOrganizationUnitLeader, content, {headers:headers})
        .pipe(
        map((response: any)  => {  
          return response.d as boolean;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
  
}
export function toResponseBody<T>() {
  return pipe(
    filter(( event: HttpEvent<T> ) => event.type === HttpEventType.Response),
    map(( res: HttpResponse<T> ) => res.body)
  );
}
export function uploadProgress<T>( cb: ( progress: number ) => void ) {
  return tap(( event: HttpEvent<T> ) => {
    if ( event.type === HttpEventType.UploadProgress ) {
      cb(Math.round((100 * event.loaded) / event.total));
    }
  });
}
