import api from './api';
import { Details, Save, UserDisease } from '../interfaces/user.disease';
import { AxiosResponse } from 'axios';
import { Disease } from '../interfaces/disease';
const baseUrl = '/userDisease';

type DeleteResponse = Record<string, string>;

export async function getUserDiseases(id: string): Promise<AxiosResponse<UserDisease[]>> {
  const response = await api.get(`${baseUrl}/${id}`);
  return response;
}

export async function getUnrecordedDiseases(id: string): Promise<AxiosResponse<Disease[]>> {
  const response = await api.get(`${baseUrl}/unrecordedDiseases/${id}`);
  return response;
}

export async function getById(id: string): Promise<AxiosResponse<Details>> {
  const response = await api.get(`${baseUrl}/details/${id}`);
  return response;
}

export async function saveMany(userDiseases: Save[]): Promise<AxiosResponse<Save[]>> {
  const response = await api.post(`${baseUrl}/saveMany`, userDiseases);
  return response;
}

export async function deleteMany(userDiseases: string[]): Promise<AxiosResponse<DeleteResponse[]>> {
  const response = await api.delete(`${baseUrl}`, {
    data: userDiseases,
  });
  return response;
}

export async function deleteDisease(diseaseId: string): Promise<AxiosResponse<DeleteResponse>> {
  const response = await api.delete(`${baseUrl}/${diseaseId}`);
  return response;
}
