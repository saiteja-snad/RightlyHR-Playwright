import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginRequestsComponent } from './remote-login-requests.component';

describe('RemoteLoginRequestsComponent', () => {
  let component: RemoteLoginRequestsComponent;
  let fixture: ComponentFixture<RemoteLoginRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
