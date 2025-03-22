import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprisalLetterComponent } from './apprisal-letter.component';

describe('ApprisalLetterComponent', () => {
  let component: ApprisalLetterComponent;
  let fixture: ComponentFixture<ApprisalLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprisalLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprisalLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
