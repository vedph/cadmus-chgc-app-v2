import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgcImgAnnotationListComponent } from './chgc-img-annotation-list.component';

describe('ChgcImgAnnotationListComponent', () => {
  let component: ChgcImgAnnotationListComponent;
  let fixture: ComponentFixture<ChgcImgAnnotationListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ChgcImgAnnotationListComponent]
});
    fixture = TestBed.createComponent(ChgcImgAnnotationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
