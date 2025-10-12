import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleInfoIconComponent } from './module-info-icon.component';

describe('ModuleInfoIconComponent', () => {
  let component: ModuleInfoIconComponent;
  let fixture: ComponentFixture<ModuleInfoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleInfoIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleInfoIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
