// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

// Theme types
export interface ThemeColors {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  neutral: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  background: Record<string, string>;
  text: Record<string, string>;
  border: Record<string, string>;
}

// Component props types
export interface BaseComponentProps {
  style?: any;
  testID?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar' | 'isVerified'>;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// types/events.ts

export type EventType = "in_person" | "online";

/**
 * Shape used by EventCard (list screen)
 */
export type CardEvent = {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;

  address?: string;
  city?: string;
  state?: string;
  country?: string;

  startDate?: string | Date | null;
  endDate?: string | Date | null;
  event_date?: string | Date | null;

  ticketLink?: string;
  ticketPrice?: number | string;
  promoCode?: string;
  totalSpots?: number | null;

  isFeatured?: boolean;

  flyer?: any; // { uri: string } | require(...)
};

/**
 * Shape used by EventDetail screen
 */
export type DetailEvent = {
  id: string | number;
  title: string;
  description?: string;
  city?: string;
  address?: string;
  startDate?: string | Date | null;
  ticketLink?: string;
  promoCode?: string;
  image?: any; // { uri: string } | require(...)
};
