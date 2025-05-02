import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaitOnUserTicketsComponent } from './await-on-user-tickets.component';

describe('AwaitOnUserTicketsComponent', () => {
  let component: AwaitOnUserTicketsComponent;
  let fixture: ComponentFixture<AwaitOnUserTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwaitOnUserTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwaitOnUserTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
