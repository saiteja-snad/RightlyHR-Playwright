import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasesHoldComponent } from './phases-hold.component';

describe('PhasesHoldComponent', () => {
  let component: PhasesHoldComponent;
  let fixture: ComponentFixture<PhasesHoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhasesHoldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhasesHoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
