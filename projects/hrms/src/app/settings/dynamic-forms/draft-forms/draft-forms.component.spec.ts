import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftFormsComponent } from './draft-forms.component';

describe('DraftFormsComponent', () => {
  let component: DraftFormsComponent;
  let fixture: ComponentFixture<DraftFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
