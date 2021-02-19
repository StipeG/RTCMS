import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersAddComponent } from './users-add/users-add.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [
    UsersAddComponent,
  ]
})
export class UserRoutingModule { 
  static components = [UsersListComponent, UsersAddComponent];
}
