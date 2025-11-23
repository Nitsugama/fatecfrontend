# 🗄️ Guia Completo de Integração com Banco de Dados Real

## 📋 Índice

1. [Introdução](#introdução)
2. [Comparação de Bancos de Dados](#comparação)
3. [Opção 1: Supabase (Recomendado)](#supabase)
4. [Opção 2: Firebase](#firebase)
5. [Opção 3: MongoDB Atlas](#mongodb)
6. [Estrutura de Dados](#estrutura)
7. [Migração do Código](#migração)
8. [Deploy](#deploy)

---

## 🎯 Introdução

Este guia vai transformar seu protótipo em um **sistema real com banco de dados**, onde:

✅ **Usuários são reais** - Cadastro, login, autenticação
✅ **Jogos são reais** - Armazenados no banco, podem ser adicionados/editados
✅ **Reservas são persistentes** - Não somem ao recarregar
✅ **Múltiplos usuários** - Cada um vê suas próprias reservas
✅ **Seguro** - Senhas criptografadas, autenticação real

---

<a name="comparação"></a>
## 📊 Comparação de Bancos de Dados

| Característica | Supabase ⭐ | Firebase | MongoDB Atlas |
|----------------|------------|----------|---------------|
| **Dificuldade** | ⭐⭐ Média | ⭐ Fácil | ⭐⭐⭐ Difícil |
| **Tipo** | PostgreSQL (SQL) | NoSQL | NoSQL |
| **Plano Grátis** | ✅ Sim (500MB) | ✅ Sim (1GB) | ✅ Sim (512MB) |
| **Autenticação** | ✅ Integrada | ✅ Integrada | ❌ Manual |
| **Painel Admin** | ✅ Excelente | ✅ Bom | ✅ Bom |
| **SQL Queries** | ✅ Sim | ❌ Não | ❌ Não |
| **Tempo Real** | ✅ Sim | ✅ Sim | ⚠️ Com Config |
| **Open Source** | ✅ Sim | ❌ Não | ⚠️ Parcial |
| **Ideal Para** | Projetos sérios | MVPs rápidos | Apps escaláveis |

### 🏆 **Recomendação: SUPABASE**

**Por quê?**
- ✅ SQL completo (mais profissional)
- ✅ Painel visual para gerenciar dados
- ✅ Autenticação integrada
- ✅ APIs geradas automaticamente
- ✅ Open source
- ✅ Plano grátis generoso
- ✅ Boa documentação em português

---

<a name="supabase"></a>
## 🚀 Opção 1: Supabase (RECOMENDADO)

### Passo 1: Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub)
4. Clique em "New Project"
5. Preencha:
   - **Name**: gamerent
   - **Database Password**: (escolha uma senha forte)
   - **Region**: South America (São Paulo)
6. Clique em "Create new project" e aguarde 2-3 minutos

### Passo 2: Criar Tabelas no Banco

No painel do Supabase:

1. Vá em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **New Query**
3. Cole o código abaixo:

```sql
-- ============================================================================
-- TABELA DE USUÁRIOS
-- ============================================================================
-- Nota: Supabase já cria a tabela auth.users automaticamente
-- Vamos criar uma tabela profiles para dados adicionais

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita Row Level Security (segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver todos os perfis
CREATE POLICY "Perfis públicos são visíveis para todos"
  ON public.profiles FOR SELECT
  USING (true);

-- Política: usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- TABELA DE JOGOS
-- ============================================================================

CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  how_to_play TEXT,
  rules JSONB, -- Array de regras em formato JSON
  price DECIMAL(10,2) NOT NULL,
  images JSONB, -- Array de URLs das imagens
  players TEXT,
  duration TEXT,
  available BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ver jogos
CREATE POLICY "Jogos são visíveis para todos"
  ON public.games FOR SELECT
  USING (true);

-- Política: apenas admins podem inserir/atualizar jogos (configurar depois)
-- CREATE POLICY "Apenas admins podem modificar jogos"
--   ON public.games FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- TABELA DE RESERVAS
-- ============================================================================

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  reservation_date DATE NOT NULL,
  return_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Política: usuários veem apenas suas próprias reservas
CREATE POLICY "Usuários veem apenas suas reservas"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem criar suas próprias reservas
CREATE POLICY "Usuários podem criar reservas"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias reservas
CREATE POLICY "Usuários podem atualizar suas reservas"
  ON public.reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNÇÃO: Criar perfil automaticamente quando usuário se registra
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: executar função quando novo usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INSERIR JOGOS INICIAIS
-- ============================================================================

INSERT INTO public.games (name, category, summary, description, how_to_play, rules, price, images, players, duration) VALUES
(
  'Magic: The Gathering',
  'Jogo de Cartas',
  'O icônico jogo de cartas colecionáveis onde você é um poderoso mago.',
  'Magic: The Gathering é um jogo de cartas colecionáveis estratégico onde os jogadores assumem o papel de poderosos magos chamados Planeswalkers.',
  'Cada jogador começa com 20 pontos de vida e usa um deck de cartas. Invoque criaturas, lance feitiços e use artefatos para reduzir a vida do oponente a zero.',
  '["Cada jogador começa com 20 pontos de vida", "Compre 7 cartas iniciais", "Jogue uma terra por turno", "Invoque criaturas pagando seu custo de mana", "Ataque com suas criaturas", "Use feitiços e habilidades estrategicamente"]',
  25.00,
  '["https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=800", "https://images.unsplash.com/photo-1607124964194-8d9e8c4f7a93?w=800"]',
  '2 jogadores',
  '30-60 minutos'
),
(
  'UNO',
  'Jogo de Cartas',
  'O clássico jogo de cartas que todos conhecem e amam.',
  'UNO é um jogo de cartas americano que é jogado com um baralho especialmente impresso.',
  'O objetivo é ser o primeiro jogador a descartar todas as suas cartas. Combine cores ou números com a carta do topo da pilha de descarte.',
  '["Combine por cor ou número", "Use cartas especiais para mudar o jogo", "Grite UNO quando tiver apenas uma carta", "O primeiro a ficar sem cartas vence"]',
  15.00,
  '["https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800"]',
  '2-10 jogadores',
  '15-30 minutos'
),
(
  'Xadrez',
  'Jogo de Tabuleiro',
  'O jogo de estratégia milenar que desafia sua mente.',
  'Xadrez é um jogo de tabuleiro estratégico para dois jogadores, jogado em um tabuleiro quadriculado de 64 casas.',
  'Cada jogador começa com 16 peças. O objetivo é dar xeque-mate no rei adversário. Cada tipo de peça se move de forma diferente.',
  '["Peão move 1 casa para frente", "Torre move em linha reta", "Bispo move na diagonal", "Cavalo move em L", "Rainha move em qualquer direção", "Rei move 1 casa em qualquer direção", "Dê xeque-mate no rei adversário para vencer"]',
  20.00,
  '["https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800", "https://images.unsplash.com/photo-1611195974226-fafc95a1d6c0?w=800"]',
  '2 jogadores',
  '30-90 minutos'
),
(
  'Banco Imobiliário',
  'Jogo de Tabuleiro',
  'Compre, venda e negocie propriedades neste clássico jogo de negócios.',
  'Banco Imobiliário é um jogo de tabuleiro que simula compra e venda de propriedades.',
  'Role os dados e mova seu peão pelo tabuleiro. Compre propriedades, construa casas e hotéis, e cobre aluguel dos outros jogadores.',
  '["Role os dados e mova seu peão", "Compre propriedades disponíveis", "Construa casas e hotéis", "Cobre aluguel de outros jogadores", "Negocie propriedades", "Não fique sem dinheiro!"]',
  35.00,
  '["https://images.unsplash.com/photo-1592642704632-8ee7c7f23d7c?w=800"]',
  '2-8 jogadores',
  '60-180 minutos'
),
(
  'Catan',
  'Jogo de Tabuleiro',
  'Colonize a ilha de Catan e construa seu império.',
  'Em Catan, os jogadores tentam ser o senhor dominante da ilha de Catan construindo assentamentos e cidades.',
  'Colete recursos (madeira, tijolo, trigo, ovelha, minério), construa estradas, assentamentos e cidades, e negocie com outros jogadores.',
  '["Colete recursos rolando dados", "Construa estradas e assentamentos", "Negocie recursos com outros jogadores", "Expanda seu território", "Primeiro a 10 pontos de vitória vence"]',
  40.00,
  '["https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800", "https://images.unsplash.com/photo-1609026804615-34d12f46f370?w=800"]',
  '3-4 jogadores',
  '60-120 minutos'
),
(
  'Exploding Kittens',
  'Jogo de Cartas',
  'Um jogo de cartas estratégico altamente explosivo para toda a família.',
  'Exploding Kittens é um jogo de cartas para pessoas que gostam de gatinhos, explosões e lasers.',
  'Compre cartas até pegar um Exploding Kitten. Use cartas especiais para evitar explodir. Último jogador vivo vence.',
  '["Compre 1 carta por turno", "Use cartas de ação estrategicamente", "Evite pegar Exploding Kittens", "Use Defuse para desarmar gatinhos explosivos", "Último jogador não explodido vence"]',
  30.00,
  '["https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800"]',
  '2-5 jogadores',
  '15 minutos'
);
```

4. Clique em **RUN** (ou Ctrl+Enter)
5. Você verá "Success. No rows returned" - Está correto!

### Passo 3: Instalar Supabase no Projeto

No terminal do VS Code:

```bash
npm install @supabase/supabase-js
```

### Passo 4: Obter Credenciais

No painel do Supabase:

1. Vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** key (chave pública)

### Passo 5: Criar Arquivo de Configuração

Crie o arquivo `/src/lib/supabase.ts`:

```typescript
// ============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Substitua pelos seus valores do painel Supabase
const supabaseUrl = 'https://SEU_PROJETO.supabase.co';
const supabaseAnonKey = 'SUA_CHAVE_PUBLICA_AQUI';

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TIPOS/INTERFACES DO BANCO DE DADOS
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          avatar_url?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          category: string;
          summary: string | null;
          description: string | null;
          how_to_play: string | null;
          rules: string[] | null;
          price: number;
          images: string[] | null;
          players: string | null;
          duration: string | null;
          available: boolean;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category: string;
          price: number;
          summary?: string;
          description?: string;
          how_to_play?: string;
          rules?: string[];
          images?: string[];
          players?: string;
          duration?: string;
          available?: boolean;
          stock?: number;
        };
        Update: {
          name?: string;
          category?: string;
          price?: number;
          summary?: string;
          description?: string;
          how_to_play?: string;
          rules?: string[];
          images?: string[];
          players?: string;
          duration?: string;
          available?: boolean;
          stock?: number;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          reservation_date: string;
          return_date: string | null;
          status: 'active' | 'completed' | 'cancelled';
          total_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          game_id: string;
          reservation_date: string;
          return_date?: string;
          status?: 'active' | 'completed' | 'cancelled';
          total_price?: number;
        };
        Update: {
          reservation_date?: string;
          return_date?: string;
          status?: 'active' | 'completed' | 'cancelled';
          total_price?: number;
        };
      };
    };
  };
}
```

### Passo 6: Criar Hooks de Autenticação

Crie o arquivo `/src/hooks/useAuth.ts`:

```typescript
// ============================================================================
// HOOK DE AUTENTICAÇÃO
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Função de Login
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  /**
   * Função de Registro
   */
  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  /**
   * Função de Logout
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
```

### Passo 7: Criar Hooks para Jogos

Crie o arquivo `/src/hooks/useGames.ts`:

```typescript
// ============================================================================
// HOOK PARA JOGOS
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Game {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  how_to_play: string;
  rules: string[];
  price: number;
  images: string[];
  players: string;
  duration: string;
  available: boolean;
  stock: number;
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Busca todos os jogos do banco de dados
   */
  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('available', true)
        .order('name');

      if (error) throw error;

      setGames(data as Game[]);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca um jogo específico por ID
   */
  const getGameById = async (id: string) => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Game;
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return {
    games,
    loading,
    error,
    refetch: fetchGames,
    getGameById,
  };
}
```

### Passo 8: Criar Hooks para Reservas

Crie o arquivo `/src/hooks/useReservations.ts`:

```typescript
// ============================================================================
// HOOK PARA RESERVAS
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Reservation {
  id: string;
  user_id: string;
  game_id: string;
  reservation_date: string;
  return_date: string | null;
  status: 'active' | 'completed' | 'cancelled';
  total_price: number;
  created_at: string;
  // Dados do jogo (via JOIN)
  game?: {
    name: string;
    price: number;
  };
}

export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Busca reservas do usuário logado
   */
  const fetchReservations = async () => {
    if (!user) {
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          game:games(name, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReservations(data as any);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao buscar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria uma nova reserva
   */
  const createReservation = async (gameId: string, date: Date) => {
    if (!user) throw new Error('Usuário não autenticado');

    // Busca o preço do jogo
    const { data: game } = await supabase
      .from('games')
      .select('price')
      .eq('id', gameId)
      .single();

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: user.id,
        game_id: gameId,
        reservation_date: date.toISOString().split('T')[0],
        total_price: game?.price || 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Atualiza a lista local
    await fetchReservations();

    return data;
  };

  /**
   * Atualiza a data de uma reserva
   */
  const updateReservationDate = async (reservationId: string, newDate: Date) => {
    const { error } = await supabase
      .from('reservations')
      .update({
        reservation_date: newDate.toISOString().split('T')[0],
      })
      .eq('id', reservationId);

    if (error) throw error;

    // Atualiza a lista local
    await fetchReservations();
  };

  /**
   * Cancela uma reserva
   */
  const cancelReservation = async (reservationId: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);

    if (error) throw error;

    // Atualiza a lista local
    await fetchReservations();
  };

  /**
   * Busca datas indisponíveis para um jogo específico
   */
  const getUnavailableDates = async (gameId: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .select('reservation_date')
      .eq('game_id', gameId)
      .eq('status', 'active');

    if (error) throw error;

    return data.map(r => new Date(r.reservation_date));
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservationDate,
    cancelReservation,
    getUnavailableDates,
    refetch: fetchReservations,
  };
}
```

### Passo 9: Modificar App.tsx

Agora modifique o `/App.tsx` para usar os dados reais:

```typescript
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { GameDetailsPage } from './components/GameDetailsPage';
import { CalendarPage } from './components/CalendarPage';
import { ReservationManagement } from './components/ReservationManagement';
import { LoginDialog } from './components/LoginDialog';
import { useAuth } from './hooks/useAuth';
import { useGames } from './hooks/useGames';
import { useReservations } from './hooks/useReservations';
import { useState } from 'react';

function App() {
  // ===== HOOKS DE DADOS REAIS =====
  const { user, signIn, signUp, signOut } = useAuth();
  const { games, loading: gamesLoading } = useGames();
  const { 
    reservations, 
    createReservation, 
    updateReservationDate, 
    cancelReservation 
  } = useReservations();

  // ===== ESTADOS DE NAVEGAÇÃO =====
  const [currentPage, setCurrentPage] = useState<'home' | 'game' | 'calendar' | 'reservations'>('home');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingGameForRent, setPendingGameForRent] = useState<any>(null);

  // ===== HANDLERS =====
  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setCurrentPage('game');
  };

  const handleRentClick = (game: any) => {
    if (!user) {
      setPendingGameForRent(game);
      setShowLoginDialog(true);
    } else {
      setSelectedGame(game);
      setCurrentPage('calendar');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setShowLoginDialog(false);
      
      if (pendingGameForRent) {
        setSelectedGame(pendingGameForRent);
        setCurrentPage('calendar');
        setPendingGameForRent(null);
      }
    } catch (error: any) {
      alert('Erro ao fazer login: ' + error.message);
    }
  };

  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      await signUp(email, password, username, username);
      setShowLoginDialog(false);
      alert('Conta criada! Verifique seu e-mail para confirmar.');
      
      if (pendingGameForRent) {
        setSelectedGame(pendingGameForRent);
        setCurrentPage('calendar');
        setPendingGameForRent(null);
      }
    } catch (error: any) {
      alert('Erro ao criar conta: ' + error.message);
    }
  };

  const handleDateSelect = async (date: Date) => {
    if (selectedGame) {
      try {
        await createReservation(selectedGame.id, date);
        setCurrentPage('reservations');
      } catch (error: any) {
        alert('Erro ao criar reserva: ' + error.message);
      }
    }
  };

  const handleUpdateReservation = async (reservationId: string, newDate: Date) => {
    try {
      await updateReservationDate(reservationId, newDate);
    } catch (error: any) {
      alert('Erro ao atualizar reserva: ' + error.message);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation(reservationId);
    } catch (error: any) {
      alert('Erro ao cancelar reserva: ' + error.message);
    }
  };

  // ===== LOADING =====
  if (gamesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // ===== RENDERIZAÇÃO =====
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        isLoggedIn={!!user}
        onLoginClick={() => setShowLoginDialog(true)}
        onLogout={signOut}
        onNavigateHome={() => setCurrentPage('home')}
        onNavigateReservations={() => setCurrentPage('reservations')}
        hasReservations={reservations.some(r => r.status === 'active')}
      />
      
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage games={games} onGameSelect={handleGameSelect} />
        )}
        
        {currentPage === 'game' && selectedGame && (
          <GameDetailsPage 
            game={selectedGame} 
            onRentClick={() => handleRentClick(selectedGame)}
            onBack={() => setCurrentPage('home')}
          />
        )}
        
        {currentPage === 'calendar' && selectedGame && (
          <CalendarPage 
            game={selectedGame}
            onDateSelect={handleDateSelect}
            onBack={() => setCurrentPage('game')}
          />
        )}
        
        {currentPage === 'reservations' && (
          <ReservationManagement 
            reservations={reservations.map(r => ({
              id: r.id,
              gameId: r.game_id,
              gameName: r.game?.name || '',
              date: new Date(r.reservation_date),
              status: r.status
            }))}
            onUpdateReservation={handleUpdateReservation}
            onCancelReservation={handleCancelReservation}
            onBack={() => setCurrentPage('home')}
          />
        )}
      </main>
      
      <Footer />
      
      <LoginDialog 
        open={showLoginDialog}
        onClose={() => {
          setShowLoginDialog(false);
          setPendingGameForRent(null);
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}

export default App;
```

### Passo 10: Atualizar LoginDialog

Modifique `/components/LoginDialog.tsx` para aceitar e-mail:

```typescript
// Linha do formulário de login - trocar username por email
<Input
  id="login-email"
  type="email"
  placeholder="Digite seu e-mail"
  value={loginEmail}
  onChange={(e) => setLoginEmail(e.target.value)}
  required
/>

// Linha do formulário de registro - adicionar campo username
<Input
  id="register-username"
  type="text"
  placeholder="Escolha um nome de usuário"
  value={registerUsername}
  onChange={(e) => setRegisterUsername(e.target.value)}
  required
/>
```

### ✅ Pronto! Seu Sistema está com Banco de Dados Real!

**O que mudou:**
- ✅ Usuários reais com autenticação
- ✅ Jogos vindos do banco de dados
- ✅ Reservas persistentes
- ✅ Cada usuário vê apenas suas reservas
- ✅ Senhas seguras (Supabase cuida disso)

---

<a name="firebase"></a>
## 🔥 Opção 2: Firebase

### Passo 1: Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nome: "gamerent"
4. Desative Analytics (opcional)
5. Clique em "Criar projeto"

### Passo 2: Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Em "Provedores de login", habilite **E-mail/senha**
4. Salve

### Passo 3: Configurar Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste"
4. Escolha localização: **southamerica-east1**
5. Clique em "Ativar"

### Passo 4: Instalar Firebase

```bash
npm install firebase
```

### Passo 5: Obter Configuração

1. Clique no ícone de engrenagem > **Configurações do projeto**
2. Role até "Seus apps"
3. Clique no ícone **</>** (Web)
4. Registre o app: "gamerent-web"
5. Copie o objeto `firebaseConfig`

### Passo 6: Criar Configuração

Crie `/src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Passo 7: Popular Banco

Crie um arquivo temporário para popular o Firestore:

```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

const games = [/* cole os dados dos jogos aqui */];

games.forEach(async (game) => {
  await addDoc(collection(db, 'games'), game);
});
```

Execute uma vez e depois delete o arquivo.

### Passo 8: Criar Hooks

Similar aos do Supabase, mas usando Firebase:

```typescript
// useAuth.ts com Firebase
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from 'firebase/auth';

// useGames.ts com Firebase
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const gamesRef = collection(db, 'games');
const q = query(gamesRef, where('available', '==', true));
const snapshot = await getDocs(q);
const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

---

<a name="mongodb"></a>
## 🍃 Opção 3: MongoDB Atlas

### Passo 1: Criar Conta

1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um cluster (escolha o plano FREE)
4. Região: São Paulo (sa-east-1)

### Passo 2: Configurar Acesso

1. Database Access: crie um usuário
2. Network Access: adicione seu IP (ou 0.0.0.0/0 para teste)

### Passo 3: Obter String de Conexão

1. Clique em "Connect"
2. Escolha "Connect your application"
3. Copie a string de conexão

### Passo 4: Backend com Node.js

MongoDB precisa de um backend. Crie um projeto Node.js separado:

```bash
mkdir gamerent-backend
cd gamerent-backend
npm init -y
npm install express mongoose cors dotenv
```

Estrutura do backend:

```
backend/
├── server.js
├── models/
│   ├── User.js
│   ├── Game.js
│   └── Reservation.js
└── routes/
    ├── auth.js
    ├── games.js
    └── reservations.js
```

Exemplo de `server.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('SUA_STRING_DE_CONEXÃO');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/reservations', require('./routes/reservations'));

app.listen(3001, () => console.log('Backend rodando na porta 3001'));
```

---

<a name="estrutura"></a>
## 📊 Estrutura de Dados Completa

### Tabela: users/profiles

```
id: UUID (gerado automaticamente)
email: string (único)
username: string (único)
full_name: string
avatar_url: string (opcional)
created_at: timestamp
updated_at: timestamp
```

### Tabela: games

```
id: UUID
name: string
category: string
summary: string
description: text
how_to_play: text
rules: array<string>
price: decimal
images: array<string>
players: string
duration: string
available: boolean
stock: integer
created_at: timestamp
updated_at: timestamp
```

### Tabela: reservations

```
id: UUID
user_id: UUID (foreign key → users)
game_id: UUID (foreign key → games)
reservation_date: date
return_date: date (opcional)
status: enum('active', 'completed', 'cancelled')
total_price: decimal
created_at: timestamp
updated_at: timestamp
```

---

<a name="migração"></a>
## 🔄 Checklist de Migração

### ✅ Antes de Começar
- [ ] Faça backup do código atual
- [ ] Escolha qual banco usar (recomendo Supabase)
- [ ] Crie conta no serviço escolhido

### ✅ Configuração
- [ ] Crie o projeto no serviço
- [ ] Configure as tabelas/coleções
- [ ] Instale as dependências no projeto
- [ ] Configure as credenciais

### ✅ Código
- [ ] Crie arquivos de configuração (`lib/supabase.ts`)
- [ ] Crie hooks customizados (`useAuth`, `useGames`, `useReservations`)
- [ ] Modifique `App.tsx` para usar hooks
- [ ] Atualize `LoginDialog.tsx` para aceitar e-mail
- [ ] Teste autenticação
- [ ] Teste listagem de jogos
- [ ] Teste criação de reservas
- [ ] Teste edição/cancelamento

### ✅ Testes
- [ ] Criar conta nova
- [ ] Fazer login
- [ ] Ver jogos
- [ ] Criar reserva
- [ ] Editar reserva
- [ ] Cancelar reserva
- [ ] Fazer logout
- [ ] Fazer login novamente (dados persistem?)

---

<a name="deploy"></a>
## 🚀 Deploy (Colocar no Ar)

### Vercel (Recomendado)

1. Crie conta em [vercel.com](https://vercel.com)
2. Instale Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. No diretório do projeto:
   ```bash
   vercel
   ```
4. Siga as instruções
5. Adicione as variáveis de ambiente no painel da Vercel

### Netlify

1. Crie conta em [netlify.com](https://netlify.com)
2. Arraste a pasta `dist` após build:
   ```bash
   npm run build
   ```
3. Configure variáveis de ambiente

---

## 🔒 Segurança - IMPORTANTE!

### ❌ NUNCA faça:
- Commitar credenciais no Git
- Usar a mesma senha para tudo
- Desabilitar Row Level Security
- Expor API keys

### ✅ SEMPRE faça:
- Use variáveis de ambiente
- Ative 2FA na conta do banco
- Configure Row Level Security
- Valide dados no backend
- Use HTTPS em produção
- Faça backups regulares

---

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Firebase](https://firebase.google.com/docs)
- [Documentação MongoDB](https://www.mongodb.com/docs/)
- [React + Supabase Tutorial](https://www.youtube.com/watch?v=7uKQBl9uZ00)

---

## 🆘 Problemas Comuns

### "Failed to fetch"
- Verifique se as credenciais estão corretas
- Verifique conexão com internet
- Veja o console do navegador para detalhes

### "Row Level Security"
- Supabase bloqueia tudo por padrão
- Execute as políticas SQL fornecidas acima

### "Invalid email"
- Email deve ser válido (pode usar temporário: [temp-mail.org](https://temp-mail.org))
- Ou desabilite verificação de email no Supabase (não recomendado)

---

## ✅ Resultado Final

Com banco de dados integrado, você terá:

✅ **Sistema real e funcional**
✅ **Usuários autenticados**
✅ **Dados persistentes**
✅ **Multi-usuário**
✅ **Pronto para produção** (com ajustes de segurança)

---

**Boa sorte com a integração! 🚀**

*Recomendo começar com Supabase - é mais profissional e tem melhor documentação.*
