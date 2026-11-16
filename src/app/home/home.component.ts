import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';

@Component({
  selector: 'cadmus-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class HomeComponent {
  private readonly _authService = inject(AuthJwtService);

  /**
   * True if the user is logged in.
   */
  public readonly logged = toSignal(
    this._authService.currentUser$.pipe(map((user) => !!user)),
    { initialValue: !!this._authService.currentUserValue },
  );
}
