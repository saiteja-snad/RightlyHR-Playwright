import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginRequestComponent } from './remote-login-request.component';

describe('RemoteLoginRequestComponent', () => {
  let component: RemoteLoginRequestComponent;
  let fixture: ComponentFixture<RemoteLoginRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
