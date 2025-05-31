import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTabsReportsComponent } from './custom-tabs-reports.component';

describe('CustomTabsReportsComponent', () => {
  let component: CustomTabsReportsComponent;
  let fixture: ComponentFixture<CustomTabsReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTabsReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTabsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
