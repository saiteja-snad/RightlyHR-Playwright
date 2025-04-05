import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalPersonalTabsComponent } from './personal-personal-tabs.component';

describe('PersonalPersonalTabsComponent', () => {
  let component: PersonalPersonalTabsComponent;
  let fixture: ComponentFixture<PersonalPersonalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalPersonalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalPersonalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
