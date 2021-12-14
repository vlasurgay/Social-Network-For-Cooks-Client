import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { finalize, merge, ReplaySubject, takeUntil } from 'rxjs';
import { ingredientCategory, Stock } from 'src/app/_models';
import { IngredientFilter } from 'src/app/_models/_filters';
import { AlertService, IngredientService, StockService } from 'src/app/_services';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  formFilter: FormGroup;
  displayedColumns = ['image', 'name', 'ingredientCategory', 'actions'];
  dataSource: Stock[] = [];
  listButtons: boolean[] = [];
  destroy: ReplaySubject<any> = new ReplaySubject<any>();
  isLoadingResults = true;
  resultsLength = 0;
  listCategory: ingredientCategory[];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private stockService : StockService,
              private ingredientService: IngredientService, 
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private dialogRef: MatDialogRef<AddComponent>,
              @Inject(MAT_DIALOG_DATA) data: ingredientCategory[]) {
      this.listCategory = data;
      this.formFilter = this.formBuilder.group({
      searchText: [],
      status: [],
      ingredientCategories: [],
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadData();
    this.sort.sortChange.pipe(takeUntil(this.destroy)).subscribe(() => this.paginator.pageIndex = 0);
   merge(this.sort.sortChange, this.paginator.page).pipe(takeUntil(this.destroy)).subscribe(() => this.loadData());
 }

  ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }

  OnSubmitFilter(){
    this.paginator.pageIndex = 0;
    this.loadData();
  }

loadData(){
  const ingredientFilter: IngredientFilter = {
    sortASC: this.sort.direction == 'asc', sortBy: this.sort.active, ingredientCategory: this.ingredientCategories, searchText: this.searchText,
     numPage: this.paginator.pageIndex, sizePage: this.paginator.pageSize
  }
  this.isLoadingResults = true;
  this.stockService.getAvaibleIngredientForStock(ingredientFilter).pipe(takeUntil(this.destroy),
  finalize(() => this.isLoadingResults = false)).subscribe({
  next: data => {
      this.resultsLength = data.totalElements;
      this.dataSource = data.content;
      this.listButtons = Array.from({length: this.dataSource.length}, i => i = false);
      console.log(this.listButtons);
      const matTable= document.getElementById('table');
      if(matTable)
        matTable.scrollIntoView();
  },
  error: ()=> {
  this.dataSource = [];
  }
  });
}

  addIngredient(ingredientId: string, name: string, index: number){
    this.stockService.addIngredientInStock(ingredientId).pipe(takeUntil(this.destroy))
    .subscribe({
      next: () => {
        this.listButtons[index] = true;
        this.alertService.success(`'${name}' successfully added.`, false, true, "dialog");
      },
      error: () => {
        this.listButtons[index] = false;
        this.alertService.success(`Server error when adding '${name}'`, false, true, "dialog");
      }
    });
  }

  cancelAddIngredient(ingredientId: string, name: string, index: number){
    this.stockService.deleteIngredientInStock(ingredientId).pipe(takeUntil(this.destroy))
    .subscribe({
      next: () => {
        this.listButtons[index] = false;
        this.alertService.success(`'${name}' successfully cancelled.`, false, true, "dialog");
      },
      error: () => {
        this.listButtons[index] = false;
        this.alertService.success(`Server error when cancelling '${name}'`, false, true, "dialog");
      }
    });
  }

  get filterControl(){
    return this.formFilter.controls;
  }

  get searchText(){
    return this.filterControl['searchText'].value;
  }

  get ingredientCategories(){
    return this.formFilter.controls['ingredientCategories'].value
  }

}
