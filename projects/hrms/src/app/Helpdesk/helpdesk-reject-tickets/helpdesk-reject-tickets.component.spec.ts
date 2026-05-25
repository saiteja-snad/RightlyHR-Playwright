import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskRejectTicketsComponent } from './helpdesk-reject-tickets.component';

describe('HelpdeskRejectTicketsComponent', () => {
  let component: HelpdeskRejectTicketsComponent;
  let fixture: ComponentFixture<HelpdeskRejectTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskRejectTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskRejectTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
