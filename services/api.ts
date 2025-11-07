// services/api.ts

// This file simulates a backend API using localStorage.
// Each function is async and has a delay to mimic network latency.

import { DailyLog, ProfileData, User, WeightEntry, ActivityLevel, FitnessGoal, AuthResponse } from '../types';

const API_LATENCY = 400; // ms

const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, API_LATENCY);
  });
};

// --- Mock Database Helper ---
const db = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }
};

const userKey = (key: string, username: string) => `${key}_${username}`;

// --- Auth API ---

export const apiLogin = async (username: string): Promise<AuthResponse> => {
  const users = db.get<Record<string, {}>>('users', {});
  if (users[username]) {
    const user = { username };
    db.set('currentUser', user);
    return simulateApiCall({ success: true, user });
  }
  return simulateApiCall({ success: false, user: null, error: 'USER_NOT_FOUND' });
};

export const apiSignup = async (username: string): Promise<AuthResponse> => {
    const users = db.get<Record<string, {}>>('users', {});
    if (users[username]) {
        // User already exists
        return simulateApiCall({ success: false, user: null, error: 'USERNAME_TAKEN' });
    }
    users[username] = {}; // Store user (in real app, with hashed password)
    db.set('users', users);
    
    // Also log them in
    const user = { username };
    db.set('currentUser', user);
    return simulateApiCall({ success: true, user });
};

export const apiLogout = async (): Promise<void> => {
    localStorage.removeItem('currentUser');
    return simulateApiCall(undefined);
};

export const apiCheckCurrentUser = async (): Promise<User | null> => {
    const user = db.get<User | null>('currentUser', null);
    return simulateApiCall(user);
};

// --- Data API ---

export interface UserData {
    profile: ProfileData;
    dailyLog: DailyLog;
    waterIntake: number;
    weightLog: WeightEntry[];
}

const initialProfile: ProfileData = {
  age: 30,
  gender: 'male',
  height: 180,
  weight: 75,
  goalWeight: 72,
  activityLevel: ActivityLevel.ModeratelyActive,
  goal: FitnessGoal.Maintain,
  goalType: 'auto',
};

const initialDailyLog: DailyLog = { 'Breakfast': [], 'Lunch': [], 'Dinner': [], 'Snacks': [] };

export const apiFetchUserData = async (username: string): Promise<UserData> => {
    const profile = db.get(userKey('profile', username), initialProfile);
    const dailyLog = db.get(userKey('dailyLog', username), initialDailyLog);
    const waterIntake = db.get(userKey('waterIntake', username), 0);
    const weightLog = db.get(userKey('weightLog', username), []);
    
    return simulateApiCall({ profile, dailyLog, waterIntake, weightLog });
};

export const apiUpdateProfile = async (username: string, profile: ProfileData): Promise<ProfileData> => {
    db.set(userKey('profile', username), profile);
    return simulateApiCall(profile);
};

export const apiUpdateDailyLog = async (username: string, dailyLog: DailyLog): Promise<DailyLog> => {
    db.set(userKey('dailyLog', username), dailyLog);
    return simulateApiCall(dailyLog);
};

export const apiUpdateWaterIntake = async (username:string, waterIntake: number): Promise<number> => {
    db.set(userKey('waterIntake', username), waterIntake);
    return simulateApiCall(waterIntake);
};

export const apiUpdateWeightLog = async (username: string, weightLog: WeightEntry[]): Promise<WeightEntry[]> => {
    db.set(userKey('weightLog', username), weightLog);
    return simulateApiCall(weightLog);
};