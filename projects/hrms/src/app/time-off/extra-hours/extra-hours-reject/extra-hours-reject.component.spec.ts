import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursRejectComponent } from './extra-hours-reject.component';

describe('ExtraHoursRejectComponent', () => {
  let component: ExtraHoursRejectComponent;
  let fixture: ComponentFixture<ExtraHoursRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursRejectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
