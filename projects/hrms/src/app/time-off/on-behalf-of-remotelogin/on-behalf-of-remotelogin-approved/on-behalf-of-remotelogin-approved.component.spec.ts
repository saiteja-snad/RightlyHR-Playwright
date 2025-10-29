import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginApprovedComponent } from './on-behalf-of-remotelogin-approved.component';

describe('OnBehalfOfRemoteloginApprovedComponent', () => {
  let component: OnBehalfOfRemoteloginApprovedComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
