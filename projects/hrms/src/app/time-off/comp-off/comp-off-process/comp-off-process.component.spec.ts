import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffProcessComponent } from './comp-off-process.component';

describe('CompOffProcessComponent', () => {
  let component: CompOffProcessComponent;
  let fixture: ComponentFixture<CompOffProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
