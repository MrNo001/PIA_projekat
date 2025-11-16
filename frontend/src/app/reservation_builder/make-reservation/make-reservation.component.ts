import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BuildReservationComponent } from '../build-reservation/build-reservation.component';
import { ConfirmReservationComponent } from '../confirm-reservation/confirm-reservation.component';
import { ReservationData } from '../../_models/reservation';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-make-reservation',
  standalone: true,
  imports: [CommonModule, BuildReservationComponent, ConfirmReservationComponent],
  templateUrl: './make-reservation.component.html',
  styleUrl: './make-reservation.component.css'
})
export class MakeReservationComponent implements OnInit {
  
  currentStep: number = 1;
  reservationData: ReservationData | null = null;
  cottageId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    const username = this.userService.getAuthUsername();
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    this.cottageId = this.route.snapshot.paramMap.get('CottageId') || '';
    if (!this.cottageId) {
      this.router.navigate(['/']);
      return;
    }
  }

  onReservationDataReceived(data: ReservationData) {
    this.reservationData = data;
    this.currentStep = 2;
  }

  onValidationStatusChanged(isValid: boolean) {
  }

  onReservationComplete(success: boolean) {
    if (success) {
      this.router.navigate(['/']);
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep = 1;
    } else {
      this.router.navigate(['/']);
    }
  }
}
