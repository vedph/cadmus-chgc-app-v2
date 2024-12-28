import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgcImageAnnotationsPartComponent } from './chgc-image-annotations-part.component';

describe('ChgcImageAnnotationsPartComponent', () => {
  let component: ChgcImageAnnotationsPartComponent;
  let fixture: ComponentFixture<ChgcImageAnnotationsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ChgcImageAnnotationsPartComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ChgcImageAnnotationsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
