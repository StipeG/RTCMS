import { Component, ElementRef } from '@angular/core';
import { BasicService } from './core/services/basic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private basicService: BasicService, private elementRef: ElementRef)
    {
      this.basicService.SetCoreObject(JSON.parse(this.elementRef.nativeElement.getAttribute('inAttr')));
    }
}
