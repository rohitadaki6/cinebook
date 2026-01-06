
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, Cinema, BookingState } from './types';
import { DUNE_MOVIE, CINEMAS } from './constants';

// --- Sub-components (Defined outside to avoid re-renders) ---

interface NavbarProps {
  onSearch: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-background-dark/95 backdrop-blur-sm px-4 lg:px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => window.location.reload()}>
          <span className="material-symbols-outlined text-primary text-3xl">movie</span>
          <h1 className="text-xl font-bold tracking-tight">CineBook</h1>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          {['Movies', 'Events', 'Sports', 'Activities'].map((item, idx) => (
            <a key={item} href="#" className={`${idx === 0 ? 'text-white' : 'text-text-secondary'} text-sm font-medium hover:text-white transition-colors`}>{item}</a>
          ))}
        </nav>
      </div>
      <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs h-10">
          <div className="flex w-full items-center rounded-full border border-border-dark bg-surface-dark px-4 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <span className="material-symbols-outlined text-text-secondary text-lg">search</span>
            <input 
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-text-secondary text-sm" 
              placeholder="AI-powered search..." 
            />
          </div>
        </form>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="text-sm font-medium text-text-secondary group-hover:text-white">New York</span>
            <span className="material-symbols-outlined text-text-secondary text-sm group-hover:text-white">expand_more</span>
          </div>
          <button className="bg-primary hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};

interface HeroProps {
  movie: Movie;
}

const Hero: React.FC<HeroProps> = ({ movie }) => (
  <section className="relative w-full h-[50vh] min-h-[400px] lg:h-[600px] bg-surface-dark overflow-hidden">
    <div 
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
      style={{ backgroundImage: `url('${movie.backdropUrl}')` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/30 to-transparent" />
    <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-12">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold border border-white/10">{movie.rating}</span>
          <span className="bg-primary text-white px-2 py-0.5 rounded text-xs font-bold">IMAX</span>
        </div>
        <h2 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4">{movie.title}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-text-secondary text-sm md:text-base font-medium">
          <span className="text-white">{movie.genres.join(' • ')}</span>
          <span className="w-1 h-1 rounded-full bg-text-secondary" />
          <span>{movie.duration}</span>
          <span className="w-1 h-1 rounded-full bg-text-secondary" />
          <span>{movie.releaseDate}</span>
        </div>
        <div className="flex items-center gap-4 mt-8">
          <button className="flex items-center gap-2 bg-white text-black h-12 px-6 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg">
            <span className="material-symbols-outlined">play_arrow</span> Watch Trailer
          </button>
          <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 h-12 px-6 rounded-full font-bold hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined">add</span> Watchlist
          </button>
        </div>
      </div>
    </div>
  </section>
);

interface DatePickerProps {
  selectedDate: string;
  onSelect: (d: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelect }) => {
  const dates = useMemo(() => {
    const arr = [];
    const now = new Date();
    for(let i=0; i<7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      arr.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        key: d.toISOString().split('T')[0]
      });
    }
    return arr;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white">Select Date</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {dates.map((d) => (
          <button
            key={d.key}
            onClick={() => onSelect(d.key)}
            className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-xl transition-all shrink-0 ${
              selectedDate === d.key 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-surface-dark border border-border-dark text-text-secondary hover:text-white hover:border-primary/50'
            }`}
          >
            <span className="text-xs font-medium uppercase opacity-70">{d.day}</span>
            <span className="text-2xl font-bold">{d.dateNum}</span>
            <span className="text-xs font-medium uppercase">{d.month}</span>
          </button>
        ))}
      </div>
      <div className="h-[1px] w-full bg-border-dark mt-2" />
    </div>
  );
};

// Fixed CinemaCard type error by using React.FC and an explicit prop interface to ensure JSX attribute compatibility.
interface CinemaCardProps {
  cinema: Cinema;
  onSelect: (id: string) => void;
  selectedShowtime: string;
}

const CinemaCard: React.FC<CinemaCardProps> = ({ cinema, onSelect, selectedShowtime }) => (
  <div className="flex flex-col md:flex-row gap-6 p-5 bg-surface-dark rounded-xl border border-border-dark hover:border-white/10 transition-colors">
    <div className="flex flex-col gap-1 md:w-1/3">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${cinema.id === 'c2' ? 'text-primary' : 'text-text-secondary'} text-lg`}>
          {cinema.id === 'c2' ? 'favorite' : 'favorite'}
        </span>
        <h4 className="font-bold text-white">{cinema.name}</h4>
      </div>
      <p className="text-xs text-text-secondary pl-7">{cinema.address}</p>
      {cinema.features.map(f => (
        <div key={f} className="flex items-center gap-2 mt-2 pl-7 text-green-400 text-xs font-medium">
          <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
          {f}
        </div>
      ))}
    </div>
    <div className="flex flex-1 flex-wrap content-center gap-3">
      {cinema.showtimes.map(st => (
        <button
          key={st.id}
          disabled={st.status === 'soldout'}
          onClick={() => onSelect(`${cinema.id}-${st.id}`)}
          className={`group flex flex-col items-center justify-center w-24 h-10 border rounded transition-all
            ${st.status === 'soldout' ? 'opacity-50 cursor-not-allowed border-white/10' : 'border-white/20 hover:bg-primary hover:border-primary'}
            ${selectedShowtime === `${cinema.id}-${st.id}` ? 'bg-primary border-primary' : ''}
          `}
        >
          <span className={`text-sm font-bold ${
            st.status === 'available' ? 'text-green-400' : 
            st.status === 'filling' ? 'text-yellow-500' : 'text-red-500'
          } group-hover:text-white ${selectedShowtime === `${cinema.id}-${st.id}` ? 'text-white' : ''}`}>
            {st.time}
          </span>
          {st.status === 'soldout' && <span className="text-[9px] leading-none text-text-secondary">Sold Out</span>}
        </button>
      ))}
    </div>
  </div>
);

interface BookingSidebarProps {
  movie: Movie;
  state: BookingState;
  setState: React.Dispatch<React.SetStateAction<BookingState>>;
  onBook: () => void;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({ movie, state, setState, onBook }) => {
  const selectedCinema = CINEMAS.find(c => c.id === state.cinemaId);
  
  return (
    <div className="sticky top-24 bg-surface-dark border border-border-dark rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-6 text-white">Booking Summary</h3>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <img src={movie.posterUrl} className="w-16 h-24 rounded-lg object-cover shadow-lg" alt="Poster" />
          <div>
            <h4 className="text-white font-bold leading-tight mb-1">{movie.title}</h4>
            <div className="text-sm text-text-secondary mb-2">English, {state.format}</div>
            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
              <span className="material-symbols-outlined text-[18px] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>{movie.imdbRating}/10</span>
              <span className="text-text-secondary font-normal text-xs ml-1">({movie.voteCount})</span>
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-border-dark" />
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Cinema</label>
            <div className="relative">
              <select 
                value={state.cinemaId}
                onChange={(e) => setState(prev => ({ ...prev, cinemaId: e.target.value }))}
                className="w-full bg-background-dark text-white border border-border-dark rounded-lg py-3 px-4 appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                {CINEMAS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-secondary pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Showtime</label>
            <div className="relative">
              <select 
                value={state.showtimeId}
                onChange={(e) => setState(prev => ({ ...prev, showtimeId: e.target.value }))}
                className="w-full bg-background-dark text-white border border-border-dark rounded-lg py-3 px-4 appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                {selectedCinema?.showtimes.filter(s => s.status !== 'soldout').map(s => (
                  <option key={s.id} value={s.id}>{s.time}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-secondary pointer-events-none">schedule</span>
            </div>
          </div>
        </div>
        <div className="bg-background-dark rounded-lg p-4 mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-text-secondary">Subtotal</span>
            <span className="text-sm font-bold">$36.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">Fees</span>
            <span className="text-xs font-medium text-text-secondary">$4.50</span>
          </div>
        </div>
        <button 
          onClick={onBook}
          className="w-full h-14 bg-primary hover:bg-red-600 text-white rounded-full font-bold text-lg tracking-wide shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98]"
        >
          Book Tickets
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [movie, setMovie] = useState<Movie>(DUNE_MOVIE);
  const [loading, setLoading] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({
    date: new Date().toISOString().split('T')[0],
    cinemaId: CINEMAS[0].id,
    showtimeId: CINEMAS[0].showtimes[0].id,
    format: 'IMAX 2D'
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Create a new GoogleGenAI instance right before making an API call per coding guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the user query: "${query}", find a movie and return its details in valid JSON format. 
        Focus on real popular movies. Provide: title, backdropUrl (a high quality cinematic url from unsplash or picsum), 
        posterUrl, rating (PG-13, R, etc), imdbRating (0-10), voteCount, formats (array of strings like IMAX, 2D), 
        genres (array of strings), duration, releaseDate, description, cast (array of {name, role, imageUrl}), 
        and 2 sample reviews. Use realistic movie imagery or placeholders if necessary.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              backdropUrl: { type: Type.STRING },
              posterUrl: { type: Type.STRING },
              rating: { type: Type.STRING },
              imdbRating: { type: Type.NUMBER },
              voteCount: { type: Type.STRING },
              formats: { type: Type.ARRAY, items: { type: Type.STRING } },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              duration: { type: Type.STRING },
              releaseDate: { type: Type.STRING },
              description: { type: Type.STRING },
              cast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    imageUrl: { type: Type.STRING }
                  }
                }
              },
              reviews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    userName: { type: Type.STRING },
                    initials: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    comment: { type: Type.STRING },
                    helpfulCount: { type: Type.NUMBER },
                    avatarGradient: { type: Type.STRING }
                  }
                }
              }
            },
            required: ['title', 'description', 'genres', 'cast']
          }
        }
      });

      const movieData = JSON.parse(response.text);
      // Fallbacks for URLs if AI generates broken ones
      const finalMovie = {
        ...movieData,
        id: Math.random().toString(36).substr(2, 9),
        backdropUrl: movieData.backdropUrl || `https://picsum.photos/seed/${movieData.title}/1200/800`,
        posterUrl: movieData.posterUrl || `https://picsum.photos/seed/${movieData.title}/300/450`
      };
      setMovie(finalMovie);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    alert(`Tickets booked for ${movie.title} at ${CINEMAS.find(c => c.id === bookingState.cinemaId)?.name} for ${bookingState.showtimeId}!`);
  };

  const selectFullShowtime = (combo: string) => {
    const [cId, sId] = combo.split('-');
    setBookingState(prev => ({ ...prev, cinemaId: cId, showtimeId: sId }));
  };

  return (
    <div className="min-h-screen font-display bg-background-dark text-white selection:bg-primary selection:text-white">
      <Navbar onSearch={handleSearch} />
      
      <main className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <Hero movie={movie} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <DatePicker 
              selectedDate={bookingState.date} 
              onSelect={(d) => setBookingState(prev => ({ ...prev, date: d }))} 
            />

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Showtimes in New York</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setBookingState(prev => ({ ...prev, format: 'IMAX 2D' }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${bookingState.format === 'IMAX 2D' ? 'text-primary border-primary/30 bg-primary/10' : 'text-text-secondary border-border-dark bg-surface-dark hover:text-white'}`}
                  >
                    IMAX 2D
                  </button>
                  <button 
                    onClick={() => setBookingState(prev => ({ ...prev, format: 'Standard 2D' }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${bookingState.format === 'Standard 2D' ? 'text-primary border-primary/30 bg-primary/10' : 'text-text-secondary border-border-dark bg-surface-dark hover:text-white'}`}
                  >
                    Standard 2D
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {CINEMAS.map(cinema => (
                  <CinemaCard 
                    key={cinema.id} 
                    cinema={cinema} 
                    onSelect={selectFullShowtime} 
                    selectedShowtime={`${bookingState.cinemaId}-${bookingState.showtimeId}`}
                  />
                ))}
              </div>
            </div>

            <div className="h-[1px] w-full bg-border-dark" />

            <section className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-white">About the Movie</h3>
              <p className="text-text-secondary text-base leading-relaxed">{movie.description}</p>
            </section>

            <div className="h-[1px] w-full bg-border-dark" />

            <section className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-white">Cast</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {movie.cast.map((person, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 min-w-[100px] group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all shadow-xl">
                      <img alt={person.name} className="w-full h-full object-cover" src={person.imageUrl} />
                    </div>
                    <div className="text-center">
                      <h4 className="text-white text-sm font-bold leading-tight">{person.name}</h4>
                      <p className="text-text-secondary text-xs mt-0.5">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-[1px] w-full bg-border-dark" />

            <section className="flex flex-col gap-6 mb-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Top Reviews</h3>
                <button className="text-primary text-sm font-bold hover:underline">Write a Review</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movie.reviews.map(review => (
                  <div key={review.id} className="bg-surface-dark p-5 rounded-xl border border-border-dark flex flex-col gap-3 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${review.avatarGradient} flex items-center justify-center text-xs font-bold`}>{review.initials}</div>
                        <span className="text-sm font-bold">{review.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                        <span className="material-symbols-outlined text-[16px] fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {review.rating}/10
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                    <div className="flex items-center gap-4 mt-auto pt-2">
                      <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[16px]">thumb_up</span> Helpful ({review.helpfulCount})
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[16px]">thumb_down</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <aside className="lg:col-span-4 hidden lg:block">
            <BookingSidebar 
              movie={movie} 
              state={bookingState} 
              setState={setBookingState} 
              onBook={handleBooking} 
            />
          </aside>
        </div>
      </main>

      {/* Mobile Floating CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface-dark border-t border-border-dark z-40 flex items-center justify-between gap-4 safe-area-bottom">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Total</span>
          <span className="text-xl font-bold text-white">$40.50</span>
        </div>
        <button 
          onClick={handleBooking}
          className="flex-1 h-12 bg-primary text-white rounded-full font-bold text-base shadow-lg shadow-primary/30"
        >
          Book Tickets
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-bold animate-pulse">Summoning Movie details...</p>
          </div>
        </div>
      )}
    </div>
  );
}
