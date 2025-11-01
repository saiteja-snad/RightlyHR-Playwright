import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursProcessComponent } from './extra-hours-process.component';

describe('ExtraHoursProcessComponent', () => {
  let component: ExtraHoursProcessComponent;
  let fixture: ComponentFixture<ExtraHoursProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
