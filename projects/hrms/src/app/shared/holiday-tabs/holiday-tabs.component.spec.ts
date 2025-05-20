import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayTabsComponent } from './holiday-tabs.component';

describe('HolidayTabsComponent', () => {
  let component: HolidayTabsComponent;
  let fixture: ComponentFixture<HolidayTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
