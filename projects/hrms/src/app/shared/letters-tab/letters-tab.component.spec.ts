import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LettersTabComponent } from './letters-tab.component';

describe('LettersTabComponent', () => {
  let component: LettersTabComponent;
  let fixture: ComponentFixture<LettersTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LettersTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LettersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
