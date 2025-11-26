import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginReportComponent } from './remote-login-report.component';

describe('RemoteLoginReportComponent', () => {
  let component: RemoteLoginReportComponent;
  let fixture: ComponentFixture<RemoteLoginReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
