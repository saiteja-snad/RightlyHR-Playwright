import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalinfoHeaderTabsComponent } from './personalinfo-header-tabs.component';

describe('PersonalinfoHeaderTabsComponent', () => {
  let component: PersonalinfoHeaderTabsComponent;
  let fixture: ComponentFixture<PersonalinfoHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalinfoHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalinfoHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
