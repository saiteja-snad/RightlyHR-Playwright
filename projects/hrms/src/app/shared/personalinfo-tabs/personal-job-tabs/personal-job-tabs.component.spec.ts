import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalJobTabsComponent } from './personal-job-tabs.component';

describe('PersonalJobTabsComponent', () => {
  let component: PersonalJobTabsComponent;
  let fixture: ComponentFixture<PersonalJobTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalJobTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalJobTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
