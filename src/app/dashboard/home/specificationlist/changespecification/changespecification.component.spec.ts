import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangespecificationComponent } from './changespecification.component';

describe('ChangespecificationComponent', () => {
  let component: ChangespecificationComponent;
  let fixture: ComponentFixture<ChangespecificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangespecificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangespecificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
