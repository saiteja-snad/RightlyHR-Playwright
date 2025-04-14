import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDueClearanceConfigurationsComponent } from './no-due-clearance-configurations.component';

describe('NoDueClearanceConfigurationsComponent', () => {
  let component: NoDueClearanceConfigurationsComponent;
  let fixture: ComponentFixture<NoDueClearanceConfigurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoDueClearanceConfigurationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDueClearanceConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
