import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryRevisionLetterComponent } from './salary-revision-letter.component';

describe('SalaryRevisionLetterComponent', () => {
  let component: SalaryRevisionLetterComponent;
  let fixture: ComponentFixture<SalaryRevisionLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryRevisionLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryRevisionLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
