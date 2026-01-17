// src/components/learned/LearnedUI.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trophy, BookOpen, Grid3X3, List, Loader2, BookmarkCheck } from 'lucide-react';
import { useVocabularyProgress } from '@/features/vocabulary-progress/hooks/vocabulary-progress.hook';
import { VocabularyCard } from '@/components/VocabularyCard'; 

export function LearnedUI() {
  const { learnedVocabularies, fetchLearnedVocabularies, isLoading } = useVocabularyProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchLearnedVocabularies();
  }, [fetchLearnedVocabularies]);

  const filteredList = useMemo(() => {
    let list = learnedVocabularies.filter(item => {
      const vocab = item.vocabulary;
      if (!vocab) return false;
      const matchesSearch = vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            vocab.meaning_en.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = filterDifficulty === 'all' || vocab.difficulty_level === filterDifficulty;
      return matchesSearch && matchesDifficulty;
    });
    if (sortBy === 'alphabetical') list.sort((a, b) => a.vocabulary.word.localeCompare(b.vocabulary.word));
    return list;
  }, [learnedVocabularies, searchTerm, filterDifficulty, sortBy]);

  if (isLoading) return <div className="p-8 flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-900">Learned Words</h1>
          <p className="text-gray-600">Danh sách từ vựng bạn đã đánh dấu hoàn thành</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl"><Trophy className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng số từ đã học</p>
              <p className="text-3xl font-bold text-blue-900">{learnedVocabularies.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl"><BookOpen className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm font-medium text-green-600">Trạng thái</p>
              <p className="text-3xl font-bold text-green-900">{learnedVocabularies.length > 0 ? 'Đang tiến bộ' : 'Chưa có dữ liệu'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Tìm kiếm trong từ đã học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Độ khó" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4"/></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
          </div>
        </CardContent>
      </Card>

      {filteredList.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {filteredList.map((item) => (
            <VocabularyCard
              key={item.vocabulary.vocab_id}
              vocabulary={{
                id: item.vocabulary.vocab_id,
                word: item.vocabulary.word,
                meaningEn: item.vocabulary.meaning_en,
                meaningVi: item.vocabulary.meaning_vi,
                ipa: item.vocabulary.ipa,
                topicName: item.vocabulary.topic?.topic_name,
                difficultyLevel: item.vocabulary.difficulty_level
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <BookmarkCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có từ vựng nào trong danh sách đã học.</p>
        </div>
      )}
    </div>
  );
}