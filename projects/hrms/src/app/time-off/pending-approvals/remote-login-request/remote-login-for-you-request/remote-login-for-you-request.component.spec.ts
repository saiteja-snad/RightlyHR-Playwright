import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginForYouRequestComponent } from './remote-login-for-you-request.component';

describe('RemoteLoginForYouRequestComponent', () => {
  let component: RemoteLoginForYouRequestComponent;
  let fixture: ComponentFixture<RemoteLoginForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
