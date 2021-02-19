import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
import { Users, UsersService } from '../users.service';


@Component({
  selector: 'app-users-add',
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersAddComponent implements OnInit {
  form: FormGroup;
  description:string;
  user_obj: any;
  hide = true;
  hideConfirm = true;
  action: string;
  isValidFormSubmitted: true;
  constructor(
    private userService: UsersService,
    private loadingBackdropService: LoadingBackdropService,
    private dialogRef: MatDialogRef<UsersAddComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) {description, obj_user, action}) { 
      this.description = description;
      this.user_obj = obj_user;
      this.action = action;
      
      
      if(action === 'Insert')
      {
        this.form = new FormGroup({
          Name: new FormControl({ value: '', disabled: false }, [
            Validators.required
          ]),
          LastName: new FormControl({ value: '', disabled: false }, [
            Validators.required
          ]),
          Username: new FormControl({ value: '', disabled: false }, [
            Validators.minLength(5),
            Validators.required
          ]),
          Password: new FormControl({ value: '', disabled: false }, [
            Validators.minLength(5),
            Validators.required
          ]),
          ConfirmPassword: new FormControl(''),
      },this.passwordMatchValidator);
      }
      else if(action === 'Update')
      {
        this.form = new FormGroup({
          Name: new FormControl({ value: this.user_obj.FirstName, disabled: false }, [
            Validators.required
          ]),
          LastName: new FormControl({ value: this.user_obj.LastName, disabled: false }, [
            Validators.required
          ]),
          Username: new FormControl({ value: this.user_obj.Username, disabled: false }, [
            Validators.minLength(5),
            Validators.required
          ])
      });
      }
      else if(action === 'ChangePassword')
      {
        this.form = new FormGroup({
          Password: new FormControl({ value: '', disabled: false }, [
            Validators.minLength(5),
            Validators.required
          ]),
          ConfirmPassword: new FormControl(''),
      },this.passwordMatchValidator);
      }
      
  }
  passwordMatchValidator(g: FormGroup) {
    return g.get('Password').value === g.get('ConfirmPassword').value
       ? null : {'mismatch': true};
 }
  public hasError = (errorName: string) =>{
    if(!this.form.errors)
      return false;
    return this.form.errors[errorName] !== null;
  }

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }
  save()
  {
    if(this.form.valid === false)
    return;
    if(this.action === 'Update')
    {
      this.loadingBackdropService.show();

      let user: Users = <Users> {
          Id: this.user_obj.Id,
          FirstName: this.form.value.Name,
          Username: this.form.value.Username,
          LastName: this.form.value.LastName
      };
      let password = this.form.value.Password;
      //TODO - API call
      this.loadingBackdropService.hide();
      this.dialogRef.close(user);

    }
    else if(this.action === 'Insert')
    {
      this.loadingBackdropService.show();

      let user: Users = <Users> {
          Id: -1,
          FirstName: this.form.value.Name,
          Username: this.form.value.Username,
          LastName: this.form.value.LastName
      };
      let password = this.form.value.Password;
      //TODO - API call
      //id = API call
      this.loadingBackdropService.hide();
      //only for test
      user.Id = new Date().getTime();
      this.dialogRef.close(user);
    }
    else if(this.action === 'ChangePassword')
    {
      this.loadingBackdropService.show();
      let password = this.form.value.Password;
      //TODO - API call
      this.loadingBackdropService.hide();
      this.dialogRef.close(password);
    }
  }
}
