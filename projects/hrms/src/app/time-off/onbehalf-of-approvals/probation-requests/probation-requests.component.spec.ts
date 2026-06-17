import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationRequestsComponent } from './probation-requests.component';

describe('ProbationRequestsComponent', () => {
  let component: ProbationRequestsComponent;
  let fixture: ComponentFixture<ProbationRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
