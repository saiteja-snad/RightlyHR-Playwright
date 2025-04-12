import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulishedShitsComponent } from './pulished-shits.component';

describe('PulishedShitsComponent', () => {
  let component: PulishedShitsComponent;
  let fixture: ComponentFixture<PulishedShitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PulishedShitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PulishedShitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
