import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from "rxjs";

import { ConfirmDialogComponent, ConfirmDialogModel } from "src/app/utils/confirm-dialog/confirm-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) { }

  confirmDialog(): Observable<boolean> {
    return new Observable(observer => {
      const title = 'Confirmation';
      const message = 'Are you sure you want to do this?';
      const btnOkText = 'Ok';
      const btnCancelText = 'Cancel';

      const dialogData = new ConfirmDialogModel(title, message, btnOkText, btnCancelText);

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        observer.next(dialogResult);
        observer.complete(); //to avoid memory leaks
      });
    });

  }

}
