# 🎨 Sistema de Design - Propostas

## 📋 Visão Geral

Este documento descreve o **Sistema de Design** padronizado aplicado em todo o sistema de propostas, garantindo **consistência visual** e **experiência de usuário** uniforme.

## 🎯 Princípios de Design

### ✅ Consistência
- **Espaçamentos** padronizados em todos os componentes
- **Tipografia** uniforme com hierarquia clara
- **Cores** baseadas no sistema de tokens

### ✅ Usabilidade
- **Navegação** intuitiva e previsível
- **Feedback visual** claro para ações do usuário
- **Responsividade** em todos os dispositivos

### ✅ Acessibilidade
- **Contraste** adequado entre texto e fundo
- **Tamanhos** de toque apropriados para mobile
- **Hierarquia** visual clara

## 🎨 Tokens de Design

### 📏 Espaçamentos
```typescript
// Padding interno de componentes
component: { xs: 'p-2', sm: 'p-3', md: 'p-4', lg: 'p-6', xl: 'p-8' }

// Padding vertical (tabelas)
vertical: { xs: 'py-1', sm: 'py-2', md: 'py-3', lg: 'py-4', xl: 'py-6' }

// Gaps entre elementos
gap: { xs: 'gap-1', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' }
```

### 🎨 Tipografia
```typescript
// Tamanhos
size: { xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg' }

// Pesos
weight: { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold' }

// Cores
color: { primary: 'text-foreground', secondary: 'text-muted-foreground' }
```

## 📊 Componentes Padronizados

### 🗂️ Tabelas
- **Container**: `rounded-md border overflow-hidden`
- **Header**: `bg-muted/50` com `font-semibold py-4`
- **Linhas**: `hover:bg-muted/50` com `py-3`
- **Larguras**: Definidas por tipo de conteúdo

### 📝 Formulários
- **Container**: `space-y-6`
- **Grid**: `grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6`
- **Labels**: `font-semibold`

### 👤 Usuários
- **Avatar**: `h-7 w-7 rounded-full bg-primary/10`
- **Container**: `flex items-center gap-2`
- **Nome**: `text-sm font-medium`
- **Email**: `text-xs text-muted-foreground`

### 🏷️ Badges
- **Tamanho**: `text-xs px-2.5 py-1`
- **Cores**: Baseadas no sistema de variantes

## 🎯 Padrões de Uso

### ✅ Tabelas
```tsx
<div className="rounded-md border overflow-hidden">
  <Table>
    <TableHeader className="bg-muted/50">
      <TableRow>
        <TableHead className="w-[120px] font-semibold py-4">
          Coluna
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="py-3">Conteúdo</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### ✅ Formulários
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
    <FormField>
      <FormLabel className="font-semibold">Campo</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
    </FormField>
  </div>
</form>
```

### ✅ Usuário
```tsx
<div className="flex items-center gap-2">
  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
    <span className="text-xs font-medium text-primary">U</span>
  </div>
  <div className="flex flex-col min-w-0">
    <span className="text-sm font-medium truncate">Nome</span>
    <span className="text-xs text-muted-foreground truncate">email@exemplo.com</span>
  </div>
</div>
```

## 📱 Responsividade

### 🖥️ Desktop (lg+)
- **Todas as colunas** visíveis
- **Espaçamento** completo
- **Sidebar** sempre visível

### 💻 Tablet (md+)
- **Colunas secundárias** ocultas (`hidden md:table-cell`)
- **Layout** adaptado
- **Sidebar** colapsável

### 📱 Mobile
- **Colunas essenciais** apenas
- **Padding** reduzido
- **Sidebar** em overlay

## 🎨 Cores do Sistema

### 🎯 Principais
- **Primary**: `hsl(199 85% 45%)` - Azul claro (#A7D9ED)
- **Background**: `hsl(0 0% 98%)` - Branco suave (#F9F9F9)
- **Accent**: `hsl(120 60% 45%)` - Verde (#90EE90)

### 🎯 Estados
- **Hover**: `hover:bg-muted/50`
- **Active**: `bg-primary/10`
- **Disabled**: `opacity-50`

## 🔧 Ferramentas

### 📁 Arquivos Principais
- `src/lib/design-tokens.ts` - Tokens de design
- `src/components/ui/enhanced-table.tsx` - Componente de tabela
- `src/app/globals.css` - Variáveis CSS

### 🎯 Componentes Base
- **shadcn/ui** - Componentes base
- **Tailwind CSS** - Utilitários de estilo
- **Lucide Icons** - Ícones

## 📈 Benefícios Alcançados

### ✅ Para Usuários
- **Experiência consistente** em todo o sistema
- **Navegação intuitiva** e previsível
- **Interface profissional** e polida

### ✅ Para Desenvolvedores
- **Manutenibilidade** facilitada
- **Componentes reutilizáveis**
- **Padrões claros** para novos recursos

### ✅ Para o Sistema
- **Performance** otimizada
- **Escalabilidade** garantida
- **Consistência** visual mantida

## 🚀 Próximos Passos

1. **Documentar** novos componentes seguindo os padrões
2. **Testar** responsividade em diferentes dispositivos
3. **Validar** acessibilidade com ferramentas apropriadas
4. **Expandir** sistema para novos módulos

---

**🎯 Sistema implementado com sucesso seguindo metodologia combinada de respeito à integridade do sistema e aplicação gradual de melhorias!**
