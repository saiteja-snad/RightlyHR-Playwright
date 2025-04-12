import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProbationEmployeesComponent } from './probation-employees.component';

describe('ProbationEmployeesComponent', () => {
  let component: ProbationEmployeesComponent;
  let fixture: ComponentFixture<ProbationEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbationEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbationEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});