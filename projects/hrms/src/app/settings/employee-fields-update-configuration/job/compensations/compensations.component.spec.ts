import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompensationsComponent } from './compensations.component';

describe('CompensationsComponent', () => {
  let component: CompensationsComponent;
  let fixture: ComponentFixture<CompensationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompensationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompensationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
