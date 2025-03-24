import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInfoDetailsComponent } from './profile-info-details.component';

describe('ProfileInfoDetailsComponent', () => {
  let component: ProfileInfoDetailsComponent;
  let fixture: ComponentFixture<ProfileInfoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInfoDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
