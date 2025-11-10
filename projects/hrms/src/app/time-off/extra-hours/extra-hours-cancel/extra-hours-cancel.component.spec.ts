import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHoursCancelComponent } from './extra-hours-cancel.component';

describe('ExtraHoursCancelComponent', () => {
  let component: ExtraHoursCancelComponent;
  let fixture: ComponentFixture<ExtraHoursCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraHoursCancelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraHoursCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
