import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
import { ConfirmDialogComponent } from 'src/app/shared/utils/dialogs/confirm-dialog/confirm-dialog.component';
import { Column } from 'src/app/shared/utils/shared-table/shared-table.component';
import { UsersAddComponent } from '../users-add/users-add.component';
import { Users, UsersService } from '../users.service';


@Component({
  selector: 'app-users',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  constructor(private userService: UsersService,
    private loadingBackdropService: LoadingBackdropService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) { }
    dataSource: MatTableDataSource<Users>;
    displayedColumns: Column[];
    gatherSuccess: boolean;
    annotiator: string = "users-list";
    placeholder: string = "Search data";
    selectionMode: boolean = true;
    selection = new SelectionModel<Users>(false, []);
  
    @ViewChild('table', {static: true}) table: MatTable<Users>;

  data: Users[] = [];

  ngOnInit(): void {
    this.displayedColumns = 
    [ {id:'Id',label:'Id',hideOrder:0,width:75, type: 'number', isPrimary:true}, 
      {id:'FirstName',label:'First Name', hideOrder:1, type: 'string', isPrimary:false},
      {id:'LastName',label:'Last Name', hideOrder:2, type: 'string', isPrimary:false},
      {id:'Username',label:'Username', hideOrder:4, type: 'string', isPrimary:false}
    ];
    this.data.push({Id: 2, FirstName: "aa", LastName: "bbb", Username: "ccc"});
    this.dataSource = new MatTableDataSource(this.data);
    this.loadUsers();
  }
  loadUsers() {
    this.loadingBackdropService.show();

    this.userService
      .list()
      .pipe(finalize(() => this.loadingBackdropService.hide()))
      .subscribe((response:Users[]) => {
        for(let u of response)
          this.data.push(u as Users);
        this.dataSource._updateChangeSubscription();
      },
      error => {
        this.snackBar.open('Something went wrong', 'OK', {
          duration: 3000
        });
      });
  }
  clickChild(val: any)
  {
    //this.openDialog(val.action, val.element);
  }
  public deleteUser_clicked()
  {
     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm',
        body: 'Are you sure you want to delete this user?'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser();
      }
    });
  }
  public deleteUser()
  {
    this.loadingBackdropService.show();
    let selected = this.selection.selected[0];
    //TODO - API call
    var removeIndex = this.dataSource.data.map(function(item) { return item.Id; }).indexOf(selected.Id);
    this.dataSource.data.splice(removeIndex, 1);
    this.dataSource._updateChangeSubscription();
    this.selection.clear();
    this.loadingBackdropService.hide();

  }
  public updateUser_clicked()
  {
    this.loadingBackdropService.show();
    let selected = this.selection.selected[0];
    //TODO - API call to get user
    //Only for test
    let user = this.selection.selected[0];

    this.loadingBackdropService.hide();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = 'auto';
    dialogConfig.width = '500px';
    dialogConfig.hasBackdrop = true;

    dialogConfig.data = {
        description: 'Update User - ' + user.FirstName,
        obj_user: user,
        action: 'Update'
    };

    let dialogRef = this.dialog.open(UsersAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        selected.FirstName = result.FirstName;
        selected.LastName = result.LastName;
        selected.Username = result.Username;
        this.dataSource._updateChangeSubscription();
      }
    });
  }
  public addUser()
  {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = 'auto';
    dialogConfig.width = '500px';
    dialogConfig.hasBackdrop = true;

    dialogConfig.data = {
        description: 'Insert User',
        obj_user: null,
        action: 'Insert'
    };

    let dialogRef = this.dialog.open(UsersAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result)
      {
        let user = <Users>{
          Id: result.Id,
          FirstName: result.FirstName,
          LastName: result.LastName,
          Username: result.Username
        }
        this.dataSource.data.push(user);
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  public changePassword_click()
  {

    let user = this.selection.selected[0];

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = 'auto';
    dialogConfig.width = '500px';
    dialogConfig.hasBackdrop = true;

    dialogConfig.data = {
        description: 'Change Password for User - ' + user.FirstName,
        obj_user: user,
        action: 'ChangePassword'
    };

    let dialogRef = this.dialog.open(UsersAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {

    });
  }

}
