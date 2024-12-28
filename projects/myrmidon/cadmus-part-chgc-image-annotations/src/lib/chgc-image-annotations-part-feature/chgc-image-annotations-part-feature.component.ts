import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';

import { ChgcImageAnnotationsPartComponent } from '../chgc-image-annotations-part/chgc-image-annotations-part.component';

@Component({
  selector: 'cadmus-chgc-image-annotations-part-feature',
  templateUrl: './chgc-image-annotations-part-feature.component.html',
  styleUrls: ['./chgc-image-annotations-part-feature.component.css'],
  imports: [CadmusUiPgModule, ChgcImageAnnotationsPartComponent],
})
export class ChgcImageAnnotationsPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return ['gallery-image-annotation-filters', 'chgc-ids'];
  }
}
