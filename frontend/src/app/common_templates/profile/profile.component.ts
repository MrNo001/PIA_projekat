import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../_models/user';
import { UserService } from '../../services/user/user.service'
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule,NavBarComponent,RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {


    private userService = inject(UserService);
  private router = inject(Router);

  user: User = new User(); // your model should have default fields; adjust if needed
  message = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  loading = false;
  creditCardError: string = '';

  ngOnInit(): void {
    const username = localStorage.getItem('key');
    console.log(username)
    if (!username) {
      // not logged in — redirect to login (or show message)
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.userService.getUser(username).subscribe({
      next: (u) => {
        this.user = u;
        // set preview if profileImage exists
        console.log(this.user);
        if ((u as any).profileImg) {
          this.imagePreviewUrl = this.userService.getUploadUrl((u as any).profileImg) as string;
          console.log(this.imagePreviewUrl);
        } else {
          this.imagePreviewUrl = '/media/default-profile.png';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch user', err);
        this.message = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }
    this.selectedFile = input.files[0];

    // show preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  saveProfile() {
    this.loading = true;
    this.message = '';
    this.creditCardError = '';

    // Validate all required fields
    if (!this.validateRequiredFields()) {
      this.loading = false;
      return;
    }

    // Validate credit card
    this.validateCreditCard();
    if (this.creditCardError) {
      this.message = this.creditCardError;
      this.loading = false;
      return;
    }

    // Validate file type if a new file is selected
    if (this.selectedFile && !this.validateFileType(this.selectedFile)) {
      this.message = 'Please provide a JPEG or PNG image';
      this.loading = false;
      return;
    }

    // Validate file dimensions if a new file is selected
    if (this.selectedFile) {
      this.validateFileDimensions(this.selectedFile).then(isValid => {
        if (!isValid) {
          this.message = 'Please provide a photo not smaller than 100x100 pixels and not larger than 300x300 pixels';
          this.loading = false;
          return;
        }

        // Proceed with update if validation passes
        this.performUpdate();
      });
    } else {
      // No file selected, proceed with update
      this.performUpdate();
    }
  }

  private performUpdate() {
    const username = localStorage.getItem('key');
    if (!username) {
      this.message = 'No username found';
      this.loading = false;
      return;
    }

    // Make sure username is set in the user object
    this.user.username = username;

    this.userService.updateUser(this.user, this.selectedFile).subscribe({
      next: (res) => {
        // Expect backend to return updated user with profileImg filename
        if (res && res.user && res.user.profileImg) {
          this.imagePreviewUrl = this.userService.getUploadUrl(res.user.profileImg) as string;
        }
        this.message = 'Profile updated successfully.';
        this.loading = false;
        this.selectedFile = null; // Clear the selected file after successful update
      },
      error: (err) => {
        console.error('Update failed', err);
        this.message = 'Failed to update profile.';
        this.loading = false;
      }
    });
  }

  private validateRequiredFields(): boolean {
    if (!this.user.firstName || !this.user.lastName || !this.user.email || 
        !this.user.address || !this.user.phone || !this.user.creditCard) {
      this.message = 'Please fill in all required fields';
      return false;
    }
    return true;
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
        
        // Check if dimensions are within 100x100 to 300x300 range
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

  validateCreditCard(): void {
    const cardNumber = this.user.creditCard.replace(/\s/g, ''); // Remove spaces
    
    // Check Diners Club cards starting with 36 or 38 (15 digits total)
    if (/^(36|38)\d{13}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    // Check Diners Club cards starting with 300, 301, 302, or 303 (15 digits total)
    if (/^(300|301|302|303)\d{12}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    // MasterCard: starts with 51, 52, 53, 54, or 55, exactly 16 digits
    if (/^(51|52|53|54|55)\d{14}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    // Visa: starts with 4539, 4556, 4916, 4532, 4929, 4485, 4716, exactly 16 digits
    if (/^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    // No match
    if (cardNumber.length > 0) {
      this.creditCardError = 'Invalid credit card number';
    } else {
      this.creditCardError = '';
    }
  }

  onCreditCardChange(): void {
    this.validateCreditCard();
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Use a data URL to prevent infinite loops
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    // Remove the error handler to prevent infinite loops
    target.onerror = null;
  }

}
