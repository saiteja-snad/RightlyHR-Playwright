import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMasterDataComponent } from './employee-master-data.component';

describe('EmployeeMasterDataComponent', () => {
  let component: EmployeeMasterDataComponent;
  let fixture: ComponentFixture<EmployeeMasterDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeMasterDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeMasterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
