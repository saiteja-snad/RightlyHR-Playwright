import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingshitsComponent } from './pendingshits.component';

describe('PendingshitsComponent', () => {
  let component: PendingshitsComponent;
  let fixture: ComponentFixture<PendingshitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingshitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingshitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
