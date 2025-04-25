import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeApprovalsTabsComponent } from './trainee-approvals-tabs.component';

describe('TraineeApprovalsTabsComponent', () => {
  let component: TraineeApprovalsTabsComponent;
  let fixture: ComponentFixture<TraineeApprovalsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeApprovalsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeApprovalsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
