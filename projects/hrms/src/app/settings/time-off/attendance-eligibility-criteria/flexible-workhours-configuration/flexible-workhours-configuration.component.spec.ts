import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexibleWorkhoursConfigurationComponent } from './flexible-workhours-configuration.component';

describe('FlexibleWorkhoursConfigurationComponent', () => {
  let component: FlexibleWorkhoursConfigurationComponent;
  let fixture: ComponentFixture<FlexibleWorkhoursConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexibleWorkhoursConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexibleWorkhoursConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
