import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterFooterComponent } from './letter-footer.component';

describe('LetterFooterComponent', () => {
  let component: LetterFooterComponent;
  let fixture: ComponentFixture<LetterFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
