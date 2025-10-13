import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterheaderonlyComponent } from './letterheaderonly.component';

describe('LetterheaderonlyComponent', () => {
  let component: LetterheaderonlyComponent;
  let fixture: ComponentFixture<LetterheaderonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterheaderonlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterheaderonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
