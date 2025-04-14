import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageShiftsTabsComponent } from './manage-shifts-tabs.component';

describe('ManageShiftsTabsComponent', () => {
  let component: ManageShiftsTabsComponent;
  let fixture: ComponentFixture<ManageShiftsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageShiftsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageShiftsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
