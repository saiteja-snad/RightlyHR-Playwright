import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsaComponent } from './msa.component';

describe('MsaComponent', () => {
  let component: MsaComponent;
  let fixture: ComponentFixture<MsaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MsaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
