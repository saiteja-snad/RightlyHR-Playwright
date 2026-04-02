import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskSolvedTicketsComponent } from './helpdesk-solved-tickets.component';

describe('HelpdeskSolvedTicketsComponent', () => {
  let component: HelpdeskSolvedTicketsComponent;
  let fixture: ComponentFixture<HelpdeskSolvedTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskSolvedTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskSolvedTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
