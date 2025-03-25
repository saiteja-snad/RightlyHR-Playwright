import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousExperinceComponent } from './previous-experince.component';

describe('PreviousExperinceComponent', () => {
  let component: PreviousExperinceComponent;
  let fixture: ComponentFixture<PreviousExperinceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousExperinceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousExperinceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
