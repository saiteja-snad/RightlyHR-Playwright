import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexibleLeaveAllocationComponent } from './flexible-leave-allocation.component';

describe('FlexibleLeaveAllocationComponent', () => {
  let component: FlexibleLeaveAllocationComponent;
  let fixture: ComponentFixture<FlexibleLeaveAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexibleLeaveAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexibleLeaveAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
