import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursApprovalsTabsComponent } from './extra-hours-approvals-tabs.component';

describe('ExtraHoursApprovalsTabsComponent', () => {
  let component: ExtraHoursApprovalsTabsComponent;
  let fixture: ComponentFixture<ExtraHoursApprovalsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursApprovalsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursApprovalsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
