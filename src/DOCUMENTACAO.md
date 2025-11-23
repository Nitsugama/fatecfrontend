# 📚 Documentação do Projeto GameRent

## 🎯 Visão Geral

**GameRent** é um protótipo de site para aluguel de jogos de cartas e tabuleiro. Este é um projeto **100% frontend**, desenvolvido com React e TypeScript, sem necessidade de banco de dados ou backend.

---

## 🚀 Como Abrir o Projeto no VS Code

### Opção 1: Se você está usando o Figma Make

O projeto já está pronto e rodando! Você pode editá-lo diretamente aqui.

### Opção 2: Para rodar localmente no seu computador

1. **Copie todos os arquivos** deste projeto para uma pasta no seu computador

2. **Abra o VS Code** e selecione a pasta do projeto:
   - File → Open Folder → Selecione a pasta do projeto

3. **Instale as dependências** (se necessário):
   ```bash
   npm install
   ```

4. **Execute o projeto**:
   ```bash
   npm run dev
   ```

5. **Abra no navegador**:
   - O terminal mostrará um endereço (geralmente `http://localhost:5173`)
   - Abra esse endereço no seu navegador

---

## 💾 Banco de Dados - IMPORTANTE!

### ❌ Não há banco de dados neste projeto!

Este é um **protótipo frontend** que simula toda a funcionalidade usando:

- **Estado do React** (variáveis com `useState`)
- **Dados mockados** (arrays de objetos JavaScript)
- **Armazenamento temporário** (tudo se perde ao recarregar a página)

### 📊 Onde estão os dados?

Todos os dados estão no arquivo `/App.tsx`:

```typescript
// Dados dos jogos (linha 41)
export const gamesData: Game[] = [
  {
    id: '1',
    name: 'Magic: The Gathering',
    // ... mais dados
  },
  // ... mais jogos
];

// Dados de reservas (linha 181)
const [reservations, setReservations] = useState<Reservation[]>([]);
```

### 🔄 Como os dados funcionam?

1. **Jogos**: Array fixo com 6 jogos pré-cadastrados
2. **Reservas**: Array vazio que é preenchido quando o usuário faz reservas
3. **Login**: Não há validação real - qualquer credencial funciona
4. **Datas indisponíveis**: Simuladas no arquivo `/components/CalendarPage.tsx` (linha 43)

---

## 🏗️ Estrutura do Projeto

```
/
├── App.tsx                          # Componente principal (gerencia todo o estado)
├── components/
│   ├── Header.tsx                   # Cabeçalho com navegação
│   ├── Footer.tsx                   # Rodapé com contatos
│   ├── HomePage.tsx                 # Página inicial (catálogo)
│   ├── GameCard.tsx                 # Card de cada jogo
│   ├── GameDetailsPage.tsx          # Página de detalhes do jogo
│   ├── LoginDialog.tsx              # Modal de login/registro
│   ├── CalendarPage.tsx             # Página de calendário
│   ├── ReservationManagement.tsx    # Gerenciamento de reservas
│   └── ui/                          # Componentes ShadCN (não mexer)
├── styles/
│   └── globals.css                  # Estilos globais
└── DOCUMENTACAO.md                  # Este arquivo
```

---

## 📝 Fluxo da Aplicação

### 1️⃣ Usuário não logado

```
Página Inicial → Clica em um jogo → Página de Detalhes → Clica "Alugar"
                                                            ↓
                                                    Modal de Login
```

### 2️⃣ Usuário faz login

```
Modal de Login → Preenche dados → Clica "Entrar" → Login simulado
                                                         ↓
                                                  Calendário
```

### 3️⃣ Usuário seleciona data

```
Calendário → Seleciona data disponível → Clica "Confirmar" → Reserva criada
                                                                    ↓
                                                          Página de Reservas
```

### 4️⃣ Usuário gerencia reserva

```
Página de Reservas → Pode editar data OU cancelar reserva
```

---

## 🔧 Como Modificar o Projeto

### ➕ Adicionar um novo jogo

Abra o arquivo `/App.tsx` e adicione um novo objeto ao array `gamesData` (linha 41):

```typescript
export const gamesData: Game[] = [
  // ... jogos existentes
  {
    id: '7',  // ID único
    name: 'Seu Jogo Novo',
    category: 'Categoria do Jogo',
    summary: 'Resumo curto',
    price: 30.00,
    images: [
      'URL_DA_IMAGEM'
    ],
    description: 'Descrição completa do jogo',
    howToPlay: 'Como se joga',
    rules: [
      'Regra 1',
      'Regra 2',
      'Regra 3'
    ],
    players: '2-4 jogadores',
    duration: '45-60 minutos'
  }
];
```

### 🎨 Alterar cores do site

As cores principais estão em `/styles/globals.css`. Procure por:

```css
/* Cores principais */
--indigo-600: #4f46e5;  /* Cor primária (azul) */
--slate-900: #0f172a;   /* Cor escura (quase preto) */
--slate-50: #f8fafc;    /* Cor de fundo clara */
```

Você pode usar ferramentas como [Tailwind Color Generator](https://uicolors.app/) para gerar novas paletas.

### 📧 Alterar informações de contato

Abra o arquivo `/components/Footer.tsx` e modifique:

```typescript
<span>contato@gamerent.com.br</span>  // Linha 30
<span>(11) 98765-4321</span>          // Linha 34
```

### 📅 Adicionar/remover datas indisponíveis

Abra `/components/CalendarPage.tsx` e modifique o array `unavailableDates` (linha 43):

```typescript
const unavailableDates = [
  new Date(2025, 10, 16),  // Mês é 0-indexado! 10 = Novembro
  new Date(2025, 10, 17),
  // Adicione mais datas aqui
];
```

**ATENÇÃO**: Em JavaScript, os meses começam em 0:
- 0 = Janeiro
- 1 = Fevereiro
- ...
- 10 = Novembro
- 11 = Dezembro

---

## 🎓 Conceitos Importantes do React

### 1. Estados (useState)

Estados são variáveis que, quando mudam, fazem o React re-renderizar a tela:

```typescript
const [valor, setValor] = useState(valorInicial);

// Para ler:
console.log(valor);

// Para modificar:
setValor(novoValor);
```

### 2. Renderização Condicional

Mostra ou esconde elementos baseado em condições:

```typescript
{condicao && <Componente />}  // Mostra se condicao for true

{condicao ? <ComponenteA /> : <ComponenteB />}  // If/else
```

### 3. Map para Listas

Transforma arrays em elementos React:

```typescript
{jogos.map((jogo) => (
  <Card key={jogo.id}>  {/* key é obrigatória! */}
    {jogo.name}
  </Card>
))}
```

### 4. Props (Propriedades)

Dados passados de um componente pai para filho:

```typescript
// Componente pai
<GameCard game={jogo} onClick={funcao} />

// Componente filho
function GameCard({ game, onClick }) {
  return <div onClick={onClick}>{game.name}</div>
}
```

---

## 🐛 Problemas Comuns

### ❌ "Cannot read property 'map' of undefined"

**Problema**: Tentando fazer `.map()` em algo que não existe.

**Solução**: Adicione verificação:
```typescript
{array && array.map(...)}
```

### ❌ "Each child should have a unique key prop"

**Problema**: Faltou adicionar `key` em uma lista.

**Solução**: Adicione `key` única:
```typescript
{items.map(item => <div key={item.id}>...</div>)}
```

### ❌ A página recarrega e perde os dados

**Isso é normal!** Este projeto não tem backend. Para persistir dados, você precisaria:
- Adicionar `localStorage` (armazenamento local do navegador)
- OU conectar a um banco de dados (Firebase, Supabase, etc)

### ❌ As imagens não aparecem

**Problema**: URLs das imagens podem estar quebradas.

**Solução**: Substitua as URLs no `gamesData` por URLs válidas do Unsplash ou outras fontes.

---

## 🎯 Próximos Passos para Tornar Real

Se você quiser transformar este protótipo em um sistema real, precisará:

### 1. Backend e Autenticação

- [ ] Criar API REST ou GraphQL
- [ ] Sistema de autenticação real (JWT, OAuth)
- [ ] Validação de e-mail
- [ ] Criptografia de senhas (bcrypt)

### 2. Banco de Dados

Opções populares:
- **Firebase** (Google) - Fácil para iniciantes
- **Supabase** - PostgreSQL como serviço
- **MongoDB** - NoSQL
- **PostgreSQL** - SQL tradicional

Estrutura de tabelas sugerida:

```sql
-- Tabela de usuários
users (
  id,
  username,
  email,
  password_hash,
  created_at
)

-- Tabela de jogos
games (
  id,
  name,
  category,
  description,
  price,
  ...
)

-- Tabela de reservas
reservations (
  id,
  user_id,
  game_id,
  date,
  status,
  created_at
)
```

### 3. Funcionalidades Adicionais

- [ ] Sistema de pagamento (Stripe, PayPal)
- [ ] Notificações por e-mail
- [ ] Calendário sincronizado com Google Calendar
- [ ] Avaliações e comentários dos jogos
- [ ] Sistema de pontos/fidelidade
- [ ] Painel administrativo
- [ ] Relatórios e estatísticas

### 4. Deploy (Colocar no ar)

Opções gratuitas para começar:
- **Vercel** - Perfeito para React
- **Netlify** - Alternativa ao Vercel
- **GitHub Pages** - Gratuito mas limitado

---

## 📚 Recursos para Aprender Mais

### React
- [Documentação Oficial do React](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Tailwind CSS
- [Documentação Tailwind](https://tailwindcss.com/docs)

### ShadCN/UI (componentes usados)
- [Documentação ShadCN](https://ui.shadcn.com/)

---

## 💡 Dicas de Boas Práticas

### ✅ Faça

- Sempre adicione `key` única em listas
- Use nomes descritivos para variáveis e funções
- Comente código complexo
- Separe componentes grandes em componentes menores
- Use TypeScript para evitar bugs

### ❌ Evite

- Modificar state diretamente (sempre use `setState`)
- Criar funções dentro do JSX (defina antes)
- Ignorar warnings do console
- Copiar e colar muito código (crie componentes reutilizáveis)

---

## 🤝 Suporte

Se tiver dúvidas sobre o código:

1. Leia os comentários no código - estão bem detalhados!
2. Procure no arquivo específico usando Ctrl+F
3. Consulte a documentação do React/TypeScript
4. Experimente modificar e ver o que acontece (não tenha medo!)

---

## 📄 Licença

Este é um projeto de estudo/protótipo. Use e modifique como quiser!

---

**Criado com ❤️ para aprendizado e desenvolvimento**
