import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursAllocationComponent } from './hours-allocation.component';

describe('HoursAllocationComponent', () => {
  let component: HoursAllocationComponent;
  let fixture: ComponentFixture<HoursAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
