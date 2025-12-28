import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyKraKpiComponent } from './my-kra-kpi.component';

describe('MyKraKpiComponent', () => {
  let component: MyKraKpiComponent;
  let fixture: ComponentFixture<MyKraKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyKraKpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyKraKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
