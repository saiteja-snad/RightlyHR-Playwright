import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorLetterComponent } from './contractor-letter.component';

describe('ContractorLetterComponent', () => {
  let component: ContractorLetterComponent;
  let fixture: ComponentFixture<ContractorLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
