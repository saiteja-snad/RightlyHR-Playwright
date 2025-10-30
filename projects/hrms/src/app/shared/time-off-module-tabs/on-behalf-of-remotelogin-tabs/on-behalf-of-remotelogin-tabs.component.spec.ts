import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginTabsComponent } from './on-behalf-of-remotelogin-tabs.component';

describe('OnBehalfOfRemoteloginTabsComponent', () => {
  let component: OnBehalfOfRemoteloginTabsComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
