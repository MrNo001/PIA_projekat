import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { AdminService, User } from '../services/admin/admin.service';
import { NavBarComponent } from '../common_templates/nav-bar/nav-bar.component';

// User interface is now imported from AdminService

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {

  private userService = inject(UserService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  users: User[] = [];
  filteredUsers: User[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Filters
  roleFilter: string = 'all';
  statusFilter: string = 'all';
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    const params = {
      page: this.currentPage.toString(),
      limit: this.itemsPerPage.toString(),
      role: this.roleFilter,
      status: this.statusFilter,
      search: this.searchTerm
    };
    
    this.adminService.getAllUsers(params).subscribe({
      next: (response) => {
        this.users = response.users;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Filter out administrators - admins shouldn't be visible on this page
      if (user.role === 'administrator') {
        return false;
      }
      
      const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;
      const matchesStatus = this.statusFilter === 'all' || 
        (this.statusFilter === 'active' && user.isActive) ||
        (this.statusFilter === 'inactive' && !user.isActive);
      const matchesSearch = this.searchTerm === '' || 
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesRole && matchesStatus && matchesSearch;
    });
    
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} user "${user.username}"?`;
    
    if (confirm(message)) {
      this.adminService.updateUser(user.username, { isActive: !user.isActive }).subscribe({
        next: (response) => {
          user.isActive = !user.isActive;
          console.log(`User ${user.username} ${action}d`);
        },
        error: (err) => {
          console.error(`Failed to ${action} user:`, err);
          alert(`Failed to ${action} user. Please try again.`);
        }
      });
    }
  }

  deleteUser(user: User): void {
    const message = `Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`;
    
    if (confirm(message)) {
      this.adminService.deleteUser(user.username).subscribe({
        next: (response) => {
          this.users = this.users.filter(u => u._id !== user._id);
          this.applyFilters();
          console.log(`User ${user.username} deleted`);
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  editUser(user: User): void {
    // Navigate to admin edit user page
    this.router.navigate(['/admin/users/edit', user.username]);
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'administrator': return 'badge-danger';
      case 'owner': return 'badge-warning';
      case 'tourist': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
