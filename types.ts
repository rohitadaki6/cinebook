
export interface Movie {
  id: string;
  title: string;
  backdropUrl: string;
  posterUrl: string;
  rating: string;
  imdbRating: number;
  voteCount: string;
  formats: string[];
  genres: string[];
  duration: string;
  releaseDate: string;
  description: string;
  cast: CastMember[];
  reviews: Review[];
}

export interface CastMember {
  name: string;
  role: string;
  imageUrl: string;
}

export interface Review {
  id: string;
  userName: string;
  initials: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  avatarGradient: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  features: string[];
  showtimes: Showtime[];
}

export interface Showtime {
  id: string;
  time: string;
  status: 'available' | 'filling' | 'soldout';
}

export interface BookingState {
  date: string;
  cinemaId: string;
  showtimeId: string;
  format: string;
}
