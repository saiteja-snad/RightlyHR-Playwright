import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPoliciesComponent } from './pending-policies.component';

describe('PendingPoliciesComponent', () => {
  let component: PendingPoliciesComponent;
  let fixture: ComponentFixture<PendingPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
