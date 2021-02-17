import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LoadingBackdropService } from 'src/app/core/services/loading-backdrop.service';
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
    private snackBar: MatSnackBar
    ) { }

  data: Users[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }
  loadUsers() {
    this.loadingBackdropService.show();

    this.userService
      .list()
      .pipe(finalize(() => this.loadingBackdropService.hide()))
      .subscribe(response => {
         this.data = response;
      },
      error => {
        this.snackBar.open('Something went wrong', 'OK', {
          duration: 3000
        });
      });

  }

}
