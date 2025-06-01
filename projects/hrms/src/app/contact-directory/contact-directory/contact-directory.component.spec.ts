import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDirectoryComponent } from './contact-directory.component';

describe('ContactDirectoryComponent', () => {
  let component: ContactDirectoryComponent;
  let fixture: ComponentFixture<ContactDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDirectoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
