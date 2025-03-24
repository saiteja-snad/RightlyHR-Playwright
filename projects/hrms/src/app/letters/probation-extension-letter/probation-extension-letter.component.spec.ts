import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationExtensionLetterComponent } from './probation-extension-letter.component';

describe('ProbationExtensionLetterComponent', () => {
  let component: ProbationExtensionLetterComponent;
  let fixture: ComponentFixture<ProbationExtensionLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationExtensionLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationExtensionLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
