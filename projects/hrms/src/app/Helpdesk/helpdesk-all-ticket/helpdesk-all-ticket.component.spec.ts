import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskAllTicketComponent } from './helpdesk-all-ticket.component';

describe('HelpdeskAllTicketComponent', () => {
  let component: HelpdeskAllTicketComponent;
  let fixture: ComponentFixture<HelpdeskAllTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskAllTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskAllTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
