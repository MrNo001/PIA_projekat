import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { AdminService } from '../services/admin/admin.service';
import { NavBarComponent } from '../common_templates/nav-bar/nav-bar.component';

interface RegistrationRequest {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'tourist';
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './admin-requests.component.html',
  styleUrl: './admin-requests.component.css'
})
export class AdminRequestsComponent implements OnInit {

  private userService = inject(UserService);
  private adminService = inject(AdminService);

  requests: RegistrationRequest[] = [];
  filteredRequests: RegistrationRequest[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Filters
  roleFilter: string = 'all';
  statusFilter: string = 'pending';
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalRequests: number = 0;

  // Rejection modal
  selectedRequest: RegistrationRequest | null = null;
  rejectionReason: string = '';

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';
    
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      role: this.roleFilter,
      status: this.statusFilter,
      search: this.searchTerm
    };

    this.adminService.getPendingRequests(params).subscribe({
      next: (response) => {
        // Map the User response to RegistrationRequest interface
        this.requests = response.requests
          .filter(req => req.role !== 'administrator') // Exclude admin accounts
          .map((req) => ({
            _id: req._id,
            username: req.username,
            firstName: req.firstName,
            lastName: req.lastName,
            email: req.email,
            role: req.role as 'owner' | 'tourist',
            submittedAt: new Date(req.createdAt),
            status: req.isActive ? 'approved' : (req.rejectionReason ? 'rejected' : 'pending'),
            rejectionReason: req.rejectionReason
          }));
        
        this.filteredRequests = this.requests;
        this.totalRequests = response.total;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load requests:', err);
        this.error = 'Failed to load registration requests. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    // Filters are now applied on the server side via loadRequests
    this.loadRequests();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filter changes
    this.loadRequests(); // Reload from API with new filters
  }

  approveRequest(request: RegistrationRequest): void {
    const message = `Are you sure you want to approve the registration request for "${request.username}"?`;
    
    if (confirm(message)) {
      this.loading = true;
      this.adminService.approveRequest(request.username).subscribe({
        next: (response) => {
          console.log('Request approved:', response);
          request.status = 'approved';
          this.loadRequests(); // Reload to get updated data
        },
        error: (err) => {
          console.error('Failed to approve request:', err);
          this.error = 'Failed to approve request. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  rejectRequest(request: RegistrationRequest): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    // Open Bootstrap modal programmatically
    const modalElement = document.getElementById('rejectionModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmRejection(): void {
    if (!this.selectedRequest) return;
    
    if (!this.rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    this.loading = true;
    this.adminService.rejectRequest(this.selectedRequest.username, this.rejectionReason).subscribe({
      next: (response) => {
        console.log('Request rejected:', response);
        this.selectedRequest!.status = 'rejected';
        this.selectedRequest!.rejectionReason = this.rejectionReason;
        this.closeRejectionModal();
        this.loadRequests(); // Reload to get updated data
      },
      error: (err) => {
        console.error('Failed to reject request:', err);
        this.error = 'Failed to reject request. Please try again.';
        this.loading = false;
      }
    });
  }

  closeRejectionModal(): void {
    this.selectedRequest = null;
    this.rejectionReason = '';
    // Close Bootstrap modal programmatically
    const modalElement = document.getElementById('rejectionModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getRoleBadgeClass(role: string): string {
    return role === 'owner' ? 'badge-warning' : 'badge-info';
  }

  get paginatedRequests(): RegistrationRequest[] {
    // Since API handles pagination, we return filtered requests directly
    return this.filteredRequests;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRequests(); // Reload from API with new page
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
