import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallForYouRequestComponent } from './recall-for-you-request.component';

describe('RecallForYouRequestComponent', () => {
  let component: RecallForYouRequestComponent;
  let fixture: ComponentFixture<RecallForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecallForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecallForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
