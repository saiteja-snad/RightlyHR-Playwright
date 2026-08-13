import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceApprovalsComponent } from './resource-approvals.component';

describe('ResourceApprovalsComponent', () => {
  let component: ResourceApprovalsComponent;
  let fixture: ComponentFixture<ResourceApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
