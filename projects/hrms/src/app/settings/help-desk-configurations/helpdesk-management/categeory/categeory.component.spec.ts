import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategeoryComponent } from './categeory.component';

describe('CategeoryComponent', () => {
  let component: CategeoryComponent;
  let fixture: ComponentFixture<CategeoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategeoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategeoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
