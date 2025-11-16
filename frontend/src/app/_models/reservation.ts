import { Cottage } from './cottage';

export interface ReservationData {
  cottageId: string;
  cottage?: Cottage; 
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
}
