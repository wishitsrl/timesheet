import { apiClient } from './apiClient';
import { Bando, PaginatedBandi } from '../interfaces/models';

export const getBandiAll = async (
  token: string,
  params?: Record<string, any>
): Promise<PaginatedBandi> => {
  try {
    const response = await apiClient.get<PaginatedBandi>('/bandi/allBandiList', {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bandi:', error);
    throw error;
  }
};

export const getBandoById = async (token: string, id: string): Promise<Bando> => {
  try {
    const response = await apiClient.get<Bando>(`/bandi/list/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bando:', error);
    throw error;
  }
};

export const createBando = async (token: string, bando: Partial<Bando>): Promise<Bando> => {
  try {
    const response = await apiClient.post<Bando>('/bandi/add', bando, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating bando:', error);
    throw error;
  }
};

export const updateBando = async (token: string, id: string, bando: Partial<Bando>): Promise<Bando> => {
  try {
    console.log(id)
    const response = await apiClient.put<Bando>(`/bandi/update/${id}`, bando, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating bando:', error);
    throw error;
  }
};

export const deleteBando = async (token: string, id: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(`/bandi/bando/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting bando:', error);
    throw error;
  }
};


import axios from "axios";
const AI_URL = "http://localhost:3002";

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await axios.post(`${AI_URL}/embed`, { text });
    return res.data.embedding;
  } catch (err: any) {
    console.error("Errore servizio AI:", err.message);
    throw new Error("Errore servizio AI");
  }
}

export async function semanticQuery(query: string, top_k = 5) {
  try {
    const res = await axios.post(`${AI_URL}/search`, { query, top_k });
          console.log(res)
    return res.data.results;
  } catch (err: any) {
    console.error("Errore query semantica AI:", err.message);
    throw new Error("Errore query semantica AI");
  }
}




export interface UserProfile {
  settore?: string;
  budget_min?: number;
  budget_max?: number;
  aree_interesse?: string[];
  enti_preferiti?: string[];
}

export interface CompanyProfile {
  settore: string;
  fatturato?: number;
  numero_dipendenti?: number;
  regioni_operazione?: string[];
  tipo_ente?: string[];
  budget_min?: number;
  budget_max?: number;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
  user_profile?: UserProfile;
  company_profile?: CompanyProfile;
}

export async function searchCombined(req: QueryRequest) {
  try {
    const res = await axios.post(`${AI_URL}/search-combined`, req);
    return res.data.results;
  } catch (err: any) {
    console.error("Errore query combinata AI:", err.message);
    throw new Error("Errore query combinata AI");
  }
}