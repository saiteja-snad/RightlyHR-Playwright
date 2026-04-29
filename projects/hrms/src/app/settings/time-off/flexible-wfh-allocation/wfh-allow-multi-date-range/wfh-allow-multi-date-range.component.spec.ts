import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhAllowMultiDateRangeComponent } from './wfh-allow-multi-date-range.component';

describe('WfhAllowMultiDateRangeComponent', () => {
  let component: WfhAllowMultiDateRangeComponent;
  let fixture: ComponentFixture<WfhAllowMultiDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhAllowMultiDateRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhAllowMultiDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
