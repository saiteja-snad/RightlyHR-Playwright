import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWhfApprovedComponent } from './on-behalf-of-whf-approved.component';

describe('OnBehalfOfWhfApprovedComponent', () => {
  let component: OnBehalfOfWhfApprovedComponent;
  let fixture: ComponentFixture<OnBehalfOfWhfApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWhfApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWhfApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
