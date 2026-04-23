import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoffApprovalsComponent } from './compoff-approvals.component';

describe('CompoffApprovalsComponent', () => {
  let component: CompoffApprovalsComponent;
  let fixture: ComponentFixture<CompoffApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompoffApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompoffApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
