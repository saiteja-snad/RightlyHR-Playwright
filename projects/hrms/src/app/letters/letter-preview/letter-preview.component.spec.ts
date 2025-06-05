import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterPreviewComponent } from './letter-preview.component';

describe('LetterPreviewComponent', () => {
  let component: LetterPreviewComponent;
  let fixture: ComponentFixture<LetterPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
