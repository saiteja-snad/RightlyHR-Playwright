import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivePhasesProjectComponent } from './inactive-phases-project.component';

describe('InactivePhasesProjectComponent', () => {
  let component: InactivePhasesProjectComponent;
  let fixture: ComponentFixture<InactivePhasesProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactivePhasesProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactivePhasesProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
