import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWhfCancellationComponent } from './on-behalf-of-wfh-cancellation.component';

describe('OnBehalfOfWhfCancellationComponent', () => {
  let component: OnBehalfOfWhfCancellationComponent;
  let fixture: ComponentFixture<OnBehalfOfWhfCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWhfCancellationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWhfCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
