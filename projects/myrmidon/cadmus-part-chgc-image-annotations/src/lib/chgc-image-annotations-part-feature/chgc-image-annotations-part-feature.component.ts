import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import {
  CHGC_GALLERY_FILTERS_THESAURUS_ID,
  CHGC_IDS_THESAURUS_ID,
} from '../chgc-image-annotations';
import { ChgcImageAnnotationsPartComponent } from '../chgc-image-annotations-part/chgc-image-annotations-part.component';

@Component({
  selector: 'cadmus-chgc-image-annotations-part-feature',
  templateUrl: './chgc-image-annotations-part-feature.component.html',
  styleUrl: './chgc-image-annotations-part-feature.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrentItemBarComponent, ChgcImageAnnotationsPartComponent],
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
    editorService: PartEditorService,
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService,
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [CHGC_GALLERY_FILTERS_THESAURUS_ID, CHGC_IDS_THESAURUS_ID];
  }
}
