import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginCancellationComponent } from './on-behalf-of-remotelogin-cancellation.component';

describe('OnBehalfOfRemoteloginCancellationComponent', () => {
  let component: OnBehalfOfRemoteloginCancellationComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginCancellationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
