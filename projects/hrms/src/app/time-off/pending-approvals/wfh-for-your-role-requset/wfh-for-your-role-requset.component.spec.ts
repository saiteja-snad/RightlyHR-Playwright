import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfhForYourRoleRequsetComponent } from './wfh-for-your-role-requset.component';

describe('WfhForYourRoleRequsetComponent', () => {
  let component: WfhForYourRoleRequsetComponent;
  let fixture: ComponentFixture<WfhForYourRoleRequsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfhForYourRoleRequsetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfhForYourRoleRequsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
