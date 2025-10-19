import axios from 'axios';
import { API_BASE_URL } from './ApiEndPoint';

const API_URL = `${API_BASE_URL}/company-profiles`;

export interface CompanyProfile {
  id: string;
  employer_id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  founded?: number;
  headquarters: string;
  website?: string;
  logo?: string;
  cover_image?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  benefits?: string[];
  culture?: string;
  values?: string[];
  technologies?: string[];
  locations?: string[];
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  employees_count: number;
  open_positions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileInput {
  name: string;
  description: string;
  industry: string;
  size: string;
  founded?: number;
  headquarters: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  benefits?: string[];
  culture?: string;
  values?: string[];
  technologies?: string[];
  locations?: string[];
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

export const createCompanyProfile = async (data: CompanyProfileInput) => {
  const response = await axios.post(`${API_URL}`, data, getAuthHeader());
  return response.data;
};

export const getCompanyProfiles = async (params?: {
  search?: string;
  industry?: string;
  size?: string;
  location?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) => {
  const response = await axios.get(`${API_URL}`, { params });
  return response.data;
};

export const getCompanyProfile = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateCompanyProfile = async (id: string, data: Partial<CompanyProfileInput>) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

export const deleteCompanyProfile = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const getMyCompanyProfiles = async () => {
  const response = await axios.get(`${API_URL}/my/profiles`, getAuthHeader());
  return response.data;
};
