import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingmangerchangeComponent } from './reportingmangerchange.component';

describe('ReportingmangerchangeComponent', () => {
  let component: ReportingmangerchangeComponent;
  let fixture: ComponentFixture<ReportingmangerchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingmangerchangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingmangerchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
