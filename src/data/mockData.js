// Usuario actual (viene del login)
export const currentUser = {
  id: 'user1',
  nombre: 'Entrenador Ash',
  email: 'ash@pokemon.com',
};

// Lista de torneos
export const torneos = [
  {
    id: 't1',
    nombre: 'Torneo Primavera 2025',
    fecha: '2025-04-15',
    ubicacion: 'Gimnasio Pokémon',
    estado: 'activo',
    descripcion: 'Torneo Swiss para entrenadores de nivel intermedio',
    jugadoresInscritos: 24,
    capacidadMaxima: 32,
    inscrito: true,
    rondaActual: 2, // Ronda actual en curso
  },
  {
    id: 't2',
    nombre: 'Copa Indigo 2025',
    fecha: '2025-05-01',
    ubicacion: 'Estadio Indigo',
    estado: 'proximo',
    descripcion: 'Torneo de alto nivel con premios exclusivos',
    jugadoresInscritos: 12,
    capacidadMaxima: 48,
    inscrito: false,
    rondaActual: 0,
  },
  {
    id: 't3',
    nombre: 'Liga Johto Invierno',
    fecha: '2025-02-10',
    ubicacion: 'Arena Johto',
    estado: 'finalizado',
    descripcion: 'Torneo de invierno ya finalizado',
    jugadoresInscritos: 40,
    capacidadMaxima: 40,
    inscrito: true,
    rondaActual: 0,
  },
  {
    id: 't4',
    nombre: 'Torneo Relámpago',
    fecha: '2025-04-20',
    ubicacion: 'Centro Pokémon',
    estado: 'activo',
    descripcion: 'Torneo rápido de un día',
    jugadoresInscritos: 16,
    capacidadMaxima: 24,
    inscrito: false,
    rondaActual: 1,
  },
];

// Partidas simuladas
export const partidas = {
  t1: {
    rondas: [
      {
        numero: 1,
        partidas: [
          {
            id: 'p1',
            torneoId: 't1',
            ronda: 1,
            jugadorA: {
              id: 'user1',
              nombre: 'Entrenador Ash',
              avatar: null,
            },
            jugadorB: {
              id: 'user2',
              nombre: 'Gary Oak',
              avatar: null,
            },
            fecha: '2025-04-15',
            hora: '10:00',
            cancha: 'Mesa 1',
            resultado: { ganadorId: 'user2', marcador: '2-0' }, // Ya tiene resultado
            reportadoPor: 'user2',
          },
          {
            id: 'p2',
            torneoId: 't1',
            ronda: 1,
            jugadorA: {
              id: 'user3',
              nombre: 'Misty',
              avatar: null,
            },
            jugadorB: {
              id: 'user4',
              nombre: 'Brock',
              avatar: null,
            },
            fecha: '2025-04-15',
            hora: '10:30',
            cancha: 'Mesa 2',
            resultado: { ganadorId: 'user3', marcador: '2-0' },
            reportadoPor: 'user3',
          },
        ],
      },
      {
        numero: 2,
        partidas: [
          {
            id: 'p3',
            torneoId: 't1',
            ronda: 2,
            jugadorA: {
              id: 'user1',
              nombre: 'Entrenador Ash',
              avatar: null,
            },
            jugadorB: {
              id: 'user3',
              nombre: 'Misty',
              avatar: null,
            },
            fecha: '2025-04-15',
            hora: '11:00',
            cancha: 'Mesa 1',
            resultado: null, // Pendiente
            reportadoPor: null,
          },
          {
            id: 'p4',
            torneoId: 't1',
            ronda: 2,
            jugadorA: {
              id: 'user2',
              nombre: 'Gary Oak',
              avatar: null,
            },
            jugadorB: {
              id: 'user5',
              nombre: 'May',
              avatar: null,
            },
            fecha: '2025-04-15',
            hora: '11:30',
            cancha: 'Mesa 2',
            resultado: null, // Pendiente
            reportadoPor: null,
          },
        ],
      },
      {
        numero: 3,
        partidas: [
          {
            id: 'p5',
            torneoId: 't1',
            ronda: 3,
            jugadorA: {
              id: 'user1',
              nombre: 'Entrenador Ash',
              avatar: null,
            },
            jugadorB: {
              id: 'user2',
              nombre: 'Gary Oak',
              avatar: null,
            },
            fecha: '2025-04-15',
            hora: '13:00',
            cancha: 'Mesa Final',
            resultado: null, // Pendiente (ronda futura)
            reportadoPor: null,
          },
        ],
      },
    ],
  },
  t2: {
    rondas: [],
  },
  t3: {
    rondas: [
      {
        numero: 1,
        partidas: [
          {
            id: 'p6',
            torneoId: 't3',
            ronda: 1,
            jugadorA: {
              id: 'user1',
              nombre: 'Entrenador Ash',
              avatar: null,
            },
            jugadorB: {
              id: 'user6',
              nombre: 'Dawn',
              avatar: null,
            },
            fecha: '2025-02-10',
            hora: '09:00',
            cancha: 'Mesa 1',
            resultado: { ganadorId: 'user1', marcador: '2-1' },
            reportadoPor: 'user1',
          },
        ],
      },
    ],
  },
};

// Standings (clasificación)
export const standings = {
  t1: [
    { posicion: 1, jugadorId: 'user3', nombre: 'Misty', puntos: 6, jugados: 2, ganados: 2, empates: 0, perdidos: 0 },
    { posicion: 2, jugadorId: 'user2', nombre: 'Gary Oak', puntos: 3, jugados: 2, ganados: 1, empates: 0, perdidos: 1 },
    { posicion: 3, jugadorId: 'user1', nombre: 'Entrenador Ash', puntos: 3, jugados: 2, ganados: 1, empates: 0, perdidos: 1 },
    { posicion: 4, jugadorId: 'user4', nombre: 'Brock', puntos: 0, jugados: 1, ganados: 0, empates: 0, perdidos: 1 },
    { posicion: 5, jugadorId: 'user5', nombre: 'May', puntos: 0, jugados: 1, ganados: 0, empates: 0, perdidos: 1 },
  ],
  t2: [],
  t3: [
    { posicion: 1, jugadorId: 'user1', nombre: 'Entrenador Ash', puntos: 3, jugados: 1, ganados: 1, empates: 0, perdidos: 0 },
    { posicion: 2, jugadorId: 'user6', nombre: 'Dawn', puntos: 0, jugados: 1, ganados: 0, empates: 0, perdidos: 1 },
  ],
};

// Estadísticas del jugador
export const estadisticasJugador = {
  user1: {
    torneosParticipados: 5,
    torneosGanados: 1,
    partidasJugadas: 12,
    partidasGanadas: 8,
    partidasPerdidas: 4,
    tasaVictorias: 67,
    mejorPosicion: 1,
  },
};