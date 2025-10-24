import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWhfRejectedComponent } from './on-behalf-of-whf-rejected.component';

describe('OnBehalfOfWhfRejectedComponent', () => {
  let component: OnBehalfOfWhfRejectedComponent;
  let fixture: ComponentFixture<OnBehalfOfWhfRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWhfRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWhfRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
