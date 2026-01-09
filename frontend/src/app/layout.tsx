import type { Metadata } from 'next';
import '../styles/global.css';
import { AppProviders } from './AppProviders'; // ✅ Import Provider
import { Toaster } from '@/components/ui/toaster'; // ✅ Import Toaster (nếu bạn dùng shadcn/ui) hoặc component hiển thị toast tương ứng

export const metadata: Metadata = {
  title: 'FastLearning - English Vocabulary Learning',
  description: 'Learn English vocabulary with interactive quizzes and progress tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Bọc toàn bộ app bằng Provider */}
        <AppProviders>
          {children}
          <Toaster /> {/* ✅ Nơi hiển thị thông báo popup */}
        </AppProviders>
      </body>
    </html>
  );
}