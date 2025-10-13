export class Vikendica {
  _id?: string = "";
  Title: string = "";
  Description: string = "";
  Ocena: number = -1;
  OwnerId: string | any = ""; // Can be string or populated user object
  Location: { lat: number, lng: number } = { lat: 0, lng: 0 };
  PriceSummer: number = 0;
  PriceWinter: number = 0;
  Photos: string[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    Title?: string,
    Description?: string,
    Ocena?: number,
    Location?: { lat: number, lng: number },
    _id?: string,
    Photos?: string[]
  ) {
    if (Title) this.Title = Title;
    if (Description) this.Description = Description;
    if (Ocena !== undefined) this.Ocena = Ocena;
    if (Location) this.Location = Location;
    if (_id) this._id = _id;
    if (Photos) this.Photos = Photos;
  }
}
