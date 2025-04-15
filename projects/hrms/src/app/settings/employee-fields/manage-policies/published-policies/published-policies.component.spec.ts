import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedPoliciesComponent } from './published-policies.component';

describe('PublishedPoliciesComponent', () => {
  let component: PublishedPoliciesComponent;
  let fixture: ComponentFixture<PublishedPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedPoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
