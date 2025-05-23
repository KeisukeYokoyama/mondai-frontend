export interface Speaker {
  id: string
  speaker_type: number
  last_name: string
  first_name: string
  last_name_kana: string | null
  first_name_kana: string | null
  birthday: string | null
  age: string | null
  gender: string | null
  party_id: number | null
  prefecture_id: number | null
  city_id: number | null
  district: string | null
  chamber: string | null
  election_result: string | null
  position: string | null
  biography: string | null
  official_url: string | null
  facebook_url: string | null
  twitter_url: string | null
  youtube_url: string | null
  line_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  image_path: string | null
  created_at: string
  updated_at: string
}

export interface PaginationParams {
  page?: number
  per_page?: number
}

export interface SpeakerWithRelations extends Omit<Speaker, 'party_id' | 'prefecture_id' | 'city_id'> {
  parties: Party;
  prefectures: Prefecture;
  cities: City;
  statements?: Statement[];
}

export interface Party {
  id: number
  uuid: string
  name: string
  abbreviation: string | null
  order: number
  parent_id: number | null
  leader_name: string | null
  description: string | null
  founded_date: string | null
  dissolved_date: string | null
  official_website: string | null
  twitter_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  created_at: string
  updated_at: string
}

export interface PartyDetail extends Party {
  // 追加のプロパティはありません
}

export interface Statement {
  id: string;
  title: string;
  content: string;
  speaker_id: string;
  party_id?: number;
  statement_date: string | null;
  image_path: string | null;
  video_path: string | null;
  video_thumbnail_path?: string | null;
  evidence_url?: string | null;
  media_url?: string;
  thumbnail_url?: string;
  source_url?: string;
  fact_check_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  statement_tag?: StatementTag[];
  tags: StatementTag[];
  related_speakers?: SpeakerWithRelations[];
}

export interface StatementWithRelations extends Omit<Statement, 'related_speakers'> {
  speaker: SpeakerWithRelations;
  tags: StatementTag[];
  related_speakers: SpeakerWithRelations[];
  video_thumbnail_path?: string | null;
}

export interface Tag {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface StatementTag {
  tags: {
    id: number;
    name: string;
  };
}

// 共通の型
export interface WithPagination<T> {
  data: T[]
  count: number
}

// 検索用のパラメータ型
export interface SearchSpeakerParams {
  s?: string;
  chamber?: string;
  gender?: string;
  party_id?: string;
  prefecture_id?: string;
  speaker_type?: number;
  per_page?: number;
  page?: number;
}

export interface SearchStatementParams {
  query?: string
  speaker_id?: string
  tag_id?: number
  page?: number
  limit?: number
}

export interface Region {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Prefecture {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface City {
  id: number
  name: string
  prefecture_id: number
  created_at: string
  updated_at: string
}

// 検索レスポンスの型を追加
export interface SearchResponse<T = any> {
  data: T[];
  total: number;
}

export interface Commentator {
  id: string;
  speaker_type: number;
  last_name: string;
  first_name: string;
  last_name_kana: string | null;
  first_name_kana: string | null;
  age: string | null;
  gender: string | null;
  biography: string | null;
  image_path: string | null;
  official_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  line_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommentatorWithStatements extends Commentator {
  statements?: Statement[];
}

export interface SearchCommentatorParams {
  s?: string;
  gender?: string;
  speaker_type?: string;
  page?: number;
  per_page?: number;
}
