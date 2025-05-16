export type UserMetadata = {
  full_name?: string
  user_name?: string
  avatar_url?: string
}

export type Database = {
  public: {
    Tables: {
      parties: {
        Row: {
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
      }
      speakers: {
        Row: {
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
      }
      statements: {
        Row: {
          id: string
          title: string
          content: string
          speaker_id: string
          party_id: number | null
          statement_date: string | null
          image_path: string | null
          video_path: string | null
          video_thumbnail_path: string | null
          evidence_url: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

export interface PartySupportRate {
  id: number;
  year: number;
  month: number;
  party_name: string;
  attribute_type: string; // 'gender' | 'age_group' | 'total'
  attribute_value: string; // '男性' | '女性' | '18～39歳' | '全体' など
  support_rate: number;
  created_at: string;
}