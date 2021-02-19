import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';
import { UsersService } from './users.service';



@NgModule({
  declarations: [
    ...UserRoutingModule.components
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
  ],
  providers: [UsersService],

})
export class UsersModule { }
