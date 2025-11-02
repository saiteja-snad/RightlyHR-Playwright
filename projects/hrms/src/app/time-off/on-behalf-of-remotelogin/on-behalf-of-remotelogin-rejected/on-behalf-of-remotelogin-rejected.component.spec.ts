import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginRejectedComponent } from './on-behalf-of-remotelogin-rejected.component';

describe('OnBehalfOfRemoteloginRejectedComponent', () => {
  let component: OnBehalfOfRemoteloginRejectedComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
