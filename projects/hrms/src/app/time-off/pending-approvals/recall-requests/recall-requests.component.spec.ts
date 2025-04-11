import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallRequestsComponent } from './recall-requests.component';

describe('RecallRequestsComponent', () => {
  let component: RecallRequestsComponent;
  let fixture: ComponentFixture<RecallRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecallRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecallRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
