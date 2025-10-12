import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureAuthorityComponent } from './signature-authority.component';

describe('SignatureAuthorityComponent', () => {
  let component: SignatureAuthorityComponent;
  let fixture: ComponentFixture<SignatureAuthorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureAuthorityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
