import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginComponent } from './on-behalf-of-remotelogin.component';

describe('OnBehalfOfRemoteloginComponent', () => {
  let component: OnBehalfOfRemoteloginComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
