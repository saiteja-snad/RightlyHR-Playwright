import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursTabsComponent } from './extra-hours-tabs.component';

describe('ExtraHoursTabsComponent', () => {
  let component: ExtraHoursTabsComponent;
  let fixture: ComponentFixture<ExtraHoursTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
