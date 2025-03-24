import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersLayoutComponent } from './letters-layout.component';

describe('LettersLayoutComponent', () => {
  let component: LettersLayoutComponent;
  let fixture: ComponentFixture<LettersLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LettersLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LettersLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
