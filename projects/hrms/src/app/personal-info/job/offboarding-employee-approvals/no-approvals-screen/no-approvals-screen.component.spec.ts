import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoApprovalsScreenComponent } from './no-approvals-screen.component';

describe('NoApprovalsScreenComponent', () => {
  let component: NoApprovalsScreenComponent;
  let fixture: ComponentFixture<NoApprovalsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoApprovalsScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoApprovalsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
