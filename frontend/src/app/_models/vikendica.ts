import { parseTemplate } from "@angular/compiler";

export class Vikendica{
  Title:String = "";
  Description:String = "";
  Grade:number = 0;
  Location:string = "";
  Price:number = 0;
  _id:number = 0;
  photos:string[]=[];

  Vikendica(Title:String,Description:String,Grade:number,Location:string,_id:number,photos:string[]){
    this.Title = Title;
    this.Description = Description;
    this.Grade = Grade;
    this.Location = Location;
    this._id = _id;
    this.photos=photos;
  }
}
