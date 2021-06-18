import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangereportComponent } from './changereport.component';

describe('ChangereportComponent', () => {
  let component: ChangereportComponent;
  let fixture: ComponentFixture<ChangereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
