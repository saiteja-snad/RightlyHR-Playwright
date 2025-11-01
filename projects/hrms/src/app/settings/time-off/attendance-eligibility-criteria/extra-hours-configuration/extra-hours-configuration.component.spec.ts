import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursConfigurationComponent } from './extra-hours-configuration.component';

describe('ExtraHoursConfigurationComponent', () => {
  let component: ExtraHoursConfigurationComponent;
  let fixture: ComponentFixture<ExtraHoursConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
