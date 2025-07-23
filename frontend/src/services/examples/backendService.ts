// Menggunakan import absolut untuk menghindari masalah resolusi modul
import httpClient from "../examples/httpClient";

export interface BackendResponse<T> {
  data: T;
  status: number;
}

export async function fetchData<T>(endpoint: string): Promise<BackendResponse<T>> {
  const response = await httpClient.get<T>(endpoint);
  return {
    data: response.data,
    status: response.status,
  };
}