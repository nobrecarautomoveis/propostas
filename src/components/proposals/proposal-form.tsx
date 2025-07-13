'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchBrands, fetchModels, fetchYears, fetchVehicleDetails, Brand, Model, Year, VehicleDetails } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const formSchema = z.object({
  proposalType: z.string({ required_error: "Selecione o tipo de proposta." }),
  vehicleType: z.string({ required_error: "Selecione o tipo de veículo." }),
  isFinanced: z.boolean().default(false),
  vehicleCondition: z.enum(["new", "used"], { required_error: "Selecione a condição." }),
  plate: z.string().optional(),
  brand: z.string({ required_error: "A marca é obrigatória." }),
  brandName: z.string().optional(),
  model: z.string({ required_error: "O modelo é obrigatório." }),
  modelName: z.string().optional(),
  bodywork: z.string().optional(),
  modelYear: z.string({ required_error: "O ano do modelo é obrigatório." }),
  manufactureYear: z.coerce.number({ required_error: "O ano de fabricação é obrigatório." }),
  version: z.string().optional(),
  fuel: z.string({ required_error: "Selecione o combustível." }),
  transmission: z.string({ required_error: "Selecione a transmissão." }),
  color: z.string({ required_error: "A cor é obrigatória." }).min(2, "Mínimo 2 caracteres."),
  value: z.coerce.number({ required_error: "O valor é obrigatório." }).positive("O valor deve ser positivo."),
  licensingLocation: z.string({ required_error: "Selecione o estado." }),
  status: z.enum(['Em Análise', 'Aprovada', 'Recusada'], { required_error: "Selecione o status da proposta." }),
  state: z.string().optional(), // Adding state to schema
}).superRefine((data, ctx) => {
    if (data.vehicleCondition === 'used' && (!data.plate || data.plate.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['plate'],
            message: 'A placa é obrigatória para veículos usados.',
        });
    }
});

export type ProposalFormData = z.infer<typeof formSchema>;

type ProposalFormProps = {
  onSubmit: (data: ProposalFormData) => void;
  initialData?: ProposalFormData;
};

const brazilianStates = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
];

export function ProposalForm({ onSubmit, initialData }: ProposalFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencyValue, setCurrencyValue] = useState('');

  // FIPE API States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [fipeDetails, setFipeDetails] = useState<VehicleDetails | null>(null);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingFipe, setIsLoadingFipe] = useState(false);
  const [yearCodeFipe, setYearCodeFipe] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      proposalType: '',
      vehicleType: '',
      isFinanced: false,
      vehicleCondition: 'new',
      plate: '',
      brand: '',
      brandName: '',
      model: '',
      modelName: '',
      bodywork: '',
      modelYear: new Date().getFullYear().toString(), // Converter para string
      manufactureYear: new Date().getFullYear(), // Manter como número para o schema
      version: '',
      fuel: '',
      transmission: '',
      color: '',
      value: 0,
      licensingLocation: '',
      status: 'Em Análise',
      state: '',
    },
  });

  const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      if (initialData.value) {
        setCurrencyValue(formatCurrency(initialData.value));
      }
      setBrandName(initialData.brandName || null);
      setModelName(initialData.modelName || null);
      
      // Definir yearCodeFipe se temos modelYear nos dados iniciais
      if (initialData.modelYear) {
        setYearCodeFipe(initialData.modelYear);
      }
      
      // Carregar dados da API FIPE se necessário
      if (initialData.vehicleType && initialData.brand) {
        const vehicleTypeMap = { car: 'carros', motorcycle: 'motos', truck: 'caminhoes' };
        if (vehicleTypeMap[initialData.vehicleType as keyof typeof vehicleTypeMap]) {
          // Carregar marcas
          fetchBrands(vehicleTypeMap[initialData.vehicleType as keyof typeof vehicleTypeMap])
            .then(data => {
              setBrands(data);
              const selectedBrand = data.find(b => b.codigo === initialData.brand);
              if (selectedBrand) {
                setBrandName(selectedBrand.nome);
              }
            });
          
          // Carregar modelos se temos a marca
          if (initialData.model) {
            fetchModels(vehicleTypeMap[initialData.vehicleType as keyof typeof vehicleTypeMap], initialData.brand)
              .then(data => {
                setModels(data);
                const selectedModel = data.find(m => String(m.codigo) === initialData.model);
                if (selectedModel) {
                  setModelName(selectedModel.nome);
                }
              });
          }
          
          // Carregar anos se temos modelo
          if (initialData.model) {
            fetchYears(vehicleTypeMap[initialData.vehicleType as keyof typeof vehicleTypeMap], initialData.brand, initialData.model)
              .then(data => {
                setYears(data);
              });
          }
        }
      }
    }
  }, [initialData, form]);

  const vehicleType = form.watch('vehicleType');
  const brandCode = form.watch('brand');
  const modelCode = form.watch('model');
  const yearCode = form.watch('modelYear'); // Changed from manufactureYear

  // Fetch Brands
  useEffect(() => {
    if (vehicleType && (vehicleType === 'car' || vehicleType === 'motorcycle' || vehicleType === 'truck')) {
      const vehicleTypeMap = { car: 'carros', motorcycle: 'motos', truck: 'caminhoes' };
      setIsLoadingBrands(true);
      fetchBrands(vehicleTypeMap[vehicleType as keyof typeof vehicleTypeMap])
        .then(data => setBrands(data))
        .catch(err => toast({ title: 'Erro FIPE', description: 'Não foi possível buscar as marcas.', variant: 'destructive' }))
        .finally(() => setIsLoadingBrands(false));
      
      // Só limpar os campos se não estivermos editando uma proposta existente
      if (!initialData) {
        form.setValue('brand', '');
        form.setValue('model', '');
        // Removido: form.setValue('manufactureYear', ''); - não limpar o ano de fabricação
        setModels([]);
        setYears([]);
        setFipeDetails(null);
      }
    }
  }, [vehicleType, form, toast, initialData]);

  // Fetch Models
  useEffect(() => {
    if (brandCode && vehicleType && (vehicleType === 'car' || vehicleType === 'motorcycle' || vehicleType === 'truck')) {
      const vehicleTypeMap = { car: 'carros', motorcycle: 'motos', truck: 'caminhoes' };
      setIsLoadingModels(true);
      fetchModels(vehicleTypeMap[vehicleType as keyof typeof vehicleTypeMap], brandCode)
        .then(data => {
          setModels(data)
          if (initialData?.model) {
            const selectedModel = data.find(m => String(m.codigo) === initialData.model);
            if (selectedModel) {
              setModelName(selectedModel.nome);
            }
          }
        })
        .catch(err => toast({ title: 'Erro FIPE', description: 'Não foi possível buscar os modelos.', variant: 'destructive' }))
        .finally(() => setIsLoadingModels(false));
    } else {
      // Só limpar se não estivermos editando
      if (!initialData) {
        setModels([]);
        setModelName(null);
      }
    }
  }, [brandCode, vehicleType, toast, initialData]);

  // Fetch Years
  useEffect(() => {
    if (modelCode && brandCode && vehicleType && (vehicleType === 'car' || vehicleType === 'motorcycle' || vehicleType === 'truck')) {
      const vehicleTypeMap = { car: 'carros', motorcycle: 'motos', truck: 'caminhoes' };
      setIsLoadingYears(true);
      fetchYears(vehicleTypeMap[vehicleType as keyof typeof vehicleTypeMap], brandCode, modelCode)
        .then(data => {
          setYears(data);
          // Preservar o valor do modelYear se estivermos editando
          if (initialData && initialData.modelYear) {
            // Não limpar o modelYear durante a edição
          } else {
            form.setValue('modelYear', '');
          }
        })
        .catch(err => toast({ title: 'Erro FIPE', description: 'Não foi possível buscar os anos.', variant: 'destructive' }))
        .finally(() => setIsLoadingYears(false));
      
      // Só limpar fipeDetails se não estivermos editando
      if (!initialData) {
        setFipeDetails(null);
      }
    }
  }, [modelCode, brandCode, vehicleType, form, toast, initialData]);

  // Fetch FIPE Details
  useEffect(() => {
    if (yearCodeFipe && modelCode && brandCode && vehicleType && (vehicleType === 'car' || vehicleType === 'motorcycle' || vehicleType === 'truck')) {
      const vehicleTypeMap = { car: 'carros', motorcycle: 'motos', truck: 'caminhoes' };
      setIsLoadingFipe(true);
      fetchVehicleDetails(vehicleTypeMap[vehicleType as keyof typeof vehicleTypeMap], brandCode, modelCode, yearCodeFipe)
        .then(data => setFipeDetails(data))
        .catch(err => toast({ title: 'Erro FIPE', description: 'Não foi possível buscar os detalhes do veículo.', variant: 'destructive' }))
        .finally(() => setIsLoadingFipe(false));
    }
  }, [yearCodeFipe, modelCode, brandCode, vehicleType, toast]);

  const generateYearOptions = () => {
    const currentYear = 2026;
    const years = [];
    for (let year = currentYear; year >= 1980; year--) {
      years.push({ value: year, label: String(year) });
    }
    return years;
  };

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    // Garantir que modelName e brandName sejam capturados corretamente
    const selectedModel = models.find(m => String(m.codigo) === values.model);
    const selectedBrand = brands.find(b => b.codigo === values.brand);

    const submissionValues: ProposalFormData = {
      ...values,
      brandName: selectedBrand?.nome || brandName || '',
      modelName: selectedModel?.nome || modelName || '',
    };

    onSubmit(submissionValues);

    toast({
      title: `Proposta ${initialData ? 'Atualizada' : 'Enviada'}!`,
      description: `Sua proposta foi ${initialData ? 'atualizada' : 'criada'} com sucesso.`,
    });
    
    setIsSubmitting(false);
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setCurrencyValue('');
      form.setValue('value', 0);
      return;
    }

    const numericValue = parseFloat(rawValue) / 100;
    form.setValue('value', numericValue, { shouldValidate: true });

    const formattedValue = formatCurrency(numericValue);
    setCurrencyValue(formattedValue);
  };


  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="proposalType" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Tipo de Proposta</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="financing">Financiamento</SelectItem><SelectItem value="refinancing">Refinanciamento</SelectItem></SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="vehicleType" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Tipo de Veículo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="car">Carro</SelectItem>
                              <SelectItem value="motorcycle">Moto</SelectItem>
                              <SelectItem value="bus">Ônibus</SelectItem>
                              <SelectItem value="truck">Caminhão</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="isFinanced" render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                    <FormLabel className="mb-2">Veículo já financiado?</FormLabel>
                    <FormControl>
                        <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2">
                            <span className="text-sm mr-auto">{field.value ? 'Sim' : 'Não'}</span>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="vehicleCondition" render={({ field }) => (
                  <FormItem className="space-y-3 pt-2">
                      <FormLabel>Condição do Veículo</FormLabel>
                      <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="new" /></FormControl><FormLabel className="font-normal">Novo</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="used" /></FormControl><FormLabel className="font-normal">Usado</FormLabel></FormItem>
                          </RadioGroup>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="plate" render={({ field }) => (<FormItem><FormLabel>Placa</FormLabel><FormControl><Input placeholder="ABC-1234" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedBrand = brands.find(b => b.codigo === value);
                            setBrandName(selectedBrand ? selectedBrand.nome : null);
                          }}
                          value={field.value} 
                          disabled={isLoadingBrands || brands.length === 0}
                      >
                          <FormControl><SelectTrigger>
                              {isLoadingBrands && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              <SelectValue placeholder="Selecione a marca..." />
                          </SelectTrigger></FormControl>
                          <SelectContent>
                              {brands.map(brand => <SelectItem key={brand.codigo} value={brand.codigo}>{brand.nome}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedModel = models.find(m => m.codigo === value);
                            setModelName(selectedModel ? selectedModel.nome : null);
                          }}
                          value={field.value} 
                          disabled={isLoadingModels || models.length === 0}
                      >
                          <FormControl><SelectTrigger>
                              {isLoadingModels && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              <SelectValue placeholder="Selecione o modelo..." />
                          </SelectTrigger></FormControl>
                          <SelectContent>
                              {models.map(model => <SelectItem key={model.codigo} value={String(model.codigo)}>{model.nome}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              {/* Movido: Ano Modelo logo após Modelo */}
              <FormField control={form.control} name="modelYear" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Ano Modelo</FormLabel>
                      <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setYearCodeFipe(value);
                          }}
                          value={field.value || ""} 
                          disabled={isLoadingYears || years.length === 0}
                      >
                          <FormControl><SelectTrigger>
                              {isLoadingYears && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              <SelectValue placeholder="Selecione o ano..." />
                          </SelectTrigger></FormControl>
                          <SelectContent>
                              {years.map(year => <SelectItem key={year.codigo} value={year.codigo}>{year.nome}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="bodywork" render={({ field }) => (<FormItem><FormLabel>Carroceria (opcional)</FormLabel><FormControl><Input placeholder="Ex: SUV" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="manufactureYear" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Ano Fabricação</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o ano..." /></SelectTrigger></FormControl>
                          <SelectContent>
                              {generateYearOptions().map(year => <SelectItem key={year.value} value={String(year.value)}>{year.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="version" render={({ field }) => (<FormItem><FormLabel>Versão (opcional)</FormLabel><FormControl><Input placeholder="Ex: Highline" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="fuel" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Combustível</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="flex">Flex</SelectItem><SelectItem value="gasoline">Gasolina</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Elétrico</SelectItem><SelectItem value="hybrid">Híbrido</SelectItem></SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
               <FormField control={form.control} name="transmission" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Transmissão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="automatic">Automática</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="cvt">CVT</SelectItem>
                              <SelectItem value="automated">Automatizada</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="color" render={({ field }) => (<FormItem><FormLabel>Cor</FormLabel><FormControl><Input placeholder="Ex: Preto" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Veículo</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={currencyValue}
                      onChange={handleCurrencyChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="licensingLocation" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Local de Licenciamento</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o estado..." /></SelectTrigger></FormControl>
                           <SelectContent>
                            {brazilianStates.map(state => (
                              <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
              {/* Movido: Status ao lado do Local de Licenciamento */}
              <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status..." /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="Em Análise">Em Análise</SelectItem><SelectItem value="Aprovada">Aprovada</SelectItem><SelectItem value="Recusada">Recusada</SelectItem></SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}/>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                {initialData ? 'Atualizar Proposta' : 'Enviar Proposta'}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Informações FIPE */}
        {(isLoadingFipe || fipeDetails) && (
          <div className="mt-6">
            {isLoadingFipe && <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Buscando valor FIPE...</div>}
            {fipeDetails && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Valor de Referência (Tabela FIPE)</AlertTitle>
                  <AlertDescription>
                    O valor de referência para o veículo {fipeDetails.Marca} {fipeDetails.Modelo} - {fipeDetails.AnoModelo} ({fipeDetails.Combustivel}) é de <strong>{fipeDetails.Valor}</strong> (Mês de referência: {fipeDetails.MesReferencia}).
                  </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </>
    );
  }
