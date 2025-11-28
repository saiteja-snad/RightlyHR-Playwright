import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationRequestComponent } from './separation-request.component';

describe('SeparationRequestComponent', () => {
  let component: SeparationRequestComponent;
  let fixture: ComponentFixture<SeparationRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparationRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
