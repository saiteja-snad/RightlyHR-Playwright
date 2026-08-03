import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientResourcesWaitingForApprovalComponent } from './client-resources-waiting-for-approval.component';

describe('ClientResourcesWaitingForApprovalComponent', () => {
  let component: ClientResourcesWaitingForApprovalComponent;
  let fixture: ComponentFixture<ClientResourcesWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientResourcesWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientResourcesWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
