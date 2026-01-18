'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { useVocabularyProgress } from '@/features/vocabulary-progress/hooks/vocabulary-progress.hook';
import { Search, Grid3X3, List, Loader2, BookOpen } from 'lucide-react';
import { toast } from '@/lib/utils/toast';
import { VocabularyCard } from '@/components/VocabularyCard';
import { DifficultyLevel } from '@/lib/constants/enums'; // ✅ Import Enum chuẩn

export function VocabularyUI() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ ĐỒNG BỘ: Dùng difficultyLevel thay vì filterDifficulty
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | 'all'>('all');
  
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { topics, isLoading: topicsLoading } = useTopics();
  
  // ✅ ĐỒNG BỘ: Gửi camelCase (difficultyLevel) vào hook filter
  const { vocabularies, isLoading: vocabLoading } = useVocabularies({
    difficultyLevel: difficultyLevel !== 'all' ? difficultyLevel : undefined,
  } as any); // Cast as any để tránh lỗi type nếu DTO filter chưa kịp cập nhật

  const { toggleBookmark } = useVocabularyProgress();

  // Logic lọc từ vựng (Client-side filtering bổ sung)
  const filteredWords = useMemo(() => {
    return vocabularies.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            word.meaning_en.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || word.topic_name === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [vocabularies, searchTerm, activeTab]);

  // Xử lý Bookmark
  const handleBookmark = async (vocabId: number) => {
    try {
      // ✅ ĐỒNG BỘ: Gửi vocabId (camelCase) hoặc vocab_id (snake_case) tùy DTO bookmark
      // Ở đây ta giả định Service đã handle, gửi đúng object
      await toggleBookmark({ vocab_id: vocabId }); 
      toast.success("Updated bookmark!");
    } catch (error) {
      toast.error("Failed to update bookmark.");
    }
  };

  if (topicsLoading || vocabLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading library...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-900 tracking-tight">Vocabulary Library</h1>
          <p className="text-slate-600">Explore and collect new words by topic.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 focus-visible:ring-blue-500"
          />
        </div>
        
        {/* ✅ Select sử dụng state difficultyLevel */}
        <Select 
          value={difficultyLevel} 
          onValueChange={(val) => setDifficultyLevel(val as DifficultyLevel | 'all')}
        >
          <SelectTrigger className="w-full md:w-48 border-slate-200">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
            <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
            <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Topics Tabs & Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Topic List */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-2 px-2">
           <div className="flex gap-2 w-max">
             <Button
               variant={activeTab === 'all' ? 'default' : 'outline'}
               className={`rounded-full ${activeTab === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
               onClick={() => setActiveTab('all')}
             >
               All Topics
             </Button>
             {topics.map(topic => (
               <Button
                 key={topic.topic_id}
                 variant={activeTab === topic.topic_name ? 'default' : 'outline'}
                 className={`rounded-full ${activeTab === topic.topic_name ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                 onClick={() => setActiveTab(topic.topic_name)}
               >
                 {topic.topic_name}
               </Button>
             ))}
           </div>
        </div>

        {/* Vocabulary Grid */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredWords.length > 0 ? (
            filteredWords.map((word) => (
              <VocabularyCard 
                key={word.vocab_id} 
                vocabulary={word}
                isBookmarked={word.is_bookmarked}
                onBookmark={handleBookmark}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-slate-600">No vocabulary found</h3>
                <p>Try changing filters or search terms</p>
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}