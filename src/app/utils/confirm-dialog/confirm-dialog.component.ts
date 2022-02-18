import { Component, OnInit, Inject } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  title!: string;
  message!: string;
  btnOkText!: string;
  btnCancelText!: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
    // Update view with given values
    this.title = data.title;
    this.message = data.message;
    this.btnOkText = data.btnOkText;
    this.btnCancelText = data.btnCancelText;
  }

  ngOnInit(): void {
  }

  confirm() {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  decline() {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}

export class ConfirmDialogModel {

  constructor(
    public title: string,
    public message: string,
    public btnOkText: string,
    public btnCancelText: string) {
  }
}
