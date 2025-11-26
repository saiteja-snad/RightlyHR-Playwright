import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursAllocationTabsComponent } from './hours-allocation-tabs.component';

describe('HoursAllocationTabsComponent', () => {
  let component: HoursAllocationTabsComponent;
  let fixture: ComponentFixture<HoursAllocationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursAllocationTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoursAllocationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
