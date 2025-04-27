import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicieslayoutComponent } from './policieslayout.component';

describe('PolicieslayoutComponent', () => {
  let component: PolicieslayoutComponent;
  let fixture: ComponentFixture<PolicieslayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicieslayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicieslayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
