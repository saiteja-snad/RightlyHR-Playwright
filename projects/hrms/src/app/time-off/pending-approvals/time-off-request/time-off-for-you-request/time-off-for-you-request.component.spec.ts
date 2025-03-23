import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffForYouRequestComponent } from './time-off-for-you-request.component';

describe('TimeOffForYouRequestComponent', () => {
  let component: TimeOffForYouRequestComponent;
  let fixture: ComponentFixture<TimeOffForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeOffForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeOffForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
