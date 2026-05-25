import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaitOnUserHelpdeskTicketComponent } from './await-on-user-helpdesk-ticket.component';

describe('AwaitOnUserHelpdeskTicketComponent', () => {
  let component: AwaitOnUserHelpdeskTicketComponent;
  let fixture: ComponentFixture<AwaitOnUserHelpdeskTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwaitOnUserHelpdeskTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwaitOnUserHelpdeskTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
