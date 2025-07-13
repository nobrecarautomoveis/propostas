'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface Brand {
  nome: string;
  codigo: string;
}

interface Model {
  nome: string;
  codigo: number;
}

interface ModelResponse {
  modelos: Model[];
}

interface Year {
  nome: string;
  codigo: string;
}

interface VehicleDetails {
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

export default function FipeTestPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(
    null,
  );
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetSelections = (level: 'brand' | 'model' | 'year') => {
    if (level === 'brand') {
      setModels([]);
      setSelectedModel('');
    }
    if (level === 'brand' || level === 'model') {
      setYears([]);
      setSelectedYear('');
    }
    setVehicleDetails(null);
  };

  const fetchBrands = async () => {
    setIsLoading(true);
    setError(null);
    resetSelections('brand');
    setBrands([]);
    try {
      const response = await fetch(
        'https://parallelum.com.br/fipe/api/v1/carros/marcas',
      );
      if (!response.ok) throw new Error('Falha ao buscar as marcas.');
      const data: Brand[] = await response.json();
      setBrands(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModels = async (brandCode: string) => {
    if (!brandCode) return;
    setSelectedBrand(brandCode);
    setIsLoading(true);
    setError(null);
    resetSelections('brand');
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`,
      );
      if (!response.ok) throw new Error('Falha ao buscar os modelos.');
      const data: ModelResponse = await response.json();
      setModels(data.modelos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYears = async (modelCode: string) => {
    if (!modelCode || !selectedBrand) return;
    setSelectedModel(modelCode);
    setIsLoading(true);
    setError(null);
    resetSelections('model');
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${selectedBrand}/modelos/${modelCode}/anos`,
      );
      if (!response.ok) throw new Error('Falha ao buscar os anos.');
      const data: Year[] = await response.json();
      setYears(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicleDetails = async (yearCode: string) => {
    if (!yearCode || !selectedBrand || !selectedModel) return;
    setSelectedYear(yearCode);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://parallelum.com.br/fipe/api/v1/carros/marcas/${selectedBrand}/modelos/${selectedModel}/anos/${yearCode}`,
      );
      if (!response.ok) throw new Error('Falha ao buscar os detalhes do veículo.');
      const data: VehicleDetails = await response.json();
      setVehicleDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Página de Teste - API Fipe</h1>
        <p className="text-muted-foreground">
          Use esta página para testar a integração com a API da Fipe de forma segura.
        </p>
      </div>

      {/* Step 1: Fetch Brands */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium">1. Buscar Marcas de Carros</h2>
        <Button onClick={fetchBrands} disabled={isLoading}>
          {isLoading && !brands.length ? 'Buscando...' : 'Buscar Marcas de Carros'}
        </Button>
      </div>

      {error && <p className="text-red-500">Erro: {error}</p>}

      {/* Step 2: Select Brand */}
      {brands.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">2. Selecione uma Marca</h2>
          <Select onValueChange={fetchModels} value={selectedBrand} disabled={isLoading}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione uma marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.codigo} value={brand.codigo}>
                  {brand.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 3: Select Model */}
      {models.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">3. Selecione um Modelo</h2>
          <Select onValueChange={fetchYears} value={selectedModel} disabled={isLoading}>
            <SelectTrigger className="w-[480px]">
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.codigo} value={String(model.codigo)}>
                  {model.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 4: Select Year */}
      {years.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">4. Selecione o Ano</h2>
          <Select
            onValueChange={fetchVehicleDetails}
            value={selectedYear}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.codigo} value={year.codigo}>
                  {year.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 5: Display Vehicle Details */}
      {vehicleDetails && (
        <div className="space-y-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="text-2xl font-bold text-primary">
            Valor Fipe: {vehicleDetails.Valor}
          </h2>
          <p>
            <strong>Marca:</strong> {vehicleDetails.Marca}
          </p>
          <p>
            <strong>Modelo:</strong> {vehicleDetails.Modelo}
          </p>
          <p>
            <strong>Ano do Modelo:</strong> {vehicleDetails.AnoModelo}
          </p>
          <p>
            <strong>Combustível:</strong> {vehicleDetails.Combustivel}
          </p>
          <p className="text-sm text-muted-foreground">
            Mês de Referência: {vehicleDetails.MesReferencia}
          </p>
        </div>
      )}
    </div>
  );
}