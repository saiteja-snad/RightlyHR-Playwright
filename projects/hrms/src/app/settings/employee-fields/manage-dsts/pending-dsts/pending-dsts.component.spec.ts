import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingDstsComponent } from './pending-dsts.component';

describe('PendingDstsComponent', () => {
  let component: PendingDstsComponent;
  let fixture: ComponentFixture<PendingDstsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingDstsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingDstsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
