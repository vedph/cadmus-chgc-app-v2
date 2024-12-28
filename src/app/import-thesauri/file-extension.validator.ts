import { AbstractControl, ValidationErrors } from '@angular/forms';

export class FileExtensionValidator {
  constructor(private allowedExtensions: string[]) {}

  validate(control: AbstractControl): ValidationErrors | null {
    const file = control.value as File | null;
    if (file) {
      const fileName = file.name;
      const extension = fileName.split('.').pop();
      if (!this.allowedExtensions.includes(extension!)) {
        return { invalidExtension: true };
      }
    }
    return null;
  }
}
