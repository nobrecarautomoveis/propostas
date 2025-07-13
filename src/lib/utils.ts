import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FIPE API UTILS

export interface Brand {
  nome: string;
  codigo: string;
}

export interface Model {
  nome: string;
  codigo: number;
}

interface ModelResponse {
  modelos: Model[];
}

export interface Year {
  nome: string;
  codigo: string;
}

export interface VehicleDetails {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

const FIPE_API_BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

export const fetchBrands = async (vehicleType: 'carros' | 'motos' | 'caminhoes'): Promise<Brand[]> => {
  const response = await fetch(`${FIPE_API_BASE_URL}/${vehicleType}/marcas`);
  if (!response.ok) {
    throw new Error('Falha ao buscar as marcas.');
  }
  return response.json();
};

export const fetchModels = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandCode: string
): Promise<Model[]> => {
  const response = await fetch(
    `${FIPE_API_BASE_URL}/${vehicleType}/marcas/${brandCode}/modelos`,
  );
  if (!response.ok) {
    throw new Error('Falha ao buscar os modelos.');
  }
  const data: ModelResponse = await response.json();
  return data.modelos;
};

export const fetchYears = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandCode: string,
  modelCode: string
): Promise<Year[]> => {
  const response = await fetch(
    `${FIPE_API_BASE_URL}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos`,
  );
  if (!response.ok) {
    throw new Error('Falha ao buscar os anos.');
  }
  return response.json();
};

export const fetchVehicleDetails = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandCode: string,
  modelCode: string,
  yearCode: string
): Promise<VehicleDetails> => {
  const response = await fetch(
    `${FIPE_API_BASE_URL}/${vehicleType}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`,
  );
  if (!response.ok) {
    throw new Error('Falha ao buscar os detalhes do veículo.');
  }
  return response.json();
};
