import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginProcessedComponent } from './on-behalf-of-remotelogin-processed.component';

describe('OnBehalfOfRemoteloginProcessedComponent', () => {
  let component: OnBehalfOfRemoteloginProcessedComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
