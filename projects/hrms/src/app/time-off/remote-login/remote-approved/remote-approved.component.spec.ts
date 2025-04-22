import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteApprovedComponent } from './remote-approved.component';

describe('RemoteApprovedComponent', () => {
  let component: RemoteApprovedComponent;
  let fixture: ComponentFixture<RemoteApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
