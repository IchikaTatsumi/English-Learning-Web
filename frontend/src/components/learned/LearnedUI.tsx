'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trophy, BookOpen, Gamepad2, Grid3X3, List, Loader2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ✅ Import Hook đúng
import { useVocabularyProgress } from '@/features/vocabulary-progress/hooks/vocabulary-progress.hook';
import { VocabularyCard } from '@/components/VocabularyCard'; 

export function LearnedUI() {
  const router = useRouter();
  
  // ✅ 1. Sử dụng hook vocabulary progress
  const { 
    learnedVocabularies, 
    fetchLearnedVocabularies, 
    isLoading 
  } = useVocabularyProgress();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ✅ 2. Fetch dữ liệu khi vào trang
  useEffect(() => {
    fetchLearnedVocabularies();
  }, [fetchLearnedVocabularies]);

  // ✅ 3. Logic lọc từ vựng
  const filteredList = learnedVocabularies.filter(item => {
    const vocab = item.vocabulary; // Dữ liệu backend trả về object lồng nhau
    if (!vocab) return false;

    const matchesSearch = vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vocab.meaning_en.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = filterDifficulty === 'all' || 
                              vocab.difficulty_level === filterDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  const handlePractice = () => {
    router.push('/main/quiz'); // Chuyển hướng đúng
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2 font-bold">Learned Words</h1>
          <p className="text-gray-600">Review your mastered vocabulary</p>
        </div>
        <Button onClick={handlePractice} className="bg-green-600 hover:bg-green-700">
          <Gamepad2 className="mr-2 h-4 w-4" /> Practice Now
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Trophy className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Learned</p>
              <p className="text-2xl font-bold">{learnedVocabularies.length}</p>
            </div>
          </CardContent>
        </Card>
        {/* ... Các card stats khác tương tự ... */}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search learned words..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
             <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4"/></Button>
             <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ 4. Hiển thị danh sách từ vựng */}
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
                audioPath: item.vocabulary.audio_path
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No words found. Start learning to build your collection!</p>
        </div>
      )}
    </div>
  );
}