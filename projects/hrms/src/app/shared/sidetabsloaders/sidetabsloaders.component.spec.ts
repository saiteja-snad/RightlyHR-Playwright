import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidetabsloadersComponent } from './sidetabsloaders.component';

describe('SidetabsloadersComponent', () => {
  let component: SidetabsloadersComponent;
  let fixture: ComponentFixture<SidetabsloadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidetabsloadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidetabsloadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
