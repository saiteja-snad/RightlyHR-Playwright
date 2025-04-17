import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationApprovedComponent } from './regularization-approved.component';

describe('RegularizationApprovedComponent', () => {
  let component: RegularizationApprovedComponent;
  let fixture: ComponentFixture<RegularizationApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
