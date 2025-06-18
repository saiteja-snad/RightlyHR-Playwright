import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersACKComponent } from './letters-ack.component';

describe('LettersACKComponent', () => {
  let component: LettersACKComponent;
  let fixture: ComponentFixture<LettersACKComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LettersACKComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LettersACKComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
