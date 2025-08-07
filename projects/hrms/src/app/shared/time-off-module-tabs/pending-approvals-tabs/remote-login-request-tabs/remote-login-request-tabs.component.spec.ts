import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginRequestTabsComponent } from './remote-login-request-tabs.component';

describe('RemoteLoginRequestTabsComponent', () => {
  let component: RemoteLoginRequestTabsComponent;
  let fixture: ComponentFixture<RemoteLoginRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
