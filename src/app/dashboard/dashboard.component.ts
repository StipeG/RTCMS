import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { BasicService } from '../core/services/basic.service';

const WIDTH_FOR_RESPONSIVE = 1280;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isSidenavOpen = true;
  isSidenavFixed = false;
  static path = () => ['dashboard'];
  attribute: any;
  selected: string = 'Home';

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.applyResponsiveIfNeed(event.target.innerWidth);
  }

  constructor(
    private elementRef: ElementRef,
    private basicService: BasicService
  ) { 
      this.attribute = this.basicService.CoreObject;
    }

  ngOnInit() {
    this.applyResponsiveIfNeed(window.innerWidth);
  }


  toggleFullscreen() {
    const elem = this.elementRef.nativeElement.querySelector('.dashboard');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }
  }

  onToggeleSidenav(e:Event) {
    e.preventDefault();
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  private applyResponsiveIfNeed(windowsWidth: number) {
    if (windowsWidth <= WIDTH_FOR_RESPONSIVE) {
      this.isSidenavOpen = false;
      this.isSidenavFixed = true;
    } else {
      this.isSidenavOpen = true;
      this.isSidenavFixed = false;
    }
  }
}
