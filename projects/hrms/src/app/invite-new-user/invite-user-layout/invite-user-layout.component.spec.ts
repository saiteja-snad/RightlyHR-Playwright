import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteUserLayoutComponent } from './invite-user-layout.component';

describe('InviteUserLayoutComponent', () => {
  let component: InviteUserLayoutComponent;
  let fixture: ComponentFixture<InviteUserLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteUserLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviteUserLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
