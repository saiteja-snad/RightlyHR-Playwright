import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactorInfoComponent } from './contactor-info.component';

describe('ContactorInfoComponent', () => {
  let component: ContactorInfoComponent;
  let fixture: ComponentFixture<ContactorInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactorInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
