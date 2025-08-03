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
  message = '';

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.form = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(/^[A-Za-z](?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{5,9}$/)]],
      repeatPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.message = 'Please fix the form.';
      return;
    }

    const { oldPassword, newPassword, repeatPassword } = this.form.value;

    if (newPassword === oldPassword) {
      this.message = 'New password must be different from old password.';
      return;
    }

    if (newPassword !== repeatPassword) {
      this.message = 'New passwords do not match.';
      return;
    }

    this.userService.changePassword(oldPassword, newPassword).subscribe({
      next: (res) => {
        this.message = 'Password changed successfully.';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err.error?.message || 'Error changing password.';
      }
    });
  }
}
