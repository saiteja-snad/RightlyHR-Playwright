import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursForYouComponent } from './extra-hours-for-you.component';

describe('ExtraHoursForYouComponent', () => {
  let component: ExtraHoursForYouComponent;
  let fixture: ComponentFixture<ExtraHoursForYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursForYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursForYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
