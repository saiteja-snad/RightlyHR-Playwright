import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalinfoLayoutComponent } from './personalinfo-layout.component';

describe('PersonalinfoLayoutComponent', () => {
  let component: PersonalinfoLayoutComponent;
  let fixture: ComponentFixture<PersonalinfoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalinfoLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalinfoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
