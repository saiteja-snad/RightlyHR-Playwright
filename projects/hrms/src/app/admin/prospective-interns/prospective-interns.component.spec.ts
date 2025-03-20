import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectiveInternsComponent } from './prospective-interns.component';

describe('ProspectiveInternsComponent', () => {
  let component: ProspectiveInternsComponent;
  let fixture: ComponentFixture<ProspectiveInternsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectiveInternsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectiveInternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
