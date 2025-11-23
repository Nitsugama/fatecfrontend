import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { GameDetailsPage } from './components/GameDetailsPage';
import { CalendarPage } from './components/CalendarPage';
import { ReservationManagement } from './components/ReservationManagement';
import { LoginDialog } from './components/LoginDialog';

// ============================================================================
// INTERFACES - Definição dos tipos de dados usados no sistema
// ============================================================================

/**
 * Interface que define a estrutura de um jogo
 * Contém todas as informações necessárias para exibir e alugar um jogo
 */
export interface Game {
  id: string;              // Identificador único do jogo
  name: string;            // Nome do jogo
  category: string;        // Categoria (ex: "Jogo de Cartas", "Jogo de Tabuleiro")
  summary: string;         // Resumo curto para exibir nos cards
  price: number;           // Preço do aluguel por dia em reais
  images: string[];        // Array de URLs das imagens do jogo
  description: string;     // Descrição completa do jogo
  howToPlay: string;       // Explicação de como jogar
  rules: string[];         // Array com as regras básicas
  players: string;         // Número de jogadores (ex: "2-4 jogadores")
  duration: string;        // Duração média da partida (ex: "30-60 minutos")
}

/**
 * Interface que define a estrutura de uma reserva
 * Armazena informações sobre o aluguel de um jogo
 */
export interface Reservation {
  id: string;              // Identificador único da reserva
  gameId: string;          // ID do jogo reservado (relaciona com Game.id)
  gameName: string;        // Nome do jogo (para facilitar exibição)
  date: Date;              // Data da reserva
  status: 'active' | 'cancelled';  // Status da reserva (ativa ou cancelada)
}

// ============================================================================
// DADOS MOCKADOS - Base de dados simulada dos jogos
// ============================================================================

/**
 * Array com todos os jogos disponíveis no catálogo
 * Em um sistema real, estes dados viriam de um banco de dados
 */
export const gamesData: Game[] = [
  {
    id: '1',
    name: 'Magic: The Gathering',
    category: 'Jogo de Cartas Estratégico',
    summary: 'O clássico jogo de cartas colecionáveis para batalhas épicas entre magos.',
    price: 25.00,
    images: [
      'https://images.unsplash.com/photo-1632501641765-e568d28b0015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZCUyMGdhbWUlMjBjYXJkc3xlbnwxfHx8fDE3NjMwODAwODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1728167049092-de4e98571c1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkJTIwZ2FtZSUyMGRlY2t8ZW58MXx8fHwxNzYzMDgwMDg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    description: 'Magic: The Gathering é um jogo de cartas estratégico onde você assume o papel de um poderoso mago (Planeswalker) e duela contra outros jogadores usando feitiços, criaturas e artefatos.',
    howToPlay: 'Cada jogador começa com 20 pontos de vida. Use seu deck de cartas para invocar criaturas, lançar feitiços e reduzir a vida do oponente a zero. Gerencie seus recursos de mana e construa estratégias complexas.',
    rules: [
      'Cada jogador começa com 20 pontos de vida',
      'Compre uma carta no início do seu turno',
      'Jogue uma terra por turno para gerar mana',
      'Use mana para jogar feitiços e criaturas',
      'Ataque com suas criaturas durante a fase de combate',
      'O primeiro jogador a reduzir a vida do oponente a zero vence'
    ],
    players: '2 jogadores',
    duration: '30-60 minutos'
  },
  {
    id: '2',
    name: 'Uno Deluxe',
    category: 'Jogo de Cartas Familiar',
    summary: 'O clássico jogo de cartas que todos conhecem e amam.',
    price: 15.00,
    images: [
      'https://images.unsplash.com/photo-1601162937667-08f083516d57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5aW5nJTIwY2FyZHMlMjBnYW1lfGVufDF8fHx8MTc2MzA4MDA4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    description: 'UNO é um jogo de cartas divertido e dinâmico onde o objetivo é ser o primeiro a descartar todas as suas cartas.',
    howToPlay: 'Combine cores ou números com a carta no topo da pilha de descarte. Use cartas especiais para mudar o rumo do jogo e não se esqueça de gritar "UNO!" quando tiver apenas uma carta na mão.',
    rules: [
      'Cada jogador recebe 7 cartas',
      'Combine a cor ou o número da carta no topo da pilha',
      'Cartas especiais: Pular, Inverter, +2, Coringa, +4',
      'Grite "UNO!" quando tiver apenas uma carta',
      'O primeiro a descartar todas as cartas vence',
      'Caso não grite "UNO!", compre 2 cartas como penalidade'
    ],
    players: '2-10 jogadores',
    duration: '15-30 minutos'
  },
  {
    id: '3',
    name: 'Xadrez Premium',
    category: 'Jogo de Tabuleiro Estratégico',
    summary: 'O jogo de estratégia milenar com peças e tabuleiro premium.',
    price: 20.00,
    images: [
      'https://images.unsplash.com/photo-1654741755763-b4cee51feb9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzcyUyMGJvYXJkJTIwZ2FtZXxlbnwxfHx8fDE3NjMwNTYwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    description: 'Xadrez é um jogo de tabuleiro estratégico de dois jogadores onde o objetivo é dar xeque-mate no rei adversário.',
    howToPlay: 'Cada jogador controla 16 peças (rei, rainha, torres, bispos, cavalos e peões). Movimente suas peças estrategicamente para capturar as peças do oponente e colocar o rei adversário em xeque-mate.',
    rules: [
      'Cada peça tem movimentos específicos',
      'Rei: uma casa em qualquer direção',
      'Rainha: qualquer direção, qualquer distância',
      'Torre: horizontal ou vertical',
      'Bispo: diagonal',
      'Cavalo: movimento em L',
      'Peão: uma casa para frente (duas no primeiro movimento)',
      'O objetivo é dar xeque-mate no rei adversário'
    ],
    players: '2 jogadores',
    duration: '30-90 minutos'
  },
  {
    id: '4',
    name: 'Banco Imobiliário',
    category: 'Jogo de Tabuleiro Familiar',
    summary: 'Compre, venda e negocie propriedades neste clássico jogo de negócios.',
    price: 30.00,
    images: [
      'https://images.unsplash.com/photo-1640461470346-c8b56497850a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vcG9seSUyMGJvYXJkJTIwZ2FtZXxlbnwxfHx8fDE3NjMwODAwODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    description: 'Banco Imobiliário é um jogo de negócios onde você compra propriedades, constrói casas e hotéis, e cobra aluguel dos outros jogadores.',
    howToPlay: 'Lance os dados e mova-se pelo tabuleiro. Compre propriedades desocupadas em que você pousar. Construa casas e hotéis para aumentar o aluguel. O objetivo é falir todos os outros jogadores.',
    rules: [
      'Cada jogador recebe $1500 iniciais',
      'Lance os dados e mova seu peão',
      'Compre propriedades onde você pousar',
      'Pague aluguel ao dono da propriedade',
      'Construa casas quando tiver todas as propriedades de uma cor',
      'Negocie propriedades com outros jogadores',
      'O último jogador sem falir vence'
    ],
    players: '2-8 jogadores',
    duration: '60-180 minutos'
  },
  {
    id: '5',
    name: 'Catan',
    category: 'Jogo de Tabuleiro Estratégico',
    summary: 'Colonize a ilha de Catan e construa sua civilização.',
    price: 35.00,
    images: [
      'https://images.unsplash.com/photo-1651355828101-1e96ef64b1ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXRvcCUyMGdhbWVzfGVufDF8fHx8MTc2MzA4MDA4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    description: 'Catan é um jogo de estratégia onde você coloniza uma ilha, coletando recursos, construindo estradas, povoados e cidades.',
    howToPlay: 'Lance os dados para coletar recursos (madeira, tijolo, trigo, ovelha, minério). Use esses recursos para construir estradas, povoados e cidades. Negocie com outros jogadores para obter os recursos que faltam.',
    rules: [
      'O tabuleiro é montado aleatoriamente a cada partida',
      'Lance os dados para determinar quais hexágonos produzem recursos',
      'Use recursos para construir: estradas (1 madeira + 1 tijolo), povoados (1 madeira + 1 tijolo + 1 trigo + 1 ovelha)',
      'Povoados valem 1 ponto, cidades valem 2 pontos',
      'Negocie recursos com outros jogadores',
      'Primeiro jogador a alcançar 10 pontos vence'
    ],
    players: '3-4 jogadores (expansões permitem 5-6)',
    duration: '60-120 minutos'
  },
  {
    id: '6',
    name: 'Exploding Kittens',
    category: 'Jogo de Cartas Party',
    summary: 'Um jogo de cartas estratégico cheio de gatinhos, explosões e às vezes cabras.',
    price: 22.00,
    images: [
      'https://images.unsplash.com/photo-1632501641765-e568d28b0015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZCUyMGdhbWUlMjBjYXJkc3xlbnwxfHx8fDE3NjMwODAwODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    description: 'Exploding Kittens é um jogo de cartas rápido e hilário onde você tenta evitar explodir enquanto força seus oponentes a pegar cartas explosivas.',
    howToPlay: 'No seu turno, jogue cartas de ação para manipular o baralho, espiar cartas futuras ou forçar outros jogadores a comprar. Depois, compre uma carta. Se comprar um Exploding Kitten, você explode e está fora, a menos que tenha uma carta de Defuse.',
    rules: [
      'Cada jogador recebe cartas e uma carta Defuse',
      'No seu turno, jogue quantas cartas de ação quiser',
      'Depois, compre uma carta do baralho',
      'Se comprar um Exploding Kitten, use uma Defuse ou saia do jogo',
      'Cartas de ação incluem: Skip, Attack, Favor, Shuffle, See the Future',
      'O último jogador que não explodir vence'
    ],
    players: '2-5 jogadores',
    duration: '15 minutos'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL - Gerencia todo o estado e navegação da aplicação
// ============================================================================

function App() {
  // --------------------------------------------------------------------------
  // ESTADOS - Gerenciamento do estado da aplicação
  // --------------------------------------------------------------------------
  
  /**
   * Controla qual página está sendo exibida atualmente
   * Valores possíveis: 'home', 'game', 'calendar', 'reservations'
   */
  const [currentPage, setCurrentPage] = useState<'home' | 'game' | 'calendar' | 'reservations'>('home');
  
  /**
   * Armazena o jogo que está sendo visualizado/alugado no momento
   * null quando nenhum jogo está selecionado
   */
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  /**
   * Indica se o usuário está logado ou não
   * Em um sistema real, isso seria verificado com autenticação no backend
   */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  /**
   * Controla a exibição do modal de login
   * true = modal visível, false = modal oculto
   */
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  /**
   * Array com todas as reservas do usuário
   * Em um sistema real, isso seria armazenado em banco de dados
   */
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  /**
   * Armazena temporariamente um jogo quando o usuário tenta alugar sem estar logado
   * Após o login, o sistema continuará o processo de aluguel deste jogo
   */
  const [pendingGameForRent, setPendingGameForRent] = useState<Game | null>(null);

  // --------------------------------------------------------------------------
  // FUNÇÕES DE NAVEGAÇÃO - Controlam a navegação entre páginas
  // --------------------------------------------------------------------------
  
  /**
   * Função chamada quando o usuário clica em um card de jogo
   * Navega para a página de detalhes do jogo
   * 
   * @param game - O jogo que foi selecionado
   */
  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setCurrentPage('game');
  };

  /**
   * Função chamada quando o usuário clica em "Alugar Jogo"
   * Verifica se o usuário está logado antes de permitir o aluguel
   * 
   * @param game - O jogo que o usuário deseja alugar
   */
  const handleRentClick = (game: Game) => {
    if (!isLoggedIn) {
      // Usuário não está logado: salva o jogo e exibe o modal de login
      setPendingGameForRent(game);
      setShowLoginDialog(true);
    } else {
      // Usuário está logado: vai direto para o calendário
      setSelectedGame(game);
      setCurrentPage('calendar');
    }
  };

  // --------------------------------------------------------------------------
  // FUNÇÕES DE AUTENTICAÇÃO - Gerenciam login e logout
  // --------------------------------------------------------------------------
  
  /**
   * Função chamada quando o usuário faz login
   * NOTA: Este é um login simulado - não há validação real
   * Em produção, seria necessário validar com um backend
   * 
   * @param username - Nome de usuário digitado
   * @param password - Senha digitada
   */
  const handleLogin = async (username: string, password: string) => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      alert("Usuário ou senha incorretos");
      return;
    }

    const data = await res.json();

    console.log("LOGIN OK:", data);

    setIsLoggedIn(true);
    setShowLoginDialog(false);

    if (pendingGameForRent) {
      setSelectedGame(pendingGameForRent);
      setCurrentPage('calendar');
      setPendingGameForRent(null);
    }

  } catch (error) {
    console.error("Erro ao logar:", error);
    alert("Erro ao conectar ao servidor");
  }
};


  /**
   * Função chamada quando o usuário cria uma nova conta
   * NOTA: Este é um registro simulado - os dados não são salvos
   * Em produção, seria necessário salvar em banco de dados
   * 
   * @param username - Nome de usuário escolhido
   * @param email - E-mail do usuário
   * @param password - Senha escolhida
   */
 const handleRegister = async (username: string, email: string, password: string) => {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    if (!res.ok) {
      alert("Erro ao registrar");
      return;
    }

    const data = await res.json();

    console.log("REGISTRO OK:", data);

    setIsLoggedIn(true);
    setShowLoginDialog(false);

    if (pendingGameForRent) {
      setSelectedGame(pendingGameForRent);
      setCurrentPage('calendar');
      setPendingGameForRent(null);
    }

  } catch (error) {
    console.error("Erro ao registrar:", error);
    alert("Erro ao conectar ao servidor");
  }
};


  /**
   * Função chamada quando o usuário faz logout
   * Limpa todos os dados do usuário e volta para a página inicial
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
    setReservations([]); // Limpa as reservas ao sair
  };

  // --------------------------------------------------------------------------
  // FUNÇÕES DE RESERVA - Gerenciam criação e modificação de reservas
  // --------------------------------------------------------------------------
  
  /**
   * Função chamada quando o usuário seleciona uma data no calendário
   * Cria uma nova reserva e navega para a página de gerenciamento
   * 
   * @param date - Data selecionada para a reserva
   */
  const handleDateSelect = (date: Date) => {
    if (selectedGame) {
      // Cria um objeto de reserva com os dados do jogo e da data
      const newReservation: Reservation = {
        id: Date.now().toString(),      // Gera um ID único baseado no timestamp
        gameId: selectedGame.id,        // Relaciona com o jogo
        gameName: selectedGame.name,    // Salva o nome para facilitar exibição
        date: date,                     // Data da reserva
        status: 'active'                // Status inicial: ativa
      };
      
      // Adiciona a nova reserva ao array de reservas
      setReservations([...reservations, newReservation]);
      
      // Navega para a página de gerenciamento de reservas
      setCurrentPage('reservations');
    }
  };

  /**
   * Função para atualizar a data de uma reserva existente
   * 
   * @param reservationId - ID da reserva a ser atualizada
   * @param newDate - Nova data para a reserva
   */
  const handleUpdateReservation = (reservationId: string, newDate: Date) => {
    // Mapeia o array de reservas, atualizando apenas a reserva correspondente
    setReservations(reservations.map(r => 
      r.id === reservationId ? { ...r, date: newDate } : r
    ));
  };

  /**
   * Função para cancelar uma reserva
   * Nota: Não remove a reserva, apenas muda o status para 'cancelled'
   * 
   * @param reservationId - ID da reserva a ser cancelada
   */
  const handleCancelReservation = (reservationId: string) => {
    // Mapeia o array de reservas, alterando o status da reserva correspondente
    setReservations(reservations.map(r =>
      r.id === reservationId ? { ...r, status: 'cancelled' } : r
    ));
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO - Estrutura visual da aplicação
  // --------------------------------------------------------------------------
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Cabeçalho fixo no topo com navegação e login */}
      <Header 
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginDialog(true)}
        onLogout={handleLogout}
        onNavigateHome={() => setCurrentPage('home')}
        onNavigateReservations={() => setCurrentPage('reservations')}
        hasReservations={reservations.some(r => r.status === 'active')}
      />
      
      {/* Conteúdo principal - muda conforme a página atual */}
      <main className="flex-1">
        {/* Renderização condicional: mostra apenas a página correspondente ao estado currentPage */}
        
        {/* Página Inicial - Catálogo de jogos */}
        {currentPage === 'home' && (
          <HomePage games={gamesData} onGameSelect={handleGameSelect} />
        )}
        
        {/* Página de Detalhes do Jogo - Informações completas de um jogo */}
        {currentPage === 'game' && selectedGame && (
          <GameDetailsPage 
            game={selectedGame} 
            onRentClick={() => handleRentClick(selectedGame)}
            onBack={() => setCurrentPage('home')}
          />
        )}
        
        {/* Página de Calendário - Seleção de data para aluguel */}
        {currentPage === 'calendar' && selectedGame && (
          <CalendarPage 
            game={selectedGame}
            onDateSelect={handleDateSelect}
            onBack={() => setCurrentPage('game')}
            existingReservations={reservations}
          />
        )}
        
        {/* Página de Gerenciamento de Reservas - Lista e edição de reservas */}
        {currentPage === 'reservations' && (
          <ReservationManagement 
            reservations={reservations}
            onUpdateReservation={handleUpdateReservation}
            onCancelReservation={handleCancelReservation}
            onBack={() => setCurrentPage('home')}
          />
        )}
      </main>
      
      {/* Rodapé com informações de contato */}
      <Footer />
      
      {/* Modal de Login/Registro - Aparece quando showLoginDialog é true */}
      <LoginDialog 
        open={showLoginDialog}
        onClose={() => {
          setShowLoginDialog(false);
          setPendingGameForRent(null); // Limpa o jogo pendente ao fechar
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}

export default App;