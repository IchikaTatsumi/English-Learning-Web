// src/components/vocabularies/VocabularyUI.tsx
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // TabsContent không cần dùng trực tiếp
import { Search, Volume2, Bookmark, Check, Grid3X3, List, Leaf, Gamepad2, Cloud, Utensils, Cpu, Zap } from 'lucide-react';
// Import DTOs và Services
import { VocabularyDto } from '@/features/vocabularies/dtos/vocabulary.dto';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';

// Mock data tạm thời để đảm bảo component chạy
const mockTopics = [
    { id: 1, name: 'Animals', learnedWords: 2, totalWords: 5 },
    { id: 2, name: 'Nature', learnedWords: 1, totalWords: 3 },
    { id: 3, name: 'Food', learnedWords: 1, totalWords: 3 },
    { id: 4, name: 'Weather', learnedWords: 0, totalWords: 3 },
    { id: 5, name: 'Sports', learnedWords: 0, totalWords: 3 },
    { id: 6, name: 'Technology', learnedWords: 0, totalWords: 3 },
];

export function VocabularyUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sử dụng hook để fetch data (Giả lập)
  const filter = useMemo(() => ({
    searchTerm: searchTerm,
    difficulty: filterDifficulty !== 'all' ? filterDifficulty : undefined,
    topicId: activeTab !== 'all' ? parseInt(activeTab) : undefined,
  }), [searchTerm, filterDifficulty, activeTab]);
  
  const { vocabularies, fetchVocabularies, markAsLearned, isLoading } = useVocabularies(filter);
  const { topics, fetchTopics } = useTopics(); // Giả lập hook này trả về mockTopics

  // Giả lập effect hook
  // useEffect(() => { fetchVocabularies(); fetchTopics(); }, [fetchVocabularies, fetchTopics]); 

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Animals': return <Zap className="h-4 w-4" />;
      case 'Nature': return <Leaf className="h-4 w-4" />;
      case 'Food': return <Utensils className="h-4 w-4" />;
      case 'Weather': return <Cloud className="h-4 w-4" />;
      case 'Sports': return <Gamepad2 className="h-4 w-4" />;
      case 'Technology': return <Cpu className="h-4 w-4" />;
      default: return <Grid3X3 className="h-4 w-4" />;
    }
  };

  const toggleLearned = (wordId: number) => {
    // Gọi service markAsLearned (Giả lập)
    markAsLearned(wordId.toString());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case 'A1':
      case 'A2': return 'bg-green-100 text-green-700';
      case 'B1':
      case 'B2': return 'bg-yellow-100 text-yellow-700';
      case 'C1': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const activeTopics = topics.length > 0 ? topics : mockTopics; // Fallback to mock

  return (
    <div className="p-8 space-y-6">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl mb-2">Vocabulary Learning</h1>
        <p className="text-gray-600">Explore words by category and build your vocabulary</p>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {activeTopics.map(topic => {
          const progressPercent = topic.totalWords > 0 ? (topic.learnedWords / topic.totalWords) * 100 : 0;
          return (
            <Card key={topic.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(topic.id.toString())}>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  {getCategoryIcon(topic.name)}
                </div>
                <h3 className="text-sm mb-1">{topic.name}</h3>
                <p className="text-xs text-gray-600">{topic.learnedWords}/{topic.totalWords} learned</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/*  */}

      {/* Category Tabs and View Toggle */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-7 lg:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            {activeTopics.map(topic => (
              <TabsTrigger key={topic.id} value={topic.id.toString()} className="flex items-center gap-1">
                {getCategoryIcon(topic.name)}
                <span className="hidden sm:inline">{topic.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search words or definitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="A1">A1 (Beginner)</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1 (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Word Display (Grid/List) */}
        <div className={viewMode === 'grid' ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
          "space-y-4"
        }>
          {isLoading && <div>Loading vocabularies...</div>}
          {vocabularies.map((word) => {
            const topic = activeTopics.find(t => t.id === word.topicId);
            return (
              <Card key={word.id} className={`hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'p-4' : ''
              }`}>
                {viewMode === 'grid' ? (
                  <>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {word.word}
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{word.pronunciation}</p>
                          <p className="text-sm text-blue-600 mt-1">{word.partOfSpeech}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={word.isLearned ? "default" : "outline"}
                          onClick={() => toggleLearned(word.id)}
                          className="h-8"
                        >
                          {word.isLearned ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-700">{word.definition}</p>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm italic">{word.example}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(word.difficulty)}>{word.difficulty}</Badge>
                        <Badge variant="outline">{topic?.name || 'General'}</Badge>
                      </div>
                      {word.isLearned && word.lastReviewed && (
                        <p className="text-xs text-gray-500">
                          Last reviewed: {new Date(word.lastReviewed).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3>{word.word}</h3>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <span className="text-sm text-gray-500">{word.pronunciation}</span>
                        <Badge className={getDifficultyColor(word.difficulty)} variant="secondary">
                          {word.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">{word.definition}</p>
                      <p className="text-sm text-gray-600 italic">{word.example}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={word.isLearned ? "default" : "outline"}
                      onClick={() => toggleLearned(word.id)}
                      className="ml-4"
                    >
                      {word.isLearned ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {vocabularies.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No words found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
      </Tabs>
    </div>
  );
}