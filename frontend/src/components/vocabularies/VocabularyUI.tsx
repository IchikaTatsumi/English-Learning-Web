'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid3X3, List, Leaf, Gamepad2, Cloud, Utensils, Cpu, Zap, BookOpen, Loader2 } from 'lucide-react';
import { LoudSpeakerButton } from '@/components/buttons/LoudSpeakerButton';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { DifficultyLevel } from '@/lib/constants/enums';

export function VocabularyUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTopicId, setFilterTopicId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  const { topics, fetchTopics, isLoading: topicsLoading } = useTopics();
  
  // Hook lấy dữ liệu từ vựng
  const { vocabularies, fetchVocabularies, isLoading: vocabLoading } = useVocabularies();

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // ✅ FETCH DỮ LIỆU: Chỉ gọi lại khi Filter thay đổi, không phụ thuộc vào searchTerm (lọc tại client)
  useEffect(() => {
    fetchVocabularies({
      topic_id: filterTopicId,
      difficulty_level: filterDifficulty !== 'all' ? (filterDifficulty as DifficultyLevel) : undefined,
    });
  }, [filterTopicId, filterDifficulty, fetchVocabularies]);

  // ✅ LỌC DỮ LIỆU TẠI CLIENT: Tránh treo web khi gõ tìm kiếm
  const filteredWords = useMemo(() => {
    if (!vocabularies) return [];
    return vocabularies.filter(word => {
      const matchesSearch = word.word?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           word.meaning_en?.toLowerCase().includes(searchTerm.toLowerCase());
      const topicName = word.topic_name || word.topic?.topic_name || '';
      const matchesTab = activeTab === 'all' || topicName === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [vocabularies, searchTerm, activeTab]);

  const getCategoryIcon = useCallback((name: string) => {
    const icons: Record<string, any> = { 'Animals': Zap, 'Nature': Leaf, 'Food': Utensils, 'Technology': Cpu };
    const Icon = icons[name] || BookOpen;
    return <Icon className="h-4 w-4" />;
  }, []);

  if (topicsLoading || vocabLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Đang tải từ vựng...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topics.map(topic => (
          <Card 
            key={topic.topic_id} 
            className={`cursor-pointer transition-all ${filterTopicId === topic.topic_id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            onClick={() => setFilterTopicId(prev => prev === topic.topic_id ? undefined : topic.topic_id)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">{getCategoryIcon(topic.topic_name)}</div>
              <h3 className="text-sm font-bold">{topic.topic_name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm nhanh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
              <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
              <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md p-1 gap-1">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredWords.map((word) => (
          <Card key={word.vocab_id} className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  {word.word}
                  <LoudSpeakerButton vocabId={word.vocab_id} audioPath={word.audio_path} className="h-6 w-6" />
                </span>
                <Badge variant="secondary" className="text-[10px]">{word.difficulty_level}</Badge>
              </CardTitle>
              <p className="text-sm font-mono text-blue-600">{word.ipa}</p>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{word.meaning_en}</p>
              <p className="text-sm text-blue-600">{word.meaning_vi}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}