import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationchartComponent } from './organizationchart.component';

describe('OrganizationchartComponent', () => {
  let component: OrganizationchartComponent;
  let fixture: ComponentFixture<OrganizationchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
