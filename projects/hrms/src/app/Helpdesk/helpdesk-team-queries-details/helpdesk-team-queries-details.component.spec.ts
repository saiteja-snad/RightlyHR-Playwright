import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskTeamQueriesDetailsComponent } from './helpdesk-team-queries-details.component';

describe('HelpdeskTeamQueriesDetailsComponent', () => {
  let component: HelpdeskTeamQueriesDetailsComponent;
  let fixture: ComponentFixture<HelpdeskTeamQueriesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskTeamQueriesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskTeamQueriesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
