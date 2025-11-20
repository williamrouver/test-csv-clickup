# 📊 Dashboard ClickUp - Análise Operacional

Dashboard operacional completo para análise de dados exportados do ClickUp, com visualizações avançadas de produtividade, capacidade e estatísticas de projetos.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss)

## ✨ Funcionalidades Principais

### 📁 Importação e Processamento
- **Upload de CSV**: Importação simples via drag-and-drop ou seleção de arquivo
- **Mapeamento Flexível**: Configure quais colunas do CSV correspondem a cada campo
- **Parsing Inteligente**: Suporte para múltiplos formatos de tempo (`6h 8m`, `HH:MM`, decimal)
- **Validação de Dados**: Verificação automática de campos obrigatórios

### 👥 Gestão de Estagiários
- **Marcação de Estagiários**: Interface modal para marcar pessoas como estagiárias
- **Capacidade Ajustada**: Estagiários têm capacidade de 40h (ao invés de 80h)
- **Badge Visual**: Tag laranja "ESTAGIÁRIO" visível em todas as tabelas
- **Cálculo Automático**: % de utilização recalculado automaticamente

### 📈 Análise de Produtividade
- **Top 5 Performers**: Pessoas que mais concluíram tarefas
- **Menos Ativas**: Pessoas com menor utilização de capacidade
- **Horas Trabalhadas**: Análise detalhada por pessoa
- **Taxa de Conclusão**: Percentual de tarefas completadas vs planejadas
- **Ordenação Dinâmica**: Clique nos cabeçalhos das tabelas para ordenar

### 🎯 Análise de Capacidade
- **Comparação de Capacidade**: 80h para funcionários, 40h para estagiários
- **% de Utilização**: Indicador visual com cores (verde/amarelo/vermelho)
- **Detalhamento por Pessoa**: Tabelas com horas trabalhadas vs capacidade
- **Gráficos Interativos**: Visualização de capacidade em barras

### 📊 Análise de Projetos
- **% de Conclusão**: Por projeto com código de cores
- **Filtro por Projeto**: Filtre todos os dashboards por um projeto específico
- **Status de Tarefas**: Detalhamento completo por projeto
- **Pessoas por Projeto**: Veja quem trabalhou em cada projeto

### ⏱️ Estimado vs Real
- **Comparação de Horas**: Tempo estimado vs tempo real trabalhado
- **% de Desvio**: Indicador de precisão nas estimativas
- **Análise de Tendências**: Identifique padrões de subestimação/superestimação

### 🎨 Interface e Experiência
- **Dark Mode**: Tema escuro completo com toggle no header
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Gráficos Interativos**: Tooltips, legendas e hover effects
- **Interface Moderna**: Componentes shadcn/ui + Tailwind CSS

## 🚀 Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|-----------|--------|-----------|
| **React** | 18.3 | Framework frontend |
| **TypeScript** | 5.6 | Type safety |
| **Vite** | 5.4 | Build tool e dev server |
| **Tailwind CSS** | 3.4 | Estilização |
| **shadcn/ui** | Latest | Biblioteca de componentes |
| **Recharts** | 2.12 | Visualização de dados |
| **PapaParse** | 5.4 | Parse de CSV |
| **Lucide React** | Latest | Ícones |

## 📦 Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>

# Entre no diretório
cd clickup-dashboard

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🎯 Como Usar

### 1. Exportar Dados do ClickUp

1. No ClickUp, navegue até sua lista/projeto
2. Clique nos três pontos (⋮) no canto superior direito
3. Selecione **Export** → **CSV**
4. Baixe o arquivo CSV gerado

### 2. Importar CSV no Dashboard

1. **Arraste e solte** o arquivo CSV na área de upload, ou
2. Clique em **"Selecionar arquivo"** para escolher manualmente

### 3. Mapear Colunas

Configure o mapeamento entre as colunas do seu CSV e os campos do dashboard:

#### Campos Obrigatórios:
- **👤 Responsável**: Quem está trabalhando na tarefa
- **⏱️ Horas**: Tempo gasto/logado na tarefa
- **✅ Status**: Status da tarefa (detecta: complete, concluído, done, fechado, closed, accepted)

#### Campos Opcionais:
- **📁 Projeto**: Nome do projeto (ou use Tags como alternativa)
- **🏷️ Tags**: Tags da tarefa (usado como projeto se Projeto não estiver mapeado)
- **📅 Data**: Data da tarefa
- **📝 Nome da Tarefa**: Título/descrição da tarefa
- **🎯 Horas Estimadas**: Tempo estimado (para análise de desvio)

### 4. Configurar Estagiários

1. No canto superior direito, clique em **"Gerenciar Estagiários"**
2. Marque os checkboxes das pessoas que são estagiárias
3. Clique em **"Salvar Alterações"**
4. As tags "ESTAGIÁRIO" aparecerão automaticamente em todas as tabelas
5. A capacidade será ajustada de 80h para 40h

### 5. Explorar o Dashboard

Navegue pelas abas disponíveis:

#### 📋 Visão Geral
- Cards de resumo (Total de Horas, Tarefas, Pessoas Ativas)
- Top 5 Performers
- 5 Pessoas Menos Ativas
- Gráfico de conclusão por projeto

#### 👥 Pessoas
- Gráfico de atividades por pessoa
- Tabela detalhada com ordenação
- Horas totais, tarefas completas, taxa de conclusão

#### 📊 Projetos
- Gráfico de % de conclusão
- Tabela com todos os projetos
- Total de tarefas e status

#### 🎯 Capacidade
- Gráfico de % de utilização
- Comparação com capacidade padrão (80h ou 40h para estagiários)
- Indicadores visuais de capacidade

#### ⏱️ Estimado vs Real
- Comparação entre horas estimadas e reais
- % de desvio
- Identificação de padrões

### 6. Filtrar por Projeto

1. Use o **Filtro de Projeto** no topo do dashboard
2. Selecione um projeto específico
3. **Todos** os dashboards serão filtrados automaticamente
4. Clique em **"Limpar Filtro"** para voltar à visualização completa

### 7. Alternar Dark Mode

- Clique no ícone **☀️/🌙** no canto superior direito
- O tema será salvo no localStorage

## 📂 Estrutura do Projeto

```
clickup-dashboard/
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   ├── charts/                # Componentes de gráficos
│   │   │   ├── PersonActivityChart.tsx
│   │   │   ├── CapacityChart.tsx
│   │   │   ├── ProjectCompletionChart.tsx
│   │   │   └── EstimatedVsActualChart.tsx
│   │   ├── FileUpload.tsx         # Upload de CSV
│   │   ├── ColumnMapper.tsx       # Mapeamento de colunas
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── InternManager.tsx      # Gestão de estagiários
│   │   └── InternBadge.tsx        # Badge visual de estagiário
│   ├── lib/
│   │   ├── csv-parser.ts          # Parse e cálculos
│   │   └── utils.ts               # Funções utilitárias
│   ├── types/
│   │   └── index.ts               # Definições TypeScript
│   ├── App.tsx                    # Componente raiz
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais + Tailwind
├── public/                        # Arquivos estáticos
├── package.json                   # Dependências
├── tsconfig.json                  # Configuração TypeScript
├── tailwind.config.js             # Configuração Tailwind
└── vite.config.ts                 # Configuração Vite
```

## ⚙️ Configurações

### Capacidade Padrão

A aplicação usa as seguintes capacidades de referência:

- **Funcionários Normais**: 80 horas por sprint de 15 dias
- **Estagiários**: 40 horas por sprint de 15 dias

Você pode ajustar esses valores em `src/lib/csv-parser.ts`:

```typescript
const getCapacity = (personName: string) => {
  const capacity = internNames.has(personName) ? 40 : 80; // Ajuste aqui
  return (capacity / 15) * sprintDays;
};
```

### Status de Conclusão

Os seguintes status são considerados como "concluído":
- complete
- concluído
- done
- fechado
- closed
- accepted

Você pode adicionar mais em `src/lib/csv-parser.ts`:

```typescript
const isCompleted = status.includes('complete') ||
                   status.includes('concluído') ||
                   status.includes('done') ||
                   status.includes('fechado') ||
                   status.includes('closed') ||
                   status.includes('accepted');
```

### Formatos de Tempo Suportados

O parser aceita os seguintes formatos para horas:

- **Formato brasileiro**: `6h 8m` ou `6h` ou `8m`
- **Formato HH:MM**: `6:30`
- **Formato decimal**: `6.5` ou `6,5`

## 🎨 Temas e Customização

### Dark Mode

O dark mode já vem configurado com cores otimizadas:

- **Fundo**: Preto puro (#000000)
- **Cards**: Cinza escuro (#1a1a1a)
- **Bordas**: Cinza médio (#333333)
- **Texto**: Branco/cinza claro
- **Gráficos**: Ajustados automaticamente

Personalize as cores em `src/index.css`:

```css
.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 98%;
  --card: 0 0% 10%;
  /* ... */
}
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Lint do código
npm run lint
```

### Adicionar Novos Componentes shadcn/ui

```bash
npx shadcn@latest add <component-name>
```

## 📊 Tipos de Dados

### PersonStats

```typescript
interface PersonStats {
  name: string;
  totalHours: number;
  estimatedHours: number;
  tasksCompleted: number;
  totalTasks: number;
  capacityUsage: number; // percentage
  isIntern?: boolean;    // Marca se é estagiário
}
```

### ProjectStats

```typescript
interface ProjectStats {
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  estimatedHours: number;
  actualHours: number;
}
```

## 🐛 Troubleshooting

### CSV não está sendo processado
- Verifique se o arquivo é um CSV válido
- Confirme que todas as colunas obrigatórias estão mapeadas
- Verifique o console do navegador para erros

### Horas aparecem como 0
- Certifique-se de que a coluna de horas está no formato correto
- Formatos aceitos: `6h 8m`, `6:30`, `6.5`

### Dark mode não funciona
- Verifique se o localStorage está habilitado
- Limpe o cache do navegador
- Verifique se a classe `dark` está sendo aplicada no `<html>`

### Filtro de projeto não atualiza
- Recarregue a página
- Clique em "Limpar Filtro" e tente novamente

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Recharts](https://recharts.org/) - Biblioteca de gráficos
- [Lucide](https://lucide.dev/) - Ícones
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

Desenvolvido com ❤️ para análise de dados do ClickUp
