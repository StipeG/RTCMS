import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ThisReceiver } from '@angular/compiler';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';


export interface Column {
  id: string;
  visible?: boolean
  label: string,
  hideOrder: number,
  width?: number,
  type: string,
  disabled?: boolean,
  isPrimary:boolean
}

@Component({
  selector: 'app-shared-table',
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', visibility: 'hidden'})),
      state('expanded', style({height: '*', visibility: 'visible'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SharedTableComponent implements OnChanges, OnDestroy, OnInit  {
  public MIN_COLUMN_WIDTH:number = 200;

  // Filter Fields
  generalFilter = new FormControl

  // Visible Hidden Columns
  visibleColumns: Column[];
  hiddenColumns: Column[];
  expandedElement = { };
  primary_key: any;

  // MatPaginator Inputs
  length = 100;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  // Shared Variables
  @Input() dataSource: MatTableDataSource<any>;
  @Input() columnsdef: Column[];
  @Input() placeholder: string;
  @Input() annotiator: string;
  @Input() selectionMode: boolean;
  @Input() selection: SelectionModel<any>;
  @Output('clickRequest') clickRequest = new EventEmitter<any>();
  
  // MatTable
  @ViewChild(MatTable, { static: true })  dataTable: MatTable<Element>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator,{static:true}) paginator: MatPaginator;

  private rulerSubscription: Subscription;

  onClick(action: string, elem: any) {
    this.clickRequest.emit({'action': action, 'element': elem});
  }
 
  get visibleColumnsIds() {
    const visibleColumnsIds = this.visibleColumns.map(column => column.id)

    return this.hiddenColumns.length ? ['trigger', ...visibleColumnsIds] : visibleColumnsIds
  }

  get hiddenColumnsIds() {
    return this.hiddenColumns.map(column => column.id)
  }

  isExpansionDetailRow = (index, item) => item.hasOwnProperty('detailRow');

  public expand_icon_click(row: any)
  {
    
    this.expandedElement[row[this.primary_key]] =! this.expandedElement[row[this.primary_key]];
  }
  trackByFn(index, item) { 
    return item.id; 
  } 

  constructor(private ruler: ViewportRuler, private _changeDetectorRef: ChangeDetectorRef, private zone: NgZone) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.rulerSubscription = this.ruler.change(100).subscribe(data => {
      // accesing clientWidth cause browser layout, cache it!
      // const tableWidth = this.table.nativeElement.clientWidth;
      this.toggleColumns(this.dataTable['_elementRef'].nativeElement.clientWidth); 
    });
    if(!this.selection)
      this.selection = new SelectionModel<any>(false,[]);
    this.toggleColumns(this.dataTable['_elementRef'].nativeElement.clientWidth);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    if(this.columnsdef.find(x => x.isPrimary === true))
    {
      this.primary_key = this.columnsdef.find(x => x.isPrimary === true).id;
    }
    else
    {
      this.primary_key = this.columnsdef[0].id;
    }
  
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {  
      const value: any = data[sortHeaderId]; 
      return typeof value === "string" ? value.toLowerCase() : value; 
    };
    
    this.dataSource.filterPredicate = (data, filter) => {
      var total = false;
      var totalReg = true;
      let fc = null;
      let regArray = filter.match(/("([^"]|"")*")/g);
      if(regArray)
      {
        for(let a of regArray)
          filter = filter.replace(a, "");
        filter = filter.trim();
        if(filter !== '')
          fc = filter;
      }
      else
        fc = filter;
      
      if(regArray)
      {
        for(let expression of regArray)
        {
            let key = expression.substr(0, expression.indexOf(':')); 
            let value = expression.replace(key, "");
            key = key.replace(":", "").replace('"', '').trim();
            value = value.replace(":", "").replace('"', '').trim();
            for(let oKey of this.columnsdef)
            {
                if(oKey.id.toLocaleLowerCase() === key.toLocaleLowerCase() 
                || oKey.label.toLocaleLowerCase() === key.toLocaleLowerCase())
                {
                  let negative: boolean = false;
                  let negativeIncluded = false;
                  if(value.startsWith("-"))
                  {
                    value = value.substring(1);
                    negative = true;
                  }
                  if(negative)
                    totalReg = true;
                  if(oKey.type === "string")
                  {
                    if(negative === false)
                    {
                      if(data[oKey.id]) 
                        totalReg = (data[oKey.id].toString().trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1);
                    }
                    else
                    {
                      if(data[oKey.id]) 
                        negativeIncluded = (data[oKey.id].toString().trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1);
                      if(negativeIncluded)
                        return false;
                    }
                  }
                  else if(oKey.type === "checkbox")
                  {
                    var isTrueSet = (value.trim().toLowerCase() === 'true');
                    if(negative === false)
                    {
                      totalReg = (data[oKey.id] === isTrueSet);
                    }
                    else
                    {
                      negativeIncluded = (data[oKey.id] === isTrueSet);
                      if(negativeIncluded)
                        return false;
                    }
                  }
                  else if(oKey.type === "number")
                  {
                    if(value.startsWith("<="))
                    {
                      let number = Number(value.substring(2));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                            totalReg = (data[oKey.id] <= number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (data[oKey.id] <= number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith(">="))
                    {
                      let number = Number(value.substring(2));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (data[oKey.id] >= number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (data[oKey.id] >= number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith(">"))
                    {
                      let number = Number(value.substring(1));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (data[oKey.id] > number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (data[oKey.id] > number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith("<"))
                    {
                      let number = Number(value.substring(1));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (data[oKey.id] < number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (data[oKey.id] < number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith("="))
                    {
                      let number = Number(value.substring(1));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (data[oKey.id] === number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (data[oKey.id] === number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else
                    {
                      if(negative === false)
                      {
                        if(data[oKey.id]) 
                        totalReg = (data[oKey.id].toString().trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1);
                      }
                      else
                      {
                        if(data[oKey.id]) 
                          negativeIncluded = (data[oKey.id].toString().trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1);
                        if(negativeIncluded)
                          return false;
                      }
                    }
                  }
                  else if(oKey.type === "date")
                  {
                    if(value.startsWith("<="))
                    {
                      let number = Date.parse(value.substring(2));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                            totalReg = (Date.parse(data[oKey.id]) <= number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (Date.parse(data[oKey.id]) <= number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith(">="))
                    {
                      let number = Date.parse(value.substring(2));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (Date.parse(data[oKey.id]) >= number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (Date.parse(data[oKey.id]) >= number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith(">"))
                    {
                      let number = Date.parse(value.substring(1));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (Date.parse(data[oKey.id]) > number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (Date.parse(data[oKey.id]) > number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith("<"))
                    {
                      let number = Date.parse(value.substring(1));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (Date.parse(data[oKey.id]) < number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (Date.parse(data[oKey.id]) < number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else if(value.startsWith("="))
                    {
                      let number = Date.parse(value.substring(1));
                      if(number)
                      {
                          if(negative === false)
                          {
                            if(data[oKey.id]) 
                              totalReg = (Date.parse(data[oKey.id]) === number);
                          }
                          else
                          {
                            if(data[oKey.id]) 
                              negativeIncluded = (Date.parse(data[oKey.id]) === number);
                            if(negativeIncluded)
                              return false;
                          }
                      }
                    }
                    else
                    {
                      if(negative === false)
                      {
                        if(data[oKey.id]) 
                        totalReg = (data[oKey.id].toString().trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1);
                      }
                      else
                      {
                        if(data[oKey.id]) 
                          negativeIncluded = (data[oKey.id].toString().trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1);
                        if(negativeIncluded)
                          return false;
                      }
                    }
                  }
                  break; 
                }
                
            }
            if(totalReg === false)
              break;
        }
      }
      if(fc !== null)
      {
        
        let evilResponseProps = Object.keys(data);
        let negative: boolean = false;
        let negativeIncluded = false;
        if(fc.startsWith("-"))
        {
          fc = fc.substring(1);
           negative = true;
        }
        if(negative)
          total = true;
        for (let prop of evilResponseProps) {
          if(negative === false)
          {
            if(data[prop]) 
              total = (total || data[prop].toString().trim().toLowerCase().indexOf(fc.trim().toLowerCase()) !== -1);
          }
          else
          {
            if(data[prop]) 
              negativeIncluded = (data[prop].toString().trim().toLowerCase().indexOf(fc.trim().toLowerCase()) !== -1);
            if(negativeIncluded)
              total = false;
          }
        }
      }
      else
        total = true;

      return (total && totalReg);
    }
  }
  getExpendedElemLenght() : boolean
  {
    if(this.expandedElement && (<any>this.expandedElement).length)
      return true;
    return false;
  }


  /**
   * Lifecycle Hook Start
   */
 
  ngOnInit(){    
  }
  ngAfterContentInit() {
    

  }
  getSpecificColumnIndexByFilter(filter : string)
  {
      let arr = []
      for(var i = 0; i < this.columnsdef.length; i++)
      {
        if(filter.toLocaleLowerCase().includes(this.columnsdef[i].label + ':'))
          arr.push(this.columnsdef[i]);
      }
      return arr;
  }

  ngOnDestroy() {
    this.rulerSubscription.unsubscribe();
  }

  /**
   * Lifecycle Hook End
   */

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  
  toggleColumns(tableWidth: number){
    //console.log('tableWidth',tableWidth)
    this.zone.runOutsideAngular(() => {
      const sortedColumns = this.columnsdef.slice()
        .map((column, index) => ({ ...column, order: index }))
        .sort((a, b) => a.hideOrder - b.hideOrder);

      for (const column of sortedColumns) {
        const columnWidth = column.width ? column.width : this.MIN_COLUMN_WIDTH;
        //console.log('columnWidth',columnWidth)

        if (column.hideOrder && tableWidth < columnWidth) {
          column.visible = false;

          continue;
        }

        tableWidth -= columnWidth;
        column.visible = true;
      }

      this.columnsdef = sortedColumns.sort((a, b) => a.order - b.order);
      this.visibleColumns = this.columnsdef.filter(column => column.visible);
      this.hiddenColumns = this.columnsdef.filter(column => !column.visible)
    })

    this._changeDetectorRef.detectChanges();
  }

}
