import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChgcImageAnnotationsPartFeatureComponent } from './chgc-image-annotations-part-feature.component';

describe('ChgcImageAnnotationsPartFeatureComponent', () => {
  let component: ChgcImageAnnotationsPartFeatureComponent;
  let fixture: ComponentFixture<ChgcImageAnnotationsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ChgcImageAnnotationsPartFeatureComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ChgcImageAnnotationsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
