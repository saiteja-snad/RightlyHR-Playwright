import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskLayOutComponent } from './helpdesk-lay-out.component';

describe('HelpdeskLayOutComponent', () => {
  let component: HelpdeskLayOutComponent;
  let fixture: ComponentFixture<HelpdeskLayOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpdeskLayOutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpdeskLayOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
