# Dashboard ClickUp

Dashboard operacional para análise de dados exportados do ClickUp, com visualizações de produtividade, capacidade e estatísticas de projetos.

## Funcionalidades

- **Upload de CSV**: Importação de arquivos CSV exportados do ClickUp
- **Mapeamento Flexível**: Configure quais colunas do CSV correspondem a cada campo
- **Análise de Produtividade**:
  - Top performers e pessoas menos ativas
  - Horas trabalhadas por pessoa
  - Taxa de conclusão de tarefas
- **Análise de Capacidade**:
  - Comparação com capacidade padrão (80h por sprint de 15 dias)
  - % de utilização de capacidade por pessoa
- **Análise de Projetos**:
  - % de conclusão por projeto
  - Status de tarefas por projeto
- **Visualizações com Gráficos**:
  - Gráficos de barras interativos
  - Tabelas detalhadas
  - Interface moderna com shadcn/ui

## Stack Tecnológica

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **CSV Parser**: PapaParse
- **Icons**: Lucide React

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Como Usar

1. **Exportar dados do ClickUp**:
   - No ClickUp, vá para sua lista/projeto
   - Clique nos três pontos (menu)
   - Selecione "Export" > "CSV"
   - Baixe o arquivo CSV

2. **Upload do CSV**:
   - Arraste e solte o arquivo CSV na área de upload
   - Ou clique em "Selecionar arquivo"

3. **Mapear Colunas**:
   - Selecione quais colunas do seu CSV correspondem a:
     - **Responsável** (obrigatório): Quem está trabalhando na tarefa
     - **Horas** (obrigatório): Tempo gasto na tarefa
     - **Status** (obrigatório): Status da tarefa (completo, em andamento, etc.)
     - **Projeto** (opcional): Nome do projeto
     - **Tags** (opcional): Tags da tarefa (usado como projeto se campo Projeto não estiver mapeado)
     - **Data** (opcional): Data da tarefa
     - **Nome da Tarefa** (opcional): Título da tarefa

4. **Visualizar Dashboard**:
   - Navegue pelas diferentes abas:
     - **Visão Geral**: Cards de resumo e top performers
     - **Pessoas**: Análise detalhada por colaborador
     - **Projetos**: Status de conclusão de cada projeto
     - **Capacidade**: Análise de utilização de capacidade

## Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── charts/             # Componentes de gráficos
│   │   ├── FileUpload.tsx      # Upload de CSV
│   │   ├── ColumnMapper.tsx    # Mapeamento de colunas
│   │   └── Dashboard.tsx       # Dashboard principal
│   ├── lib/
│   │   ├── csv-parser.ts       # Lógica de parsing e cálculos
│   │   └── utils.ts            # Utilitários
│   ├── types/
│   │   └── index.ts            # Definições de tipos
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Entrada da aplicação
│   └── index.css               # Estilos globais
├── public/                     # Arquivos estáticos
└── package.json                # Dependências
```

## Capacidade Padrão

A aplicação usa como referência **80 horas por sprint de 15 dias** por pessoa para calcular a % de utilização da capacidade. Este valor pode ser ajustado no código em `src/lib/csv-parser.ts`.

## Desenvolvimento

O projeto foi desenvolvido com:
- **TypeScript** para type safety
- **shadcn/ui** para componentes de UI consistentes e acessíveis
- **Tailwind CSS** para estilização rápida e responsiva
- **Recharts** para visualizações de dados interativas

## Licença

MIT
