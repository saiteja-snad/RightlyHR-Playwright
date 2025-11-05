import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasesCreationComponent } from './phases-creation.component';

describe('PhasesCreationComponent', () => {
  let component: PhasesCreationComponent;
  let fixture: ComponentFixture<PhasesCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhasesCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhasesCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
