import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskMyqueriesDetailsComponent } from './helpdesk-myqueries-details.component';

describe('HelpdeskMyqueriesDetailsComponent', () => {
  let component: HelpdeskMyqueriesDetailsComponent;
  let fixture: ComponentFixture<HelpdeskMyqueriesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskMyqueriesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskMyqueriesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
