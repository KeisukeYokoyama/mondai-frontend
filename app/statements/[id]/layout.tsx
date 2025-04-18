import type { Metadata } from 'next'
import { statementAPI } from '@/utils/supabase/statements';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ArticleJsonLd from '@/components/ArticleJsonLd';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getStatementData(id: string) {
  const { data: statement } = await statementAPI.getDetail(id);
  return statement;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const statement = await getStatementData(resolvedParams.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mondai-hatsugen.com';
  const currentUrl = `${baseUrl}/statements/${resolvedParams.id}`;
  
  // 画像URLの生成
  let imageUrl = `${baseUrl}/images/default-statement.png`;
  if (statement?.image_path) {
    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/statements/${statement.image_path}`;
  } else if (statement?.video_thumbnail_path) {
    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video-thumbnails/${statement.video_thumbnail_path}`;
  }
  
  return {
    title: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name} が ${statement.title} という発言をしました。` : '問題発言ドットコム',
    description: statement ? `${statement.content}` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
    alternates: {
      canonical: currentUrl
    },
    openGraph: {
      title: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name} が ${statement.title} という発言をしました。` : '問題発言ドットコム',
      description: statement ? `${statement.content}` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name} が ${statement.title} という発言をしました。` : '問題発言ドットコム',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name} が ${statement.title} という発言をしました。` : '問題発言ドットコム',
      description: statement ? `${statement.content}` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
      images: [imageUrl],
    }
  }
}

export default async function Layout({
  params,
  children,
}: Props) {
  const resolvedParams = await params;
  const statement = await getStatementData(resolvedParams.id);
  const statementTitle = statement ? statement.title : '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mondai-hatsugen.com';
  const currentUrl = `${baseUrl}/statements/${resolvedParams.id}`;
  const imageUrl = statement?.image_path ? 
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/statements/${statement.image_path}` :
    `${baseUrl}/images/default-statement.png`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '問題発言一覧', item: '/statements' },
          { name: statementTitle, item: `/statements/${resolvedParams.id}` },
        ]}
      />
      {statement && (
        <ArticleJsonLd
          headline={statement.title}
          image={imageUrl}
          datePublished={statement.statement_date || statement.created_at}
          dateModified={statement.updated_at || statement.created_at}
          authorName={`${statement.speaker?.last_name}${statement.speaker?.first_name}`}
          description={statement.content}
          url={currentUrl}
        />
      )}
      {children}
    </>
  );
}
