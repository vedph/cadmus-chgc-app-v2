import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportThesauriComponent } from './import-thesauri.component';

describe('ImportThesauriComponent', () => {
  let component: ImportThesauriComponent;
  let fixture: ComponentFixture<ImportThesauriComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ImportThesauriComponent]
});
    fixture = TestBed.createComponent(ImportThesauriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
