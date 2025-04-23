import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnbehalfOfApprovalsComponent } from './onbehalf-of-approvals.component';

describe('OnbehalfOfApprovalsComponent', () => {
  let component: OnbehalfOfApprovalsComponent;
  let fixture: ComponentFixture<OnbehalfOfApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnbehalfOfApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnbehalfOfApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
