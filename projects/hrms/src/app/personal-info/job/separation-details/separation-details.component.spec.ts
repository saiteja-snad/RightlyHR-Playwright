import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationDetailsComponent } from './separation-details.component';

describe('SeparationDetailsComponent', () => {
  let component: SeparationDetailsComponent;
  let fixture: ComponentFixture<SeparationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
