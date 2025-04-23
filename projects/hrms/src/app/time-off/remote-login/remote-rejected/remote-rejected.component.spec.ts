import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteRejectedComponent } from './remote-rejected.component';

describe('RemoteRejectedComponent', () => {
  let component: RemoteRejectedComponent;
  let fixture: ComponentFixture<RemoteRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
