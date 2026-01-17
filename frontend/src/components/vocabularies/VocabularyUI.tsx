'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { useVocabularyProgress } from '@/features/vocabulary-progress/hooks/vocabulary-progress.hook';
// Thay Mic bằng Bookmark
import { Search, Bookmark, Grid3X3, List, Leaf, Gamepad2, Cloud, Utensils, Cpu, Zap, BookOpen, Loader2 } from 'lucide-react';
import { toast } from '@/lib/utils/toast';

export function VocabularyUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { topics, isLoading: topicsLoading } = useTopics();
  const { vocabularies, isLoading: vocabLoading } = useVocabularies({
    difficulty_level: filterDifficulty !== 'all' ? (filterDifficulty as any) : undefined,
  });

  // Lấy hàm updateProgress từ hook để lưu vào danh sách Learned
  const { updateVocabularyProgress } = useVocabularyProgress();

  const filteredWords = useMemo(() => {
    return vocabularies.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           word.meaning_en.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || word.topic_name === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [vocabularies, searchTerm, activeTab]);

  const getCategoryIcon = (topicName: string) => {
    const iconMap: Record<string, any> = {
      'Animals': Zap, 'Nature': Leaf, 'Food': Utensils,
      'Weather': Cloud, 'Daily Activities': Gamepad2,
      'Colors': Cpu, 'Numbers': BookOpen,
    };
    const Icon = iconMap[topicName] || Grid3X3;
    return <Icon className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Logic lưu từ vựng vào danh sách "Learned"
  const handleMarkAsLearned = async (vocabId: number, word: string) => {
    try {
      await updateVocabularyProgress({
        vocab_id: vocabId,
        is_learned: true
      });
      toast.success(`Đã thêm "${word}" vào danh sách từ đã học!`);
    } catch (error) {
      toast.error("Không thể lưu từ vựng này.");
    }
  };

  if (topicsLoading || vocabLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu học tập...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-900">Vocabulary Library</h1>
          <p className="text-gray-600">Khám phá từ mới và lưu chúng vào bộ sưu tập của bạn</p>
        </div>
      </div>

      {/* Topic Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topics.map(topic => (
          <Card 
            key={topic.topic_id} 
            className={`cursor-pointer hover:border-blue-500 transition-all ${activeTab === topic.topic_name ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : ''}`}
            onClick={() => setActiveTab(topic.topic_name)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2 text-blue-600">
                {getCategoryIcon(topic.topic_name)}
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider">{topic.topic_name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trình độ</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button variant={viewMode === 'grid' ? 'white' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'white' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredWords.map((word) => (
            <Card key={word.vocab_id} className="group hover:shadow-md transition-all border-t-2 border-t-transparent hover:border-t-blue-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      {word.word}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="text-sm font-mono text-blue-600">{word.ipa}</p>
                      {/* Thẻ Topic hiển thị bên cạnh thẻ trình độ */}
                      <Badge className={getDifficultyColor(word.difficulty_level)} variant="outline">
                        {word.difficulty_level}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                        {word.topic_name}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Nút Bookmark để lưu vào Learned */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                    onClick={() => handleMarkAsLearned(word.vocab_id, word.word)}
                    title="Lưu vào từ đã học"
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">{word.meaning_en}</p>
                  <p className="text-sm text-gray-500">{word.meaning_vi}</p>
                  {word.example_sentence && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border-l-2 border-blue-200 italic text-sm text-gray-600">
                      "{word.example_sentence}"
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}