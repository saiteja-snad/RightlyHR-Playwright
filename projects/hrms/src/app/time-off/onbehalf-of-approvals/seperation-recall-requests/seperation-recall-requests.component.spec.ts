import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeperationRecallRequestsComponent } from './seperation-recall-requests.component';

describe('SeperationRecallRequestsComponent', () => {
  let component: SeperationRecallRequestsComponent;
  let fixture: ComponentFixture<SeperationRecallRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeperationRecallRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeperationRecallRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
