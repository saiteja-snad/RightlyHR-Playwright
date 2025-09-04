import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDocumentsTabsComponent } from './personal-documents-tabs.component';

describe('PersonalDocumentsTabsComponent', () => {
  let component: PersonalDocumentsTabsComponent;
  let fixture: ComponentFixture<PersonalDocumentsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDocumentsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDocumentsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
