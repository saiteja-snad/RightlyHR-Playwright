import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWhfProcessedComponent } from './on-behalf-of-wfh-processed.component';

describe('OnBehalfOfWhfProcessedComponent', () => {
  let component: OnBehalfOfWhfProcessedComponent;
  let fixture: ComponentFixture<OnBehalfOfWhfProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWhfProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWhfProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
