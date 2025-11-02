
export class User {
  constructor(
    public username: string = "",
    public password: string = "",
    public email: string = "",
    public firstName: string = "",
    public lastName: string = "",
    public gender: 'M' | 'Ž' = "M",
    public address: string = "",
    public phone: string= "",
    public profileImage: string = "",
    public creditCard: string ="",
    public role:string = "tourist",
    public isActive: boolean = false
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Add other helpful methods here as needed
}
