import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionRequestComponent } from './premission-request.component';

describe('PremissionRequestComponent', () => {
  let component: PremissionRequestComponent;
  let fixture: ComponentFixture<PremissionRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
