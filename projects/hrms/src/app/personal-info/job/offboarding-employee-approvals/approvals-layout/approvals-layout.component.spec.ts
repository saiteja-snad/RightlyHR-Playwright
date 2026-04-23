import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsLayoutComponent } from './approvals-layout.component';

describe('ApprovalsLayoutComponent', () => {
  let component: ApprovalsLayoutComponent;
  let fixture: ComponentFixture<ApprovalsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
