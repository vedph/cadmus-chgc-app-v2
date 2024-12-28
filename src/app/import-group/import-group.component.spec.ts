import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportGroupComponent } from './import-group.component';

describe('ImportGroupComponent', () => {
  let component: ImportGroupComponent;
  let fixture: ComponentFixture<ImportGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ImportGroupComponent]
});
    fixture = TestBed.createComponent(ImportGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
