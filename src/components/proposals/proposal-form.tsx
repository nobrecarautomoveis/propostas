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
import { useState } from 'react';

const formSchema = z.object({
  proposalType: z.string({ required_error: "Selecione o tipo de proposta." }),
  vehicleType: z.string({ required_error: "Selecione o tipo de veículo." }),
  isFinanced: z.boolean().default(false),
  vehicleCondition: z.enum(["new", "used"], { required_error: "Selecione a condição." }),
  plate: z.string().optional(),
  brand: z.string({ required_error: "A marca é obrigatória." }).min(2, "Mínimo 2 caracteres."),
  model: z.string({ required_error: "O modelo é obrigatório." }).min(2, "Mínimo 2 caracteres."),
  bodywork: z.string({ required_error: "A carroceria é obrigatória." }).min(2, "Mínimo 2 caracteres."),
  modelYear: z.coerce.number({ required_error: "O ano do modelo é obrigatório." }).min(1950, "Ano inválido.").max(new Date().getFullYear() + 1, "Ano inválido."),
  manufactureYear: z.coerce.number({ required_error: "O ano de fabricação é obrigatório." }).min(1950, "Ano inválido.").max(new Date().getFullYear(), "Ano inválido."),
  version: z.string({ required_error: "A versão é obrigatória." }).min(1, "A versão é obrigatória."),
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

export function ProposalForm({ onSubmit }: ProposalFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencyValue, setCurrencyValue] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFinanced: false,
      status: 'Em Análise',
      plate: '',
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(values); // Pass data to parent component
    
    toast({
      title: "Proposta Enviada!",
      description: "Sua proposta foi criada com sucesso.",
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

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);

    setCurrencyValue(formattedValue);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Row 1 */}
          <FormField control={form.control} name="proposalType" render={({ field }) => (
              <FormItem>
                  <FormLabel>Tipo de Proposta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="financing">Financiamento</SelectItem><SelectItem value="refinancing">Refinanciamento</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )}/>
          <FormField control={form.control} name="vehicleType" render={({ field }) => (
              <FormItem>
                  <FormLabel>Tipo de Veículo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <div className="flex h-10 items-center rounded-md border border-input px-3">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                    </FormControl>
                </FormItem>
            )}/>

          {/* Row 2 */}
          <FormField control={form.control} name="vehicleCondition" render={({ field }) => (
              <FormItem className="space-y-3 pt-2">
                  <FormLabel>Condição do Veículo</FormLabel>
                  <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="new" /></FormControl><FormLabel className="font-normal">Novo</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="used" /></FormControl><FormLabel className="font-normal">Usado</FormLabel></FormItem>
                      </RadioGroup>
                  </FormControl>
                  <FormMessage />
              </FormItem>
          )}/>
          <FormField control={form.control} name="plate" render={({ field }) => (<FormItem><FormLabel>Placa</FormLabel><FormControl><Input placeholder="ABC-1234" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ex: Volkswagen" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          
          {/* Row 3 */}
          <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ex: Nivus" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="bodywork" render={({ field }) => (<FormItem><FormLabel>Carroceria</FormLabel><FormControl><Input placeholder="Ex: SUV" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="version" render={({ field }) => (<FormItem><FormLabel>Versão</FormLabel><FormControl><Input placeholder="Ex: Highline" {...field} /></FormControl><FormMessage /></FormItem>)}/>

          {/* Row 4 */}
          <FormField control={form.control} name="modelYear" render={({ field }) => (<FormItem><FormLabel>Ano Modelo</FormLabel><FormControl><Input type="number" placeholder="2024" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="manufactureYear" render={({ field }) => (<FormItem><FormLabel>Ano Fabricação</FormLabel><FormControl><Input type="number" placeholder="2023" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          <FormField control={form.control} name="color" render={({ field }) => (<FormItem><FormLabel>Cor</FormLabel><FormControl><Input placeholder="Ex: Branco" {...field} /></FormControl><FormMessage /></FormItem>)}/>
          
          {/* Row 5 */}
          <FormField control={form.control} name="fuel" render={({ field }) => (
              <FormItem>
                  <FormLabel>Combustível</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="flex">Flex</SelectItem><SelectItem value="gasoline">Gasolina</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Elétrico</SelectItem><SelectItem value="hybrid">Híbrido</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )}/>
           <FormField control={form.control} name="transmission" render={({ field }) => (
              <FormItem>
                  <FormLabel>Transmissão</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="automatic">Automática</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )}/>
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

          {/* Row 6 */}
          <FormField control={form.control} name="licensingLocation" render={({ field }) => (
              <FormItem>
                  <FormLabel>Local de Licenciamento</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
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
           <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Em Análise">Em Análise</SelectItem>
                        <SelectItem value="Aprovada">Aprovada</SelectItem>
                        <SelectItem value="Recusada">Recusada</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )}/>

        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Proposta
            </Button>
        </div>
      </form>
    </Form>
  );
}
