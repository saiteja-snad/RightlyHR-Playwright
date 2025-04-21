import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClonePoliciesComponent } from './clone-policies.component';

describe('ClonePoliciesComponent', () => {
  let component: ClonePoliciesComponent;
  let fixture: ComponentFixture<ClonePoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClonePoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClonePoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
