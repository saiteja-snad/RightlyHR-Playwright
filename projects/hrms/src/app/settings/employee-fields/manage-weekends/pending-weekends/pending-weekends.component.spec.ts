import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingWeekendsComponent } from './pending-weekends.component';

describe('PendingWeekendsComponent', () => {
  let component: PendingWeekendsComponent;
  let fixture: ComponentFixture<PendingWeekendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingWeekendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingWeekendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
