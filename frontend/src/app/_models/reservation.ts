import { Cottage } from './cottage';

export interface ReservationData {
  cottageId: string;
  cottage?: Cottage; // Include cottage data for display purposes
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
}
