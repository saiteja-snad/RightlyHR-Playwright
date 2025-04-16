import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneDstComponent } from './clone-dst.component';

describe('CloneDstComponent', () => {
  let component: CloneDstComponent;
  let fixture: ComponentFixture<CloneDstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneDstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneDstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
