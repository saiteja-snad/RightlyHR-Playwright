import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjcetCreationComponent } from './projcet-creation.component';

describe('ProjcetCreationComponent', () => {
  let component: ProjcetCreationComponent;
  let fixture: ComponentFixture<ProjcetCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjcetCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjcetCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
