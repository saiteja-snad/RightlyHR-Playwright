import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursRequestComponent } from './extra-hours-request.component';

describe('ExtraHoursRequestComponent', () => {
  let component: ExtraHoursRequestComponent;
  let fixture: ComponentFixture<ExtraHoursRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
