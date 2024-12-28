import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgcImageAnnotationDialogComponent } from './chgc-image-annotation-dialog.component';

describe('ChgcImageAnnotationDialogComponent', () => {
  let component: ChgcImageAnnotationDialogComponent;
  let fixture: ComponentFixture<ChgcImageAnnotationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ChgcImageAnnotationDialogComponent]
});
    fixture = TestBed.createComponent(ChgcImageAnnotationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
