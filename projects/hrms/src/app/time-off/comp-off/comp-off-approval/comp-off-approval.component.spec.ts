import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffApprovalComponent } from './comp-off-approval.component';

describe('CompOffApprovalComponent', () => {
  let component: CompOffApprovalComponent;
  let fixture: ComponentFixture<CompOffApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
