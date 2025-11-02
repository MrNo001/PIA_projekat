import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  form: FormGroup;
  successMessage = '';
  errorMessage = '';
  passwordError = '';
  loading = false;
  
  private oldPasswordTouched = false;
  private newPasswordTouched = false;
  private repeatPasswordTouched = false;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.form = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      repeatPassword: ['', Validators.required]
    });
  }

  showOldPasswordError(): boolean {
    return this.oldPasswordTouched && this.form.get('oldPassword')?.invalid!;
  }

  showNewPasswordError(): boolean {
    return this.newPasswordTouched && this.passwordError !== '';
  }

  showRepeatPasswordError(): boolean {
    return this.repeatPasswordTouched && (
      this.form.get('repeatPassword')?.invalid! || 
      this.getRepeatPasswordError() !== ''
    );
  }

  checkOldPassword() {
    this.oldPasswordTouched = true;
  }

  checkNewPassword() {
    this.newPasswordTouched = true;
    this.passwordError = '';
    this.errorMessage = '';
    
    const password = this.form.get('newPassword')?.value;
    if (password) {
      this.validatePassword(password);
    }
  }

  checkRepeatPassword() {
    this.repeatPasswordTouched = true;
    this.errorMessage = '';
  }

  getRepeatPasswordError(): string {
    if (!this.repeatPasswordTouched) return '';
    
    const repeatPassword = this.form.get('repeatPassword')?.value;
    const newPassword = this.form.get('newPassword')?.value;
    
    if (!repeatPassword) {
      return 'Please confirm your new password.';
    }
    
    if (repeatPassword !== newPassword) {
      return 'Passwords do not match.';
    }
    
    return '';
  }

  private validatePassword(password: string): boolean {
    // Check length
    if (password.length < 6 || password.length > 10) {
      this.passwordError = "Password must be 6-10 characters";
      return false;
    }
    
    // Check if starts with letter
    if (!/^[a-zA-Z]/.test(password)) {
      this.passwordError = "Password must start with a letter";
      return false;
    }
    
    // Count lowercase letters
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    if (lowercaseCount < 3) {
      this.passwordError = "Password must contain at least 3 lowercase letters";
      return false;
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      this.passwordError = "Password must contain at least 1 uppercase letter";
      return false;
    }
    
    // Check for number
    if (!/\d/.test(password)) {
      this.passwordError = "Password must contain at least 1 number";
      return false;
    }
    
    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.passwordError = "Password must contain at least 1 special character";
      return false;
    }
    
    this.passwordError = '';
    return true;
  }

  onSubmit() {
    // Mark all fields as touched
    this.oldPasswordTouched = true;
    this.newPasswordTouched = true;
    this.repeatPasswordTouched = true;

    // Clear previous messages
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Please fix all form errors before submitting.';
      return;
    }

    const { oldPassword, newPassword, repeatPassword } = this.form.value;

    // Validate password format
    if (!this.validatePassword(newPassword)) {
      return;
    }

    // Check if new password is different from old password
    if (newPassword === oldPassword) {
      this.errorMessage = 'New password must be different from your current password.';
      return;
    }

    // Check if passwords match
    if (newPassword !== repeatPassword) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }

    this.loading = true;
    this.userService.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = 'Password changed successfully! Redirecting to profile...';
        
        // Navigate to profile after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Current password is incorrect.';
        } else {
          this.errorMessage = 'Error changing password. Please try again.';
        }
      }
    });
  }
}
