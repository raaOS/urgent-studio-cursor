import axios, { AxiosInstance, AxiosResponse } from "axios";

const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL ?? "http://localhost:3000/api",
  timeout: 5000,
});

export default httpClient;

export async function get<T>(url: string): Promise<AxiosResponse<T>> {
  return httpClient.get<T>(url);
}