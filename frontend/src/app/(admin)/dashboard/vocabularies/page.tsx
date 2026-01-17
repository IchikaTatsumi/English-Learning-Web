'use client';

import { VocabularyUI } from '@/components/vocabularies/VocabularyUI';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminVocabulariesPreviewPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vocabulary Preview</h1>
        <p className="text-gray-600">Xem giao diện học tập thực tế của người dùng từ góc độ Admin</p>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {/* Tái sử dụng component UI dành cho người học */}
          <VocabularyUI />
        </CardContent>
      </Card>
    </div>
  );
}