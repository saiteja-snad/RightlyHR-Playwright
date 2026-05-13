import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LateLoginReportComponent } from './late-login-report.component';

describe('LateLoginReportComponent', () => {
  let component: LateLoginReportComponent;
  let fixture: ComponentFixture<LateLoginReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LateLoginReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LateLoginReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
