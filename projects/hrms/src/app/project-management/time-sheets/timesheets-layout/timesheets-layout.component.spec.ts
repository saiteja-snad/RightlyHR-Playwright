import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsLayoutComponent } from './timesheets-layout.component';

describe('TimesheetsLayoutComponent', () => {
  let component: TimesheetsLayoutComponent;
  let fixture: ComponentFixture<TimesheetsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
