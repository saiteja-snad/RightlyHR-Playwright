import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrahoursApprovalsComponent } from './extrahours-approvals.component';

describe('ExtrahoursApprovalsComponent', () => {
  let component: ExtrahoursApprovalsComponent;
  let fixture: ComponentFixture<ExtrahoursApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtrahoursApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtrahoursApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
