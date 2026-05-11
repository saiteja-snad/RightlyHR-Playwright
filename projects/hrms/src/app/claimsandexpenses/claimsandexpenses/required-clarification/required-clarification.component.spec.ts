import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredClarificationComponent } from './required-clarification.component';

describe('RequiredClarificationComponent', () => {
  let component: RequiredClarificationComponent;
  let fixture: ComponentFixture<RequiredClarificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequiredClarificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequiredClarificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
