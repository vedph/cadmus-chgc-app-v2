import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgcGalleryImgAnnotatorComponent } from './chgc-gallery-img-annotator.component';

describe('ChgcGalleryImgAnnotatorComponent', () => {
  let component: ChgcGalleryImgAnnotatorComponent;
  let fixture: ComponentFixture<ChgcGalleryImgAnnotatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ChgcGalleryImgAnnotatorComponent]
});
    fixture = TestBed.createComponent(ChgcGalleryImgAnnotatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
