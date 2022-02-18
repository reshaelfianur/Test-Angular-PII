import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from "@angular/material/sort";
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { debounceTime, distinctUntilChanged, startWith, tap, delay, catchError, finalize, map } from 'rxjs/operators';
import { merge, fromEvent, throwError, Observable } from 'rxjs';
import * as _ from 'lodash';

import { UsersService } from 'src/app/services/users.service';
import { ConfirmDialogService } from "src/app/utils/confirm-dialog.service";
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  @ViewChild('filter', { static: true })
  filter?: ElementRef;

  public userForm!: NgForm;
  public users: User[] = [];
  public user: User;

  public editFormGroup!: FormGroup;
  public addFormGroup!: FormGroup;

  public usersLength: number;

  public isLoading: boolean = false;
  public isEditMode: boolean = false;

  public viewMode: string = 'view';

  public viewContent: any;
  public dialogRef: any;

  public dataSource = new MatTableDataSource();
  public displayedColumns: string[] = ['id', 'first_name', 'last_name', 'email', 'actions'];

  public horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  public verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private _snackBar: MatSnackBar,
    private confirmDialogService: ConfirmDialogService,
    public dialog: MatDialog) {
    this.user = {} as User;
    this.usersLength = 0;
  }

  ngOnInit(): void {
    // this.getAllUserServerSide();
    this.getAllUserClientSide();
  }

  ngAfterViewInit() {
    // this.retryGetAllUserServerSide();
    this.retryGetAllUserClientSide();
  }

  retryGetAllUserClientSide() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.onFilterClientSide();
  }

  retryGetAllUserServerSide() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.getAllUserServerSide())
      )
      .subscribe();

    this.onFilter();
  }

  onFilterClientSide() {
    const obs = fromEvent(this.filter?.nativeElement, 'keyup')
      .pipe(debounceTime(500))
      .subscribe((res: any) => {
        const filterValue = (res.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }


  getAllUserClientSide() {
    this.usersService.getList().subscribe((response: any) => {
      this.users = response.data;
      this.dataSource = new MatTableDataSource(response.data);

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getAllUserServerSide(filter?: string) {
    this.isLoading = true;

    this.usersService.findUser(
      this.sort?.direction ?? "asc",
      this.paginator?.pageIndex ?? 0,
      this.paginator?.pageSize ?? 5,
      this.sort?.active ?? "id",
      filter ?? null)
      .pipe(
        tap((users: any) => {
          this.users = users.data;
          this.dataSource = users.data;
          this.usersLength = users.total;
        }),
        catchError(err => {
          alert("Error loading users.");
          return throwError(err);

        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe();
  }

  onFilter() {
    const obs = fromEvent(this.filter?.nativeElement, 'keyup')
      .pipe(debounceTime(500))
      .subscribe((res: any) => this.getAllUserServerSide((res.target as HTMLInputElement).value));
  }

  onAdd(form: any) {
    this.addFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      avatar: ['Choose File'],
    });

    this.dialogRef = this.dialog.open(form, { disableClose: true, width: '350px' });
  }

  onDetail(form: any, id: number) {
    this.editFormGroup = this.formBuilder.group({
      id: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      avatar: [''],
    });

    let row: any = this.users.find((row: any) => row.id == id);

    this.viewContent = row;
    this.editFormGroup.patchValue(row);

    this.viewMode = 'view';
    this.dialogRef = this.dialog.open(form, { disableClose: true, height: 'auto', width: '350px' });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSaveAdd() {
    console.log(this.addFormGroup.value);

    if (this.addFormGroup.invalid) {
      return;
    }

    this.dialogRef.close();
    this.openSnackBar('Successfully created User');
  }

  onSaveEdit() {
    console.log(this.editFormGroup.value);

    if (this.editFormGroup.invalid) {
      return;
    }

    this.dialogRef.close();
    this.openSnackBar('Successfully updated User');
  }

  onDelete(id: number) {
    console.log(id);

    this.confirmDialogService.confirmDialog().subscribe(isConfirmed => {
      if (isConfirmed) {
        this.dialogRef.close();
        this.openSnackBar('Successfully deleted User');
      }
    })
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Undo', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  uploadFileEvt(imgFile: any, type: string = 'add') {
    if (imgFile.target.files && imgFile.target.files[0]) {

      if (type == 'add') {
        this.addFormGroup.get('avatar')?.setValue(imgFile.target.files[0].name);
      } else {
        this.editFormGroup.get('avatar')?.setValue(imgFile.target.files[0].name);
      }

      // Use if multiple upload
      // let fileAttr = '';

      // Array.from(imgFile.target.files).forEach((file: any) => {
      //   fileAttr += file.name + ' - ';
      // });

      let reader = new FileReader();

      reader.onload = (e: any) => {
        let image = new Image();

        image.src = e.target.result;
        image.onload = rs => {
          let imgBase64Path = e.target.result;
        };
      };
      reader.readAsDataURL(imgFile.target.files[0]);

      this.fileInput.nativeElement.value = "";
    } else {
      if (type == 'add') {
        this.addFormGroup.get('avatar')?.setValue('Choose File');
      } else {
        this.editFormGroup.get('avatar')?.setValue('Choose File');
      }
    }
  }
}
