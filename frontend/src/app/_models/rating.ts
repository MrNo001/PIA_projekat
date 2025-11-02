export interface Rating {
  score: number;
  comment?: string;
  ratedAt?: Date;
}

export interface CreateRatingRequest {
  reservationId: string;
  rating: number;
  comment?: string;
}
