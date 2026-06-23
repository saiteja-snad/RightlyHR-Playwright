import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraLogHoursComponent } from './extra-log-hours.component';

describe('ExtraLogHoursComponent', () => {
  let component: ExtraLogHoursComponent;
  let fixture: ComponentFixture<ExtraLogHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraLogHoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraLogHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
