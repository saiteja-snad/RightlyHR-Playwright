import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NowhitespaceComponent } from './nowhitespace.component';

describe('NowhitespaceComponent', () => {
  let component: NowhitespaceComponent;
  let fixture: ComponentFixture<NowhitespaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NowhitespaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NowhitespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
