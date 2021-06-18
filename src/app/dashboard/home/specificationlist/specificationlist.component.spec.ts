import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificationlistComponent } from './specificationlist.component';

describe('SpecificationlistComponent', () => {
  let component: SpecificationlistComponent;
  let fixture: ComponentFixture<SpecificationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecificationlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
