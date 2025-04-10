import { use } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import TopicDetailClient from './TopicDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TopicDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>
      <TopicDetailClient tagId={resolvedParams.id} />
      <Footer />
    </div>
  );
}

