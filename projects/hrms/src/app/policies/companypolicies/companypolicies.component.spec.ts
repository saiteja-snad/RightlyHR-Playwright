import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanypoliciesComponent } from './companypolicies.component';

describe('CompanypoliciesComponent', () => {
  let component: CompanypoliciesComponent;
  let fixture: ComponentFixture<CompanypoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanypoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanypoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
