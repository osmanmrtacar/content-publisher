export interface DiscordBody {
    token: string;
    type: number;
    data: DiscordInteraction;
  }
  
  export interface DiscordInteraction {
    guild_id: string;
    id: string;
    name: string;
    options: Option[];
    type: number;
  }
  
  export interface Option {
    name: string;
    type: number;
    value: string;
    options: Option[];
  }

  export interface Option {
    name: string;
    type: number;
    value: string;
  }

 export interface InstagramContent {
    imageUrl?: string;
    caption?: string;
  }