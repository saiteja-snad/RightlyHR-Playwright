import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessorConfigurationComponent } from './assessor-configuration.component';

describe('AssessorConfigurationComponent', () => {
  let component: AssessorConfigurationComponent;
  let fixture: ComponentFixture<AssessorConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessorConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessorConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
