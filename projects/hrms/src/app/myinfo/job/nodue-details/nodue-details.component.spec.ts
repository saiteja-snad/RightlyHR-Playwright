import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodueDetailsComponent } from './nodue-details.component';

describe('NodueDetailsComponent', () => {
  let component: NodueDetailsComponent;
  let fixture: ComponentFixture<NodueDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodueDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
