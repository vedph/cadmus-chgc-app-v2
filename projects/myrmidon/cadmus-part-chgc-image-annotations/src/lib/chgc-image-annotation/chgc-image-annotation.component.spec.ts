import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgcImageAnnotationComponent } from './chgc-image-annotation.component';

describe('ChgcImageAnnotationComponent', () => {
  let component: ChgcImageAnnotationComponent;
  let fixture: ComponentFixture<ChgcImageAnnotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ChgcImageAnnotationComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ChgcImageAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
