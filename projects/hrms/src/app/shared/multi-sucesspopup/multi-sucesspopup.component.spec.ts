import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSucesspopupComponent } from './multi-sucesspopup.component';

describe('MultiSucesspopupComponent', () => {
  let component: MultiSucesspopupComponent;
  let fixture: ComponentFixture<MultiSucesspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSucesspopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSucesspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
