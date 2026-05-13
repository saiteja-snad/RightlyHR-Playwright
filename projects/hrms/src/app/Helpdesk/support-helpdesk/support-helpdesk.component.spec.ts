import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportHelpdeskComponent } from './support-helpdesk.component';

describe('SupportHelpdeskComponent', () => {
  let component: SupportHelpdeskComponent;
  let fixture: ComponentFixture<SupportHelpdeskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportHelpdeskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportHelpdeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
