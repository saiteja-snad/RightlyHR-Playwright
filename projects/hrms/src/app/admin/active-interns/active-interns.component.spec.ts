import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveInternsComponent } from './active-interns.component';

describe('ActiveInternsComponent', () => {
  let component: ActiveInternsComponent;
  let fixture: ComponentFixture<ActiveInternsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveInternsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveInternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
