import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneLeavecategoryComponent } from './clone-leavecategory.component';

describe('CloneLeavecategoryComponent', () => {
  let component: CloneLeavecategoryComponent;
  let fixture: ComponentFixture<CloneLeavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloneLeavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneLeavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
