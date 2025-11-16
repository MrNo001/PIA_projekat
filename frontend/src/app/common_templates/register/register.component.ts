import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../_models/user';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user/user.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  message:String = "";

  http = inject(HttpClient);

  userService = inject(UserService)

  user:User = new User();
  selectedFile: File | null = null;
  creditCardType: string = '';
  passwordError: string = '';
  creditCardError: string = '';


   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  register(){

    if (!this.validateRequiredFields()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    this.validateCreditCard();
    if (this.creditCardError) {
      this.message = this.creditCardError;
      return;
    }

    if(this.selectedFile===null){
      this.message = "Please select an image";
      return;
    }

    if (!this.validateFileType(this.selectedFile)) {
      alert("Not supported file type");
      return;
    }

    this.validateFileDimensions(this.selectedFile).then(isValid => {
      if (!isValid) {
        alert("Please provide a photo not smaller than 100x100 pixels and not larger than 300x300 pixels");
        return;
      }



      this.userService.register(this.user,this.selectedFile as File).subscribe({
        next: (response: any) => {
          this.message = "Registration successful!";
          console.log(response);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.message = "Error during registration.";
        }
      });
    });
  }

  private validateFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
  }

  private validateFileDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        const width = img.width;
        const height = img.height;
        
        const isValid = width >= 100 && width <= 300 && height >= 100 && height <= 300;
        resolve(isValid);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  private validateRequiredFields(): boolean {
    if (!this.user.username || !this.user.password || !this.user.email || 
        !this.user.firstName || !this.user.lastName || !this.user.gender || 
        !this.user.address || !this.user.phone || !this.user.creditCard) {
      this.message = "Please fill in all required fields";
      return false;
    }
    return true;
  }

  private validatePassword(): boolean {
    const password = this.user.password;
    
    if (password.length < 6 || password.length > 10) {
      this.passwordError = "Password must be 6-10 characters";
      return false;
    }
    
    if (!/^[a-zA-Z]/.test(password)) {
      this.passwordError = "Password must start with a letter";
      return false;
    }
    
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    if (lowercaseCount < 3) {
      this.passwordError = "Password must contain at least 3 lowercase letters";
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      this.passwordError = "Password must contain at least 1 uppercase letter";
      return false;
    }
    
    if (!/\d/.test(password)) {
      this.passwordError = "Password must contain at least 1 number";
      return false;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.passwordError = "Password must contain at least 1 special character";
      return false;
    }
    
    this.passwordError = '';
    return true;
  }

  validateCreditCard(): void {
    const cardNumber = this.user.creditCard.replace(/\s/g, ''); 
    
    if (/^(36|38)\d{13}$/.test(cardNumber)) {
      this.creditCardType = 'diners';
      this.creditCardError = '';
      return;
    }
    
    if (/^(300|301|302|303)\d{12}$/.test(cardNumber)) {
      this.creditCardType = 'diners';
      this.creditCardError = '';
      return;
    }
    
    if (/^(51|52|53|54|55)\d{14}$/.test(cardNumber)) {
      this.creditCardType = 'mastercard';
      this.creditCardError = '';
      return;
    }
    
    if (/^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/.test(cardNumber)) {
      this.creditCardType = 'visa';
      this.creditCardError = '';
      return;
    }
    
    this.creditCardType = '';
    if (cardNumber.length > 0) {
      this.creditCardError = 'Invalid credit card number';
    } else {
      this.creditCardError = '';
    }
  }

  onCreditCardChange(): void {
    this.validateCreditCard();
  }

  onCreditCardFocus(): void {
    if (this.creditCardError) {
      this.creditCardError = '';
    }
  }

  onPasswordChange(): void {
    if (this.passwordError) {
      this.passwordError = '';
    }
  }

}
