const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Movie = require('./models/Movie');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

const WIKI_PAGE_TITLES = {
  'Kalki 2898-AD': 'Kalki_2898_AD',
  'Stree 2': 'Stree_2',
  'Pushpa 2: The Rule': 'Pushpa_2:_The_Rule',
  'Singham Again': 'Singham_Again',
  'The Marvels': 'The_Marvels',
  Animal: 'Animal_(2023_Indian_film)',
  Jawan: 'Jawan_(film)',
  RRR: 'RRR_(2022_film)',
  Leo: 'Leo_(2023_Indian_film)',
  Oppenheimer: 'Oppenheimer_(film)',
  Dunki: 'Dunki_(film)',
  Salaar: 'Salaar:_Part_1_–_Ceasefire',
  'Rocky Aur Rani Kii Prem Kahaani': 'Rocky_Aur_Rani_Kii_Prem_Kahaani',
  Pathaan: 'Pathaan_(film)',
};

const POSTER_FILE_OVERRIDES = {
  'Kalki 2898-AD': 'Kalki_2898_AD.jpg',
  RRR: 'RRR_Poster.jpg',
};

const getPosterFromWikipedia = async (movieTitle) => {
  try {
    if (POSTER_FILE_OVERRIDES[movieTitle]) {
      return `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(
        POSTER_FILE_OVERRIDES[movieTitle]
      )}`;
    }

    const wikiTitle = WIKI_PAGE_TITLES[movieTitle] || movieTitle.replace(/\s+/g, '_');
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=${encodeURIComponent(
      wikiTitle
    )}`;

    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data = await response.json();
    const pages = data?.query?.pages || {};
    const firstPage = Object.values(pages)[0];
    const wikiContent = firstPage?.revisions?.[0]?.slots?.main?.['*'] || '';
    const imageMatch = wikiContent.match(/\|\s*image\s*=\s*([^\n\r|]+)/i);
    const rawImage = imageMatch?.[1]?.trim();
    if (!rawImage) return null;

    const cleanFileName = rawImage
      .replace(/\[\[|\]\]/g, '')
      .replace(/^File:/i, '')
      .replace(/^Image:/i, '')
      .split('|')[0]
      .trim();

    if (!cleanFileName) return null;
    return `https://en.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(cleanFileName)}`;
  } catch {
    return null;
  }
};

const addExactPosters = async (moviesList) => {
  const updatedMovies = [];

  for (const movie of moviesList) {
    const wikiPoster = await getPosterFromWikipedia(movie.title);
    updatedMovies.push({
      ...movie,
      poster: wikiPoster || movie.poster || '',
    });
  }

  return updatedMovies;
};

const movies = [
  {
    title: 'Kalki 2898-AD',
    description: 'A dystopian sci-fi epic set in the future, blending mythology with cutting-edge technology in a post-apocalyptic world.',
    genre: 'Sci-Fi',
    language: 'Telugu',
    duration: '3h 1m',
    rating: 8.5,
    showTime: '10:00 AM',
    showDates: ['2024-07-15', '2024-07-16', '2024-07-17', '2024-07-18'],
    availableSeats: 85,
    totalSeats: 100,
    price: 350,
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
    cast: ['Prabhas', 'Deepika Padukone', 'Amitabh Bachchan'],
    isActive: true,
  },
  {
    title: 'Stree 2',
    description: 'The supernatural horror comedy returns with Stree haunting the town again, and the gang must reunite to stop her.',
    genre: 'Comedy',
    language: 'Hindi',
    duration: '2h 22m',
    rating: 8.9,
    showTime: '1:30 PM',
    showDates: ['2024-08-15', '2024-08-16', '2024-08-17', '2024-08-18'],
    availableSeats: 62,
    totalSeats: 100,
    price: 300,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Tamannaah'],
    isActive: true,
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'Pushpa Raj expands his red sandalwood smuggling empire while facing challenges from law enforcement and rivals.',
    genre: 'Action',
    language: 'Telugu',
    duration: '3h 20m',
    rating: 9.1,
    showTime: '4:00 PM',
    showDates: ['2024-12-05', '2024-12-06', '2024-12-07', '2024-12-08'],
    availableSeats: 20,
    totalSeats: 120,
    price: 400,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    isActive: true,
  },
  {
    title: 'Singham Again',
    description: 'The fearless cop Singham returns with a massive team of police officers to battle the ultimate villain.',
    genre: 'Action',
    language: 'Hindi',
    duration: '2h 44m',
    rating: 7.8,
    showTime: '7:00 PM',
    showDates: ['2024-11-01', '2024-11-02', '2024-11-03', '2024-11-04'],
    availableSeats: 75,
    totalSeats: 100,
    price: 280,
    poster: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=600&fit=crop',
    cast: ['Ajay Devgn', 'Kareena Kapoor', 'Ranveer Singh', 'Deepika Padukone'],
    isActive: true,
  },
  {
    title: 'The Marvels',
    description: 'Carol Danvers, Kamala Khan, and Monica Rambeau must work together when their powers become mysteriously entangled.',
    genre: 'Superhero',
    language: 'English',
    duration: '1h 45m',
    rating: 6.8,
    showTime: '11:00 AM',
    showDates: ['2024-07-20', '2024-07-21', '2024-07-22'],
    availableSeats: 90,
    totalSeats: 100,
    price: 320,
    poster: 'https://images.unsplash.com/photo-1608346128925-4e2eb9a0d4e4?w=400&h=600&fit=crop',
    cast: ['Brie Larson', 'Teyonah Parris', 'Iman Vellani'],
    isActive: true,
  },
  {
    title: 'Animal',
    description: 'A man returns to India after years abroad to reconnect with his father, unraveling dark secrets about his family.',
    genre: 'Action',
    language: 'Hindi',
    duration: '3h 21m',
    rating: 8.2,
    showTime: '2:00 PM',
    showDates: ['2024-07-18', '2024-07-19', '2024-07-20'],
    availableSeats: 45,
    totalSeats: 100,
    price: 350,
    poster: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop',
    cast: ['Ranbir Kapoor', 'Rashmika Mandanna', 'Anil Kapoor', 'Bobby Deol'],
    isActive: true,
  },
  {
    title: 'Jawan',
    description: 'A high-octane action thriller that outlines the emotional journey of a man who is driven to commit a series of crimes.',
    genre: 'Action',
    language: 'Hindi',
    duration: '2h 49m',
    rating: 8.4,
    showTime: '6:30 PM',
    showDates: ['2024-07-22', '2024-07-23', '2024-07-24'],
    availableSeats: 55,
    totalSeats: 150,
    price: 300,
    poster: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=600&fit=crop',
    cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi'],
    isActive: true,
  },
  {
    title: 'RRR',
    description: 'A fictional story about two legendary Indian revolutionaries and their journey far away from home.',
    genre: 'Action',
    language: 'Telugu',
    duration: '3h 7m',
    rating: 9.0,
    showTime: '9:00 AM',
    showDates: ['2024-07-25', '2024-07-26', '2024-07-27'],
    availableSeats: 30,
    totalSeats: 100,
    price: 250,
    poster: 'https://images.unsplash.com/photo-1554743079-b96aba34c4b2?w=400&h=600&fit=crop',
    cast: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
    isActive: true,
  },
  {
    title: 'Leo',
    description: 'A mild-mannered cafe owner with a mysterious past is pulled back into a world of danger when gangsters come calling.',
    genre: 'Action',
    language: 'Tamil',
    duration: '2h 44m',
    rating: 7.5,
    showTime: '3:30 PM',
    showDates: ['2024-07-28', '2024-07-29', '2024-07-30'],
    availableSeats: 70,
    totalSeats: 100,
    price: 280,
    poster: 'https://images.unsplash.com/photo-1523207911345-32501502db22?w=400&h=600&fit=crop',
    cast: ['Vijay', 'Trisha Krishnan', 'Sanjay Dutt'],
    isActive: true,
  },
  {
    title: 'Oppenheimer',
    description: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: 'Drama',
    language: 'English',
    duration: '3h 0m',
    rating: 9.3,
    showTime: '12:00 PM',
    showDates: ['2024-08-01', '2024-08-02', '2024-08-03'],
    availableSeats: 40,
    totalSeats: 100,
    price: 380,
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    isActive: true,
  },
  {
    title: 'Dunki',
    description: 'A heartfelt story of four friends who take the illegal immigration route (donkey flight) to reach their dreams abroad.',
    genre: 'Drama',
    language: 'Hindi',
    duration: '2h 41m',
    rating: 7.2,
    showTime: '5:00 PM',
    showDates: ['2024-08-05', '2024-08-06', '2024-08-07'],
    availableSeats: 88,
    totalSeats: 100,
    price: 270,
    poster: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    cast: ['Shah Rukh Khan', 'Taapsee Pannu', 'Vicky Kaushal'],
    isActive: true,
  },
  {
    title: 'Salaar',
    description: 'A violent man trying to keep a promise to his dying friend gets drawn into a brutal war in a savage land.',
    genre: 'Action',
    language: 'Kannada',
    duration: '2h 55m',
    rating: 7.9,
    showTime: '8:30 PM',
    showDates: ['2024-08-10', '2024-08-11', '2024-08-12'],
    availableSeats: 60,
    totalSeats: 120,
    price: 300,
    poster: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop',
    cast: ['Prabhas', 'Prithviraj Sukumaran', 'Shruthi Haasan'],
    isActive: true,
  },
  {
    title: 'Rocky Aur Rani Kii Prem Kahaani',
    description: 'An over-the-top man and an intellectual woman from different worlds fall in love and learn from each other.',
    genre: 'Romance',
    language: 'Hindi',
    duration: '2h 48m',
    rating: 7.6,
    showTime: '11:30 AM',
    showDates: ['2024-08-15', '2024-08-16', '2024-08-17'],
    availableSeats: 95,
    totalSeats: 100,
    price: 260,
    poster: 'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?w=400&h=600&fit=crop',
    cast: ['Ranveer Singh', 'Alia Bhatt', 'Dharmendra', 'Jaya Bachchan'],
    isActive: true,
  },
  {
    title: 'Pathaan',
    description: 'An exiled spy returns to India to battle a private mercenary organization led by a vengeful former agent.',
    genre: 'Action',
    language: 'Hindi',
    duration: '2h 26m',
    rating: 8.1,
    showTime: '10:30 AM',
    showDates: ['2024-08-20', '2024-08-21', '2024-08-22'],
    availableSeats: 50,
    totalSeats: 150,
    price: 320,
    poster: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=600&fit=crop',
    cast: ['Shah Rukh Khan', 'Deepika Padukone', 'John Abraham'],
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bookmyshow.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@bookmyshow.com / admin123');

    // Create regular user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    });
    console.log('👤 User created: user@example.com / user123');

    // Insert movies with exact posters (when available) from Wikipedia
    const moviesWithPosters = await addExactPosters(movies);
    await Movie.insertMany(moviesWithPosters);
    const exactPosterCount = moviesWithPosters.filter(
      (movie) => movie.poster && !movie.poster.includes('images.unsplash.com')
    ).length;
    console.log(`🎬 ${moviesWithPosters.length} movies inserted`);
    console.log(`🖼️  Exact posters added for ${exactPosterCount} movies`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin → admin@bookmyshow.com / admin123');
    console.log('   User  → user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
