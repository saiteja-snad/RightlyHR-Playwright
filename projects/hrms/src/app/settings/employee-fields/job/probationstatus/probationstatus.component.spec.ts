import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationstatusComponent } from './probationstatus.component';

describe('ProbationstatusComponent', () => {
  let component: ProbationstatusComponent;
  let fixture: ComponentFixture<ProbationstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationstatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
