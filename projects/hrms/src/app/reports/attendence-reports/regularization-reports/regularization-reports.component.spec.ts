import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationReportsComponent } from './regularization-reports.component';

describe('RegularizationReportsComponent', () => {
  let component: RegularizationReportsComponent;
  let fixture: ComponentFixture<RegularizationReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
