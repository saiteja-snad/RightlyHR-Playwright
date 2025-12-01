import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFieldUpdateConfigComponent } from './personal-field-update-config.component';

describe('PersonalFieldUpdateConfigComponent', () => {
  let component: PersonalFieldUpdateConfigComponent;
  let fixture: ComponentFixture<PersonalFieldUpdateConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalFieldUpdateConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalFieldUpdateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
