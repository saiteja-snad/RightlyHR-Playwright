import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWeekendsTabsComponent } from './manage-weekends-tabs.component';

describe('ManageWeekendsTabsComponent', () => {
  let component: ManageWeekendsTabsComponent;
  let fixture: ComponentFixture<ManageWeekendsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageWeekendsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWeekendsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
