import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageHolidaysTabsComponent } from './manage-holidays-tabs.component';

describe('ManageHolidaysTabsComponent', () => {
  let component: ManageHolidaysTabsComponent;
  let fixture: ComponentFixture<ManageHolidaysTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageHolidaysTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageHolidaysTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
