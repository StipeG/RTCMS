import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BasicService {
  public CoreObject: any;
  constructor() { }
  public SetCoreObject(obj:any)
  {
    this.CoreObject = obj;
  }
}
