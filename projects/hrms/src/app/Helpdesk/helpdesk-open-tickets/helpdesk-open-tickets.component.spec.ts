import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskOpenTicketsComponent } from './helpdesk-open-tickets.component';

describe('HelpdeskOpenTicketsComponent', () => {
  let component: HelpdeskOpenTicketsComponent;
  let fixture: ComponentFixture<HelpdeskOpenTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskOpenTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskOpenTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
