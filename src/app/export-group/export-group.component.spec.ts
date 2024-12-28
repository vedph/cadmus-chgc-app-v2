import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportGroupComponent } from './export-group.component';

describe('ExportGroupComponent', () => {
  let component: ExportGroupComponent;
  let fixture: ComponentFixture<ExportGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ExportGroupComponent]
});
    fixture = TestBed.createComponent(ExportGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
