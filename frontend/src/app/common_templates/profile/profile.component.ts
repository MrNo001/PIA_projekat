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

  user: User = new User(); 
  message = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  loading = false;
  creditCardError: string = '';

  ngOnInit(): void {
    const username = this.userService.getAuthUsername();
    console.log(username)
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.userService.getUser(username).subscribe({
      next: (u) => {
        this.user = u;
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

    if (!this.validateRequiredFields()) {
      this.loading = false;
      return;
    }

    this.validateCreditCard();
    if (this.creditCardError) {
      this.message = this.creditCardError;
      this.loading = false;
      return;
    }

    if (this.selectedFile && !this.validateFileType(this.selectedFile)) {
      this.message = 'Please provide a JPEG or PNG image';
      this.loading = false;
      return;
    }

    if (this.selectedFile) {
      this.validateFileDimensions(this.selectedFile).then(isValid => {
        if (!isValid) {
          this.message = 'Please provide a photo not smaller than 100x100 pixels and not larger than 300x300 pixels';
          this.loading = false;
          return;
        }

        this.performUpdate();
      });
    } else {
      this.performUpdate();
    }
  }

  private performUpdate() {
    const username = this.userService.getAuthUsername();
    if (!username) {
      this.message = 'No username found';
      this.loading = false;
      return;
    }

    this.user.username = username;

    this.userService.updateUser(this.user, this.selectedFile).subscribe({
      next: (res) => {
        if (res && res.user && res.user.profileImg) {
          this.imagePreviewUrl = this.userService.getUploadUrl(res.user.profileImg) as string;
        }
        this.message = 'Profile updated successfully.';
        this.loading = false;
        this.selectedFile = null; 
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
    const cardNumber = this.user.creditCard.replace(/\s/g, ''); 
    
    if (/^(36|38)\d{13}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    if (/^(300|301|302|303)\d{12}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    if (/^(51|52|53|54|55)\d{14}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
    if (/^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/.test(cardNumber)) {
      this.creditCardError = '';
      return;
    }
    
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
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    target.onerror = null;
  }

}
