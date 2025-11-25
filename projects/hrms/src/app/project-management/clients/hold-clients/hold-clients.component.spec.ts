import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldClientsComponent } from './hold-clients.component';

describe('HoldClientsComponent', () => {
  let component: HoldClientsComponent;
  let fixture: ComponentFixture<HoldClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
