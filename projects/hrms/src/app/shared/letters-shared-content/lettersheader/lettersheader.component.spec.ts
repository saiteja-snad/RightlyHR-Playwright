import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersheaderComponent } from './lettersheader.component';

describe('LettersheaderComponent', () => {
  let component: LettersheaderComponent;
  let fixture: ComponentFixture<LettersheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LettersheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LettersheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
