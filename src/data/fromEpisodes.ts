export interface Episode {
  season: number;
  episode: number;
  title: string;
  airDate: string;
  description: string;
  rating: string;
  thumbnailUrl: string;
  videoUrl?: string;
  provider?: 'gdrive' | 'dailymotion' | 'other';
  fileId?: string;
}

const RAW_EPISODES: Episode[] = [
  // ==================== TEMPORADA 1 ====================
  {
    season: 1,
    episode: 1,
    title: "Long Day's Journey Into Night",
    airDate: "20 de fev. de 2022",
    rating: "8.1/10",
    description: "A viagem da família Matthews toma um rumo horrível quando são desviados para uma pequena cidade da qual não podem sair. Quando o trailer de sua família cai, o xerife e outros moradores correm para salvá-los antes que o sol se ponha.",
    thumbnailUrl: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1SMGtag9hHvsjyk1CPDfRVEdGu-GODWm9"
  },
  {
    season: 1,
    episode: 2,
    title: "The Way Things Are Now",
    airDate: "20 de fev. de 2022",
    rating: "7.6/10",
    description: "Na Colony House, Tabitha e Julie lidam with sua nova realidade de pesadelo. Na floresta, Jim, Boyd e Kristi lutam para tratar os ferimentos de Ethan. A tragédia chega de uma fonte inesperada quando surge uma nova ameaça.",
    thumbnailUrl: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1wfEAFRAHsV2jNm64KdsNoEgCkGxGGnWP"
  },
  {
    season: 1,
    episode: 3,
    title: "Choosing Day",
    airDate: "20 de fev. de 2022",
    rating: "7.5/10",
    description: "The Matthews family must choose which of the two settlements they will join. Meanwhile, Jade comes to terms with his situation and Boyd is faced with an impossible decision that strikes at the very heart of life in the town.",
    thumbnailUrl: "https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1IV54EmYnUdAJqtE6-MC-G53OvtNWzKz9"
  },
  {
    season: 1,
    episode: 4,
    title: "A Rock and a Farway",
    airDate: "27 de fev. de 2022",
    rating: "7.3/10",
    description: "Julie e Ethan fazem novos amigos, seus pais discutem suas diferenças e Boyd e Khatri conversam sobre o papel de Boyd na comunidade.",
    thumbnailUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "121RZALbX-b03CnggjfYorWqaoDlB8Q3k"
  },
  {
    season: 1,
    episode: 5,
    title: "Silhouettes",
    airDate: "6 de mar. de 2022",
    rating: "7.2/10",
    description: "Jim, Tabitha e Ethan começam a fazer perguntas sobre onde estão, na esperança de que isso os leve de volta para casa. Ellis e Fatima mostram a Julie o lado mais leve da vida na cidade. Jade se esforça para entender sua situação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1rLiahUwbCJqNKI4wUhULUkSDpoH-YC9H"
  },
  {
    season: 1,
    episode: 6,
    title: "Book 74",
    airDate: "13 de mar. de 2022",
    rating: "7.3/10",
    description: "Boyd's plan to head off into the forest provokes an unexpected response from Kenny. Jade enlists Jim's help with an experiment while Tabitha makes a chilling discovery that sends her down a unique path searching for answers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1618609378039-b572f64c5b42?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1OlaHn4GQnRltnfV6Ngn6pAV7YmU-oplK"
  },
  {
    season: 1,
    episode: 7,
    title: "All Good Things...",
    airDate: "20 de mar. de 2022",
    rating: "8.3/10",
    description: "Uma comemoração na Colony House se transforma em tragédia. Khatri tenta convencer Boyd a levar ele e Sarah com ele.",
    thumbnailUrl: "https://images.unsplash.com/photo-1508349682734-1810459762a2?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1uyKhkLb68GEGT5O_AjqqgGLDiAQAWGQL"
  },
  {
    season: 1,
    episode: 8,
    title: "Broken Windows, Open Doors",
    airDate: "27 de mar. de 2022",
    rating: "7.7/10",
    description: "In the wake of another death, Boyd questions his decision to leave; Kenny steps up and embraces his new role; Jim rallies the town around his idea to build a radio tower.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "17BAhZLs4hskI8Ln98xx3iD0LD9rbhs07"
  },
  {
    season: 1,
    episode: 9,
    title: "Into the Woods",
    airDate: "3 de abr. de 2022",
    rating: "7.6/10",
    description: "Boyd takes Sara into the forest to find a way home, and they uncover more mysteries. Some of the townfolk wonder if they want to go home.",
    thumbnailUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1cm161_TGKOfhEBDFlvxsKie7FfuGDrif"
  },
  {
    season: 1,
    episode: 10,
    title: "Oh, the Places We'll Go",
    airDate: "10 de abr. de 2022",
    rating: "7.8/10",
    description: "Jim's radio tower yields consequences which rock him to his very core. The hole that Tabitha has been digging leads her somewhere - and to someone - she could never have expected. Everything is about to change.",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1n8CYtFTHFZgqv48zoAE32RP2FVNU8xFF"
  },

  // ==================== TEMPORADA 2 ====================
  {
    season: 2,
    episode: 1,
    title: "Strangers in a Strange Land",
    airDate: "23 de abr. de 2023",
    rating: "7.9/10",
    description: "Na ausência do xerife Boyd, Donna e Kenny se esforçam para administrar o caos quando um ônibus cheio de recém-chegados involuntários chega à cidade; Victor e Tabitha fazem uma viagem arrepiante pelo labirinto de pesadelos.",
    thumbnailUrl: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1qcqc0qvJKICh5dO89t6Ab7B0VQTJ8t4K"
  },
  {
    season: 2,
    episode: 2,
    title: "The Kindness of Strangers",
    airDate: "30 de abr. de 2023",
    rating: "7.9/10",
    description: "Uma noite tensa na lanchonete, enquanto os moradores e os recém-chegados esperam o nascer do sol; o medo permeia os destroços sob a casa dos Matthews, enquanto Jim e Tom lutam para manter em silêncio um passageiro de ônibus em pânico.",
    thumbnailUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1Ji3FFk0_nL-98BEDMOKsgnd-SzQWPgqJ"
  },
  {
    season: 2,
    episode: 3,
    title: "Tether",
    airDate: "7 de mai. de 2023",
    rating: "7.1/10",
    description: "Kenny e Ellis fazem uma descoberta terrível na floresta; Boyd luta contra a realidade do que está acontecendo com ele.",
    thumbnailUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1TpWQP7p-wICBJC06vRU4avFm-6-C69DX"
  },
  {
    season: 2,
    episode: 4,
    title: "This Way Gone",
    airDate: "14 de mai. de 2023",
    rating: "6.8/10",
    description: "As Boyd's condition grows more alarming, Sara's return to town puts him in a difficult position; Jim shares a troubling new theory about the town.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516214108703-de3b5da702f5?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "138C5ppkpyHSD4W9_AxUVJ50sOTpN0lTl"
  },
  {
    season: 2,
    episode: 5,
    title: "Lullaby",
    airDate: "21 de mai. de 2023",
    rating: "6.4/10",
    description: "Sara must face the music, as word of her return spreads through town; Victor and Jade strike an unlikely bargain.",
    thumbnailUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1W0BcH8LjM1DJs-sx1vyofUCk_LixAKs6"
  },
  {
    season: 2,
    episode: 6,
    title: "Pas de Deux",
    airDate: "28 de mai. de 2023",
    rating: "7.8/10",
    description: "Tensions run high at Colony House when word of the coming food shortage leaks out; a night at the clinic takes a terrifying turn.",
    thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1Nk35wIosHrVpQpu4ozTT1t-RRMOlGRx5"
  },
  {
    season: 2,
    episode: 7,
    title: "Belly of the Beast",
    airDate: "4 de jun. de 2023",
    rating: "7.1/10",
    description: "Boyd e Kristi tentam tirar proveito de uma nova descoberta; Jim encontra um aliado improvável no volátil Randall.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1E0OEiRvtHsIlQ-fFaXiHn2f2N4bkBI25"
  },
  {
    season: 2,
    episode: 8,
    title: "Forest for the Trees",
    airDate: "11 de jun. de 2023",
    rating: "7.3/10",
    description: "In their pursuit of the truth about the town, Jim and Randall hatch a dangerous plan; meanwhile, a new form of terror is brewing.",
    thumbnailUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1MeBFvV68uP_v5g5fu2oBheaILqWvUaJR"
  },
  {
    season: 2,
    episode: 9,
    title: "Ball of Magic Fire",
    airDate: "18 de jun. de 2023",
    rating: "7.6/10",
    description: "O pânico se espalha pela cidade quando os moradores enfrentam uma nova e assustadora ameaça à sua sobrevivência; Jim percebe a magnitude do erro que cometeu ao alistar Randall em sua causa.",
    thumbnailUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1-Jq4oN3FdFUrBaOFBIFmPMYdc3meKA1E"
  },
  {
    season: 2,
    episode: 10,
    title: "Once Upon a Time...",
    airDate: "25 de jun. de 2023",
    rating: "8.0/10",
    description: "Boyd teme que finalmente tenha ficado sem respostas, enquanto os moradores da cidade se preparam para o fim; Tabitha se apega à crença de que as crianças podem ser a chave para a salvação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "19Ys0NEZ9BGga4-8fGL2kVNgOFUEXsTc-"
  },

  // ==================== TEMPORADA 3 ====================
  {
    season: 3,
    episode: 1,
    title: "Shatter",
    airDate: "22 de set. de 2024",
    rating: "8.3/10",
    description: "Boyd sente que a cidade está se afastando dele à medida que o tempo fica mais frio e os moradores ficam mais desesperados.",
    thumbnailUrl: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1xb4HZ12LJF23zrqVINI4WPKtlnbX9icA"
  },
  {
    season: 3,
    episode: 2,
    title: "When We Go",
    airDate: "29 de set. de 2024",
    rating: "7.9/10",
    description: "Boyd se esforça para encontrar um caminho a seguir enquanto a cidade se despede de um dos seus. A saúde de Fátima piora, enquanto Tabitha encontra a ajuda de um aliado improvável.",
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1BughbXSGKEkoU6SFtxx4VPT9uPK9wzMx"
  },
  {
    season: 3,
    episode: 3,
    title: "Mouse Trap",
    airDate: "6 de out. de 2024",
    rating: "7.9/10",
    description: "Kenny leva um grupo para a floresta em busca de comida enquanto Donna e Ellis tentam convencer Boyd a não empreender um plano perigoso. Enquanto isso, Tabitha faz uma descoberta incrível.",
    thumbnailUrl: "https://images.unsplash.com/photo-1447005497901-b3e9ee359928?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "12twOYImWqxmd1L9UCyTJjtYrLZpvqZYG"
  },
  {
    season: 3,
    episode: 4,
    title: "There and Back Again",
    airDate: "13 de out. de 2024",
    rating: "8.3/10",
    description: "Boyd é forçado a tomar uma decisão difícil quando os recém-chegados chegam à cidade ao anoitecer; Victor descobre memórias do passado na esperança de encontrar respostas.",
    thumbnailUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1ZZBhE_wH8a_ce1VQ7As7o44PrkL6IrzA"
  },
  {
    season: 3,
    episode: 5,
    title: "The Light of Day",
    airDate: "20 de out. de 2024",
    rating: "7.3/10",
    description: "Victor deve enfrentar uma lembrança de seu passado; Julie busca lidar com seu trauma; Boyd se esforça para manter a cidade segura quando os moradores começam a questionar seu julgamento; Tabitha tenta se adaptar ao novo ambiente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1TsI7Ga6bQleN24M0gt7t7qtuEK2oLIPO"
  },
  {
    season: 3,
    episode: 6,
    title: "Scar Tissue",
    airDate: "27 de out. de 2024",
    rating: "6.7/10",
    description: "Fatima e Ellis tomam uma grande decisão sobre a gravidez; Boyd teme pelo futuro de sua família; as tensões aumentam na casa dos Matthews; Randall fala com Marielle sobre seus medos.",
    thumbnailUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1Y27A0fpcLwx7k-RAaeLWPmu-SWQZSIoN"
  },
  {
    season: 3,
    episode: 7,
    title: "These Fragile Lives",
    airDate: "3 de nov. de 2024",
    rating: "5.9/10",
    description: "Os limites começam a se enfraquecer à medida que a preocupação com a gravidez de Fátima aumenta; Jade segue um caminho que leva à floresta; Julie e Randall buscam um pouco de normalidade.",
    thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1e6ZgsmBuqQz1BbXNyCrHhwdhBCjLo5Sb"
  },
  {
    season: 3,
    episode: 8,
    title: "Thresholds",
    airDate: "10 de nov. de 2024",
    rating: "6.9/10",
    description: "Acusações e verdades vêm à tona após uma tragédia; Victor se esforça para recuperar memórias há muito enterradas do passado da cidade; Julie e Ethan buscam respostas sobre as misteriosas ruínas da floresta.",
    thumbnailUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1l8z9UpyIuEPVw9b2KGa2pYYNqHIkbDmH"
  },
  {
    season: 3,
    episode: 9,
    title: "Revelations: Chapter One",
    airDate: "17 de nov. de 2024",
    rating: "6.7/10",
    description: "As tensões aumentam quando os moradores da cidade descobrem que um dos seus desapareceu.",
    thumbnailUrl: "https://images.unsplash.com/photo-1485470733090-0a31655e757a?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "1YPsXauYJ9bRUPhEulNyogGMYR9lFwdJ4"
  },
  {
    season: 3,
    episode: 10,
    title: "Revelations: Chapter Two",
    airDate: "24 de nov. de 2024",
    rating: "8.2/10",
    description: "No final da temporada, Boyd é levado ao limite quando o tempo começa a se esgotar para alguém que ele ama. A jornada improvável de Tabitha toma um rumo surpreendente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=320&q=80",
    provider: "gdrive",
    fileId: "19brcP8eCERU4HpwnQNCDZFIaWj3fLXeg"
  }
];

export const FROM_EPISODES: Episode[] = RAW_EPISODES.map((ep) => {
  // Use the official, high-quality TMDB banner of the respective season of "From" (Origem)
  let officialBanner = "";
  if (ep.season === 1) {
    officialBanner = "https://image.tmdb.org/t/p/w780/7v6gXgK5D3Lq1mXmO164T5EreX0.jpg";
  } else if (ep.season === 2) {
    officialBanner = "https://image.tmdb.org/t/p/w780/8Vst61A1x34KjY99g9v2mXg1W0P.jpg";
  } else if (ep.season === 3) {
    officialBanner = "https://image.tmdb.org/t/p/w780/r9WpT2Lp3l7qA39Sj1EonF9XvC0.jpg";
  } else {
    officialBanner = "https://image.tmdb.org/t/p/w780/7v6gXgK5D3Lq1mXmO164T5EreX0.jpg";
  }

  return {
    ...ep,
    thumbnailUrl: officialBanner
  };
});
