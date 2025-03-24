import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelievingLetterComponent } from './relieving-letter.component';

describe('RelievingLetterComponent', () => {
  let component: RelievingLetterComponent;
  let fixture: ComponentFixture<RelievingLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelievingLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelievingLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
