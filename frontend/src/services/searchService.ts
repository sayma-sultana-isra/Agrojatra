import axios from 'axios';
import { API_BASE_URL } from './ApiEndPoint';

const API_URL = `${API_BASE_URL}/search`;

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  university?: string;
  graduation_year?: number;
  company?: string;
  position?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface SearchResults {
  students: UserProfile[];
  alumni: UserProfile[];
  employers: UserProfile[];
  companies: any[];
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const unifiedSearch = async (query: string, type: string = 'all', page: number = 1, limit: number = 10) => {
  const response = await axios.get(`${API_URL}/unified`, {
    params: { query, type, page, limit },
    ...getAuthHeader()
  });
  return response.data;
};

export const searchByRole = async (
  role: 'student' | 'alumni' | 'employer',
  params?: {
    query?: string;
    page?: number;
    limit?: number;
    skills?: string;
    location?: string;
    university?: string;
  }
) => {
  const response = await axios.get(`${API_URL}/users/${role}`, {
    params,
    ...getAuthHeader()
  });
  return response.data;
};

export const searchCompanies = async (params?: {
  query?: string;
  industry?: string;
  size?: string;
  location?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await axios.get(`${API_URL}/companies`, {
    params,
    ...getAuthHeader()
  });
  return response.data;
};
