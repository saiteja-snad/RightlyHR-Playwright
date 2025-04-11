import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallForYourRoleRequestComponent } from './recall-for-your-role-request.component';

describe('RecallForYourRoleRequestComponent', () => {
  let component: RecallForYourRoleRequestComponent;
  let fixture: ComponentFixture<RecallForYourRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecallForYourRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecallForYourRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
