export type Difficulty = "easy" | "medium" | "hard" | "championship";

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
};

export type WeatherDemo = {
  temperatureC: number;
  conditionVi: string;
  humidityPercent: number;
  windKmh: number;
};

export type CourseScoreBreakdown = {
  courseQuality: number;
  service: number;
  scenery: number;
  value: number;
};

export type GolfCourse = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  descriptionVi: string;
  addressVi: string;
  area: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  courseScore: number;
  scoreBreakdown: CourseScoreBreakdown;
  holes: number;
  par: number;
  grass: string;
  difficulty: Difficulty;
  experienceTags: string[];
  amenities: string[];
  heroImage: string;
  gallery: string[];
  basePrice: number;
  featured: boolean;
  reviews: Review[];
  weatherDemo: WeatherDemo;
};

export type TeeTimeStatus = "available" | "full";

export type TeeTime = {
  id: string;
  golfId: string;
  date: string;
  time: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  remainingSlots: number;
  status: TeeTimeStatus;
};
