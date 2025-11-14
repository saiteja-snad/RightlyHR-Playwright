import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursAllocationViewComponent } from './hours-allocation-view.component';

describe('HoursAllocationViewComponent', () => {
  let component: HoursAllocationViewComponent;
  let fixture: ComponentFixture<HoursAllocationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursAllocationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursAllocationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
