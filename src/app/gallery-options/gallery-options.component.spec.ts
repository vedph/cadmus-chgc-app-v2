import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryOptionsComponent } from './gallery-options.component';

describe('GalleryOptionsComponent', () => {
  let component: GalleryOptionsComponent;
  let fixture: ComponentFixture<GalleryOptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [GalleryOptionsComponent]
});
    fixture = TestBed.createComponent(GalleryOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
