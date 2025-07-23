/**
 * 🎨 SISTEMA DE DESIGN - TOKENS REUTILIZÁVEIS
 * 
 * Baseado no padrão otimizado da tabela de propostas
 * Garante consistência visual em todo o sistema
 */

// 📏 ESPAÇAMENTOS PADRONIZADOS
export const SPACING = {
  // Padding interno de componentes
  component: {
    xs: 'p-2',
    sm: 'p-3', 
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  },
  
  // Padding vertical (usado em células de tabela)
  vertical: {
    xs: 'py-1',
    sm: 'py-2',
    md: 'py-3', // ✅ Padrão das tabelas otimizadas
    lg: 'py-4', // ✅ Padrão dos headers
    xl: 'py-6'
  },
  
  // Padding horizontal
  horizontal: {
    xs: 'px-2',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
    xl: 'px-8'
  },
  
  // Gaps entre elementos
  gap: {
    xs: 'gap-1',
    sm: 'gap-2', // ✅ Padrão para avatares + texto
    md: 'gap-4',
    lg: 'gap-6', // ✅ Padrão para formulários
    xl: 'gap-8'
  }
} as const;

// 🎨 TIPOGRAFIA PADRONIZADA
export const TYPOGRAPHY = {
  // Tamanhos de texto
  size: {
    xs: 'text-xs',   // ✅ Badges, emails, detalhes
    sm: 'text-sm',   // ✅ Conteúdo principal das tabelas
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  },
  
  // Pesos de fonte
  weight: {
    normal: 'font-normal',
    medium: 'font-medium', // ✅ Padrão para dados importantes
    semibold: 'font-semibold', // ✅ Padrão para headers
    bold: 'font-bold'
  },
  
  // Cores de texto
  color: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground', // ✅ Para emails, detalhes
    accent: 'text-primary',
    destructive: 'text-destructive'
  }
} as const;

// 📊 COMPONENTES DE TABELA
export const TABLE = {
  // Container da tabela
  container: 'rounded-md border overflow-hidden',
  
  // Header da tabela
  header: 'bg-muted/50',
  
  // Células do header
  headerCell: `font-semibold ${SPACING.vertical.lg}`,
  
  // Linhas da tabela
  row: 'hover:bg-muted/50',
  
  // Células do corpo
  bodyCell: `${SPACING.vertical.md}`,
  
  // Larguras padrão para colunas comuns
  columnWidth: {
    id: 'w-[120px]',        // IDs, números
    date: 'w-[100px]',      // Datas
    user: 'w-[180px]',      // Usuários com avatar
    type: 'w-[140px]',      // Tipos, categorias
    content: 'min-w-[200px]', // Conteúdo principal
    year: 'w-[80px]',       // Anos, números pequenos
    value: 'w-[130px]',     // Valores monetários
    status: 'w-[120px]',    // Status badges
    actions: 'w-[60px]'     // Ações (menu)
  }
} as const;

// 🎯 COMPONENTES DE FORMULÁRIO
export const FORM = {
  // Container principal
  container: 'space-y-6',
  
  // Grid de campos
  grid: {
    single: 'grid grid-cols-1 gap-6',
    double: 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6', // ✅ Padrão otimizado
    triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
  },
  
  // Labels
  label: `${TYPOGRAPHY.weight.medium}`,

  // Headers de tabela
  tableHeader: `${TYPOGRAPHY.weight.semibold} py-4 text-center`,

  // Células de tabela
  tableCell: `py-3 text-center`,
  
  // Campos de input
  field: 'space-y-2',
  
  // Grupos de campos
  section: 'space-y-4',
  
  // Separadores
  separator: 'border-t pt-6 mt-6'
} as const;

// 🏷️ BADGES E STATUS
export const BADGE = {
  // Tamanhos
  size: {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-2.5 py-1', // ✅ Padrão das tabelas
    lg: 'text-sm px-3 py-1'
  },
  
  // Variantes de cor (baseadas no sistema existente)
  variant: {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }
} as const;

// 👤 COMPONENTES DE USUÁRIO
export const USER = {
  // Avatar
  avatar: {
    sm: 'h-6 w-6',
    md: 'h-7 w-7', // ✅ Padrão das tabelas otimizadas
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  },
  
  // Container de usuário (avatar + info)
  container: 'flex items-center gap-2',
  
  // Informações do usuário
  info: 'flex flex-col min-w-0',
  name: `${TYPOGRAPHY.size.sm} ${TYPOGRAPHY.weight.medium} truncate`,
  email: `${TYPOGRAPHY.size.xs} ${TYPOGRAPHY.color.secondary} truncate`
} as const;

// 📱 RESPONSIVIDADE
export const RESPONSIVE = {
  // Breakpoints para mostrar/ocultar colunas
  hideOnMobile: 'hidden md:table-cell',
  hideOnTablet: 'hidden lg:table-cell',
  showOnDesktop: 'hidden xl:block',
  
  // Containers responsivos
  container: 'w-full overflow-x-auto',
  maxWidth: 'max-w-7xl mx-auto'
} as const;

// 🎨 CORES CUSTOMIZADAS (complementando o sistema)
export const COLORS = {
  // Estados
  states: {
    hover: 'hover:bg-muted/50',
    active: 'bg-muted',
    disabled: 'opacity-50 pointer-events-none'
  },
  
  // Backgrounds
  background: {
    primary: 'bg-background',
    secondary: 'bg-muted/50',
    card: 'bg-card'
  }
} as const;

// 🔧 UTILITÁRIOS
export const UTILS = {
  // Truncate text
  truncate: 'truncate',
  
  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  
  // Borders
  border: 'border border-border',
  borderRadius: 'rounded-md',
  
  // Shadows
  shadow: 'shadow-sm',
  
  // Transitions
  transition: 'transition-colors duration-200'
} as const;

/**
 * 🎯 EXEMPLO DE USO:
 * 
 * // Em uma tabela:
 * <div className={TABLE.container}>
 *   <Table>
 *     <TableHeader className={TABLE.header}>
 *       <TableRow>
 *         <TableHead className={`${TABLE.columnWidth.id} ${TABLE.headerCell}`}>
 *           ID
 *         </TableHead>
 *       </TableRow>
 *     </TableHeader>
 *   </Table>
 * </div>
 * 
 * // Em um formulário:
 * <form className={FORM.container}>
 *   <div className={FORM.grid.double}>
 *     <FormField>
 *       <FormLabel className={FORM.label}>Nome</FormLabel>
 *     </FormField>
 *   </div>
 * </form>
 */
