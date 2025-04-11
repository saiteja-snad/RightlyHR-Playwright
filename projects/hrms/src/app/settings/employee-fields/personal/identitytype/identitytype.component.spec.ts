import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentitytypeComponent } from './identitytype.component';

describe('IdentitytypeComponent', () => {
  let component: IdentitytypeComponent;
  let fixture: ComponentFixture<IdentitytypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentitytypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentitytypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
