import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionForYouRequestComponent } from './premission-for-you-request.component';

describe('PremissionForYouRequestComponent', () => {
  let component: PremissionForYouRequestComponent;
  let fixture: ComponentFixture<PremissionForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremissionForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremissionForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
