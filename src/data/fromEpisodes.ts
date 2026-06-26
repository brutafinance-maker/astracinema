export interface Episode {
  season: number;
  episode: number;
  title: string;
  airDate: string;
  description: string;
  rating: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

// ÁREA TEMPORÁRIA DE TESTE OU INTEGRAÇÃO DE EPISÓDIOS REAIS DE "FROM"
export const FROM_EPISODES: Episode[] = [
  // ==================== TEMPORADA 1 ====================
  {
    season: 1,
    episode: 1,
    title: "Long Day's Journey Into Night",
    airDate: "20 de fev. de 2022",
    rating: "8.1/10",
    description: "A viagem da família Matthews toma um rumo horrível quando são desviados para uma pequena cidade da qual não podem sair. Quando o trailer de sua família cai, o xerife e outros moradores correm para salvá-los antes que o sol se ponha.",
    thumbnailUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k3Z8r4zRALytL0H37NA"
  },
  {
    season: 1,
    episode: 2,
    title: "The Way Things Are Now",
    airDate: "20 de fev. de 2022",
    rating: "7.6/10",
    description: "Na Colony House, Tabitha e Julie lidam with sua nova realidade de pesadelo. Na floresta, Jim, Boyd e Kristi lutam para tratar os ferimentos de Ethan. A tragédia chega de uma fonte inesperada quando surge uma nova ameaça.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k6dTAfuiG3qC6CH37NE"
  },
  {
    season: 1,
    episode: 3,
    title: "Choosing Day",
    airDate: "20 de fev. de 2022",
    rating: "7.5/10",
    description: "The Matthews family must choose which of the two settlements they will join. Meanwhile, Jade comes to terms with his situation and Boyd is faced with an impossible decision that strikes at the very heart of life in the town.",
    thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k5NBxqBSslizxAH37Nw"
  },
  {
    season: 1,
    episode: 4,
    title: "A Rock and a Farway",
    airDate: "27 de fev. de 2022",
    rating: "7.3/10",
    description: "Julie e Ethan fazem novos amigos, seus pais discutem suas diferenças e Boyd e Khatri conversam sobre o papel de Boyd na comunidade.",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k1z1YaDuFqJqa7H37Ng"
  },
  {
    season: 1,
    episode: 5,
    title: "Silhouettes",
    airDate: "6 de mar. de 2022",
    rating: "7.2/10",
    description: "Jim, Tabitha e Ethan começam a fazer perguntas sobre onde estão, na esperança de que isso os leve de volta para casa. Ellis e Fatima mostram a Julie o lado mais leve da vida na cidade. Jade se esforça para entender sua situação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k4ldSnPvZKuBTfH37NI"
  },
  {
    season: 1,
    episode: 6,
    title: "Book 74",
    airDate: "13 de mar. de 2022",
    rating: "7.3/10",
    description: "Boyd's plan to head off into the forest provokes an unexpected response from Kenny. Jade enlists Jim's help with an experiment while Tabitha makes a chilling discovery that sends her down a unique path searching for answers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k4W8AI2ZGSPaAJH37NQ"
  },
  {
    season: 1,
    episode: 7,
    title: "All Good Things...",
    airDate: "20 de mar. de 2022",
    rating: "8.3/10",
    description: "Uma comemoração na Colony House se transforma em tragédia. Khatri tenta convencer Boyd a levar ele e Sarah com ele.",
    thumbnailUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k4Ws13JHvQznYEH37No"
  },
  {
    season: 1,
    episode: 8,
    title: "Broken Windows, Open Doors",
    airDate: "27 de mar. de 2022",
    rating: "7.7/10",
    description: "In the wake of another death, Boyd questions his decision to leave; Kenny steps up and embraces his new role; Jim rallies the town around his idea to build a radio tower.",
    thumbnailUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k3gdD3qEdmkvD0H37NM"
  },
  {
    season: 1,
    episode: 9,
    title: "Into the Woods",
    airDate: "3 de abr. de 2022",
    rating: "7.6/10",
    description: "Boyd takes Sara into the forest to find a way home, and they uncover more mysteries. Some of the townfolk wonder if they want to go home.",
    thumbnailUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k6PTEQ8M9jqYuqH37Ns"
  },
  {
    season: 1,
    episode: 10,
    title: "Oh, the Places We'll Go",
    airDate: "10 de abr. de 2022",
    rating: "7.8/10",
    description: "Jim's radio tower yields consequences which rock him to his very core. The hole that Tabitha has been digging leads her somewhere - and to someone - she could never have expected. Everything is about to change.",
    thumbnailUrl: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=320&q=80",
    videoUrl: "https://www.dailymotion.com/embed/video/k2TGVEQbl34YTdH37Nk"
  },

  // ==================== TEMPORADA 2 ====================
  {
    season: 2,
    episode: 1,
    title: "Strangers in a Strange Land",
    airDate: "23 de abr. de 2023",
    rating: "7.9/10",
    description: "Na ausência do xerife Boyd, Donna e Kenny se esforçam para administrar o caos quando um ônibus cheio de recém-chegados involuntários chega à cidade; Victor e Tabitha fazem uma viagem arrepiante pelo labirinto de pesadelos.",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 2,
    title: "The Kindness of Strangers",
    airDate: "30 de abr. de 2023",
    rating: "7.9/10",
    description: "Uma noite tensa na lanchonete, enquanto os moradores e os recém-chegados esperam o nascer do sol; o medo permeia os destroços sob a casa dos Matthews, enquanto Jim e Tom lutam para manter em silêncio um passageiro de ônibus em pânico.",
    thumbnailUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 3,
    title: "Tether",
    airDate: "7 de mai. de 2023",
    rating: "7.1/10",
    description: "Kenny e Ellis fazem uma descoberta terrível na floresta; Boyd luta contra a realidade do que está acontecendo com ele.",
    thumbnailUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 4,
    title: "This Way Gone",
    airDate: "14 de mai. de 2023",
    rating: "6.8/10",
    description: "As Boyd's condition grows more alarming, Sara's return to town puts him in a difficult position; Jim shares a troubling new theory about the town.",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 5,
    title: "Lullaby",
    airDate: "21 de mai. de 2023",
    rating: "6.4/10",
    description: "Sara must face the music, as word of her return spreads through town; Victor and Jade strike an unlikely bargain.",
    thumbnailUrl: "https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 6,
    title: "Pas de Deux",
    airDate: "28 de mai. de 2023",
    rating: "7.8/10",
    description: "Tensions run high at Colony House when word of the coming food shortage leaks out; a night at the clinic takes a terrifying turn.",
    thumbnailUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 7,
    title: "Belly of the Beast",
    airDate: "4 de jun. de 2023",
    rating: "7.1/10",
    description: "Boyd e Kristi tentam tirar proveito de uma nova descoberta; Jim encontra um aliado improvável no volátil Randall.",
    thumbnailUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 8,
    title: "Forest for the Trees",
    airDate: "11 de jun. de 2023",
    rating: "7.3/10",
    description: "In their pursuit of the truth about the town, Jim and Randall hatch a dangerous plan; meanwhile, a new form of terror is brewing.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 9,
    title: "Ball of Magic Fire",
    airDate: "18 de jun. de 2023",
    rating: "7.6/10",
    description: "O pânico se espalha pela cidade quando os moradores enfrentam uma nova e assustadora ameaça à sua sobrevivência; Jim percebe a magnitude do erro que cometeu ao alistar Randall em sua causa.",
    thumbnailUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 2,
    episode: 10,
    title: "Once Upon a Time...",
    airDate: "25 de jun. de 2023",
    rating: "8.0/10",
    description: "Boyd teme que finalmente tenha ficado sem respostas, enquanto os moradores da cidade se preparam para o fim; Tabitha se apega à crença de que as crianças podem ser a chave para a salvação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1433832597026-63a5d0849851?auto=format&fit=crop&w=320&q=80"
  },

  // ==================== TEMPORADA 3 ====================
  {
    season: 3,
    episode: 1,
    title: "Shatter",
    airDate: "22 de set. de 2024",
    rating: "8.3/10",
    description: "Boyd sente que a cidade está se afastando dele à medida que o tempo fica mais frio e os moradores ficam mais desesperados.",
    thumbnailUrl: "https://images.unsplash.com/photo-1447005497901-b3e9ee359928?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 2,
    title: "When We Go",
    airDate: "29 de set. de 2024",
    rating: "7.9/10",
    description: "Boyd se esforça para encontrar um caminho a seguir enquanto a cidade se despede de um dos seus. A saúde de Fátima piora, enquanto Tabitha encontra a ajuda de um aliado improvável.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 3,
    title: "Mouse Trap",
    airDate: "6 de out. de 2024",
    rating: "7.9/10",
    description: "Kenny leva um grupo para a floresta em busca de comida enquanto Donna e Ellis tentam convencer Boyd a não empreender um plano perigoso. Enquanto isso, Tabitha faz uma descoberta incrível.",
    thumbnailUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 4,
    title: "There and Back Again",
    airDate: "13 de out. de 2024",
    rating: "8.3/10",
    description: "Boyd é forçado a tomar uma decisão difícil quando os recém-chegados chegam à cidade ao anoitecer; Victor descobre memórias do passado na esperança de encontrar respostas.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516214108703-de3b5da702f5?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 5,
    title: "The Light of Day",
    airDate: "20 de out. de 2024",
    rating: "7.3/10",
    description: "Victor deve enfrentar uma lembrança de seu passado; Julie busca lidar com seu trauma; Boyd se esforça para manter a cidade segura quando os moradores começam a questionar seu julgamento; Tabitha tenta se adaptar ao novo ambiente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 6,
    title: "Scar Tissue",
    airDate: "27 de out. de 2024",
    rating: "6.7/10",
    description: "Fatima e Ellis tomam uma grande decisão sobre a gravidez; Boyd teme pelo futuro de sua família; as tensões aumentam na casa dos Matthews; Randall fala com Marielle sobre seus medos.",
    thumbnailUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 7,
    title: "These Fragile Lives",
    airDate: "3 de nov. de 2024",
    rating: "5.9/10",
    description: "Os limites começam a se enfraquecer à medida que a preocupação com a gravidez de Fátima aumenta; Jade segue um caminho que leva à floresta; Julie e Randall buscam um pouco de normalidade.",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 8,
    title: "Thresholds",
    airDate: "10 de nov. de 2024",
    rating: "6.9/10",
    description: "Acusações e verdades vêm à tona após uma tragédia; Victor se esforça para recuperar memórias há muito enterradas do passado da cidade; Julie e Ethan buscam respostas sobre as misteriosas ruínas da floresta.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 9,
    title: "Revelations: Chapter One",
    airDate: "17 de nov. de 2024",
    rating: "6.7/10",
    description: "As tensões aumentam quando os moradores da cidade descobrem que um dos seus desapareceu.",
    thumbnailUrl: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 3,
    episode: 10,
    title: "Revelations: Chapter Two",
    airDate: "24 de nov. de 2024",
    rating: "8.2/10",
    description: "No final da temporada, Boyd é levado ao limite quando o tempo começa a se esgotar para alguém que ele ama. A jornada improvável de Tabitha toma um rumo surpreendente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1461962030985-54ea40998ad6?auto=format&fit=crop&w=320&q=80"
  },

  // ==================== TEMPORADA 4 ====================
  {
    season: 4,
    episode: 1,
    title: "The Arrival",
    airDate: "19 de abr. de 2026",
    rating: "8.2/10",
    description: "Um recém-chegado causa estragos na cidade; Jade e Tabitha lidam com sua descoberta na Bottle Tree; Boyd enfrenta as consequências do retorno de Smiley.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 2,
    title: "Fray",
    airDate: "26 de abr. de 2026",
    rating: "7.2/10",
    description: "Uma descoberta macabra sacode a cidade enquanto Jade e Tabitha lutam com o peso de sua revelação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 3,
    title: "Merrily We Go",
    airDate: "3 de mai. de 2026",
    rating: "6.3/10",
    description: "Boyd tenta salvar Acosta de si mesma enquanto Julie explora suas novas habilidades. Tabitha arrisca uma aposta desesperada e Victor se junta a Ethan na busca por respostas.",
    thumbnailUrl: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 4,
    title: "Of Myths and Monsters",
    airDate: "10 de mai. de 2026",
    rating: "6.6/10",
    description: "Uma descoberta sinistra força a equipe de Boyd a entrar no modo defensivo enquanto Julie experimenta suas estranhas novas habilidades e Sara enfrenta o tormento psicológico de vozes misteriosas.",
    thumbnailUrl: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 5,
    title: "What a Long Strange Trip It's Been",
    airDate: "17 de mai. de 2026",
    rating: "8.5/10",
    description: "Uma busca frenética por respostas leva Boyd e Jade a um território desconhecido, enquanto uma simples entrega de comida se transforma em um cenário de pesadelo no assentamento.",
    thumbnailUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 6,
    title: "The Heart Is a Lonely Hunter",
    airDate: "31 de mai. de 2026",
    rating: "6.1/10",
    description: "Rola uma briga entre Boyd e Jade em relação às visões em sua cabeça, mesmo quando as notícias alarmantes viajam de volta do povoado.",
    thumbnailUrl: "https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 7,
    title: "Best Laid Plans",
    airDate: "7 de jun. de 2026",
    rating: "8.1/10",
    description: "O passado sombrio de Tabitha e Jade vem à tona enquanto outro morador enfrenta problemas. Boyd planeja testar uma teoria arriscada.",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 8,
    title: "Heavy Is the Head",
    airDate: "14 de jun. de 2026",
    rating: "6.6/10",
    description: "Boyd avalia um plano que poderia levar todos para casa. Fátima e Enrique se deparam com inquietantes encruzilhadas. Victor ajuda Tabitha e Ethan a se prepararem para o pior na medida em que aumentam as tensões e tomam decisões difíceis.",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 9,
    title: "The Calm Before",
    airDate: "21 de jun. de 2026",
    rating: "8.1/10",
    description: "Os moradores da cidade se deparam com uma encruzilhada diferente de qualquer outra que já enfrentaram, enquanto Boyd coloca em prática um plano ousado e perigoso.",
    thumbnailUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=320&q=80"
  },
  {
    season: 4,
    episode: 10,
    title: "If a Tree Falls in the Forest...",
    airDate: "28 de jun. de 2026",
    rating: "8.1/10",
    description: "Boyd's quest to lead the residents home reaches a terrifying crossroads, and nothing will ever be the same again.",
    thumbnailUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=320&q=80"
  }
];
