import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyMembersDataComponent } from './family-members-data.component';

describe('FamilyMembersDataComponent', () => {
  let component: FamilyMembersDataComponent;
  let fixture: ComponentFixture<FamilyMembersDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyMembersDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyMembersDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
