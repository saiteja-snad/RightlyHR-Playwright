import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodueRequestsComponent } from './nodue-requests.component';

describe('NodueRequestsComponent', () => {
  let component: NodueRequestsComponent;
  let fixture: ComponentFixture<NodueRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodueRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodueRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
