import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceCreationComponent } from './resource-creation.component';

describe('ResourceCreationComponent', () => {
  let component: ResourceCreationComponent;
  let fixture: ComponentFixture<ResourceCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
