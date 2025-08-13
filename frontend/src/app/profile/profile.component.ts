import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../_models/user';
import { UserService } from '../services/user/user.service'
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

    this.userService.updateUser(this.user, this.selectedFile).subscribe({
      next: (res) => {
        // Expect backend to return updated user with profileImage filename
        if (res && res.user && res.user.profileImage) {
          this.imagePreviewUrl = this.userService.getUploadUrl(res.user.profileImage) as string;
        }
        this.message = 'Profile updated successfully.';
        this.loading = false;
        // optionally update localStorage if username changed etc.
      },
      error: (err) => {
        console.error('Update failed', err);
        this.message = 'Failed to update profile.';
        this.loading = false;
      }
    });
  }


}
