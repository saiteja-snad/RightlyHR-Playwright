import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationApprovalsComponent } from './regularization-approvals.component';

describe('RegularizationApprovalsComponent', () => {
  let component: RegularizationApprovalsComponent;
  let fixture: ComponentFixture<RegularizationApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
