'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Leaf, Cloud, Utensils, Cpu, Zap, BookOpen, Gamepad2 } from 'lucide-react';
import { AddButton } from '@/components/buttons/AddButton';
import { BookmarkButton } from '@/components/buttons/BookmarkButton';
import { LoudspeakerButton } from '@/components/buttons/LoudspeakerButton';
import { ViewModeButton, ViewMode } from '@/components/buttons/ViewModeButton';
import { MicroRecordingButton } from '@/components/buttons/MicroRecordingButton';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { useAuth } from '@/features/auth/hooks/auth.hook';
import { Role, DifficultyLevel } from '@/lib/constants/enums';

export function VocabularyUI() {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTopicId, setFilterTopicId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState('all');

  const { topics, fetchTopics, isLoading: topicsLoading } = useTopics();
  
  // ✅ FIXED: Pass correct filter parameters
  const { vocabularies, fetchVocabularies, isLoading: vocabLoading } = useVocabularies({
    topic_id: filterTopicId,
    // ✅ FIXED: Use difficulty_level instead of difficulty
    difficulty_level: filterDifficulty !== 'all' ? filterDifficulty as DifficultyLevel : undefined,
    searchTerm: searchTerm || undefined
  });

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    fetchVocabularies();
  }, [filterTopicId, filterDifficulty, searchTerm, fetchVocabularies]);

  // Filter by active tab
  const filteredWords = vocabularies.filter(word => {
    if (activeTab === 'all') return true;
    // ✅ FIXED: Use topic_name (optional) or topic.topic_name
    const topicName = word.topic_name || word.topic?.topic_name || '';
    return topicName === activeTab;
  });

  const getCategoryIcon = (topicName: string) => {
    const iconMap: Record<string, any> = {
      'Animals': Zap,
      'Nature': Leaf,
      'Food': Utensils,
      'Weather': Cloud,
      'Daily Activities': Gamepad2,
      'Technology': Cpu,
      'Education': BookOpen,
    };
    const Icon = iconMap[topicName] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Advanced': 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  const handleBookmarkToggle = async (vocabId: number, isBookmarked: boolean) => {
    console.log('Toggle bookmark:', vocabId, isBookmarked);
    // TODO: Call API to toggle bookmark
    // await vocabularyService.toggleBookmark(vocabId, isBookmarked);
    // fetchVocabularies(); // Refresh list
  };

  const handlePronunciationResult = (result: any) => {
    console.log('Pronunciation result:', result);
    // TODO: Handle pronunciation result
    // - Show score notification
    // - Update progress
    // - Save to results table
  };

  const handleAddVocab = () => {
    console.log('Add vocabulary');
    // TODO: Open dialog to add vocabulary (Admin only)
  };

  if (topicsLoading || vocabLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading vocabularies...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vocabulary Learning</h1>
          <p className="text-gray-600">Explore words by topic and build your vocabulary</p>
        </div>
        {isAdmin && (
          <AddButton onClick={handleAddVocab} label="Add Vocabulary" />
        )}
      </div>

      {/* Topic Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topics.map(topic => {
          const topicWords = vocabularies.filter(v => v.topic_id === topic.topic_id);
          const isActive = filterTopicId === topic.topic_id;
          
          return (
            <Card 
              key={topic.topic_id} 
              className={`cursor-pointer transition-all ${
                isActive 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setFilterTopicId(isActive ? undefined : topic.topic_id)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  {getCategoryIcon(topic.topic_name)}
                </div>
                <h3 className="text-sm font-medium mb-1">{topic.topic_name}</h3>
                <p className="text-xs text-gray-600">{topicWords.length} words</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            {topics.slice(0, 3).map(topic => (
              <TabsTrigger key={topic.topic_id} value={topic.topic_name} className="flex items-center gap-1">
                {getCategoryIcon(topic.topic_name)}
                <span className="hidden sm:inline">{topic.topic_name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ViewModeButton mode={viewMode} onModeChange={setViewMode} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
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
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filterTopicId?.toString() || 'all'} 
                onValueChange={(val) => setFilterTopicId(val === 'all' ? undefined : parseInt(val))}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic.topic_id} value={topic.topic_id.toString()}>
                      {topic.topic_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {/* Word Cards */}
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {filteredWords.map((vocab) => {
              // ✅ FIXED: Get topic name from multiple sources
              const topicName = vocab.topic_name || vocab.topic?.topic_name || 'Unknown';
              // ✅ FIXED: Use audio_path (null) or audio_path || null
              const audioPath = vocab.audio_path || null;
              // ✅ FIXED: Use is_learned with default false
              const isLearned = vocab.is_learned || false;
              
              return (
                <Card key={vocab.vocab_id} className="hover:shadow-lg transition-shadow">
                  {viewMode === 'grid' ? (
                    <>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-xl">
                              {vocab.word}
                              <LoudspeakerButton 
                                audioPath={audioPath}
                                word={vocab.word}
                                size="sm"
                              />
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{vocab.ipa || ''}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookmarkButton
                              vocabId={vocab.vocab_id}
                              isBookmarked={isLearned}
                              onToggle={handleBookmarkToggle}
                            />
                            <MicroRecordingButton
                              vocabId={vocab.vocab_id}
                              targetWord={vocab.word}
                              onResult={handlePronunciationResult}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Definition:</p>
                          <p className="text-gray-700">{vocab.meaning_en}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nghĩa tiếng Việt:</p>
                          <p className="text-sm text-blue-600">{vocab.meaning_vi}</p>
                        </div>
                        {vocab.example_sentence && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Example:</p>
                            <p className="text-sm italic">{vocab.example_sentence}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <Badge className={getDifficultyColor(vocab.difficulty_level)}>
                            {vocab.difficulty_level}
                          </Badge>
                          <Badge variant="outline">{topicName}</Badge>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{vocab.word}</h3>
                          <LoudspeakerButton 
                            audioPath={audioPath}
                            word={vocab.word}
                            size="sm"
                          />
                          <span className="text-sm text-gray-500">{vocab.ipa || ''}</span>
                          <Badge className={getDifficultyColor(vocab.difficulty_level)} variant="secondary">
                            {vocab.difficulty_level}
                          </Badge>
                          <Badge variant="outline">{topicName}</Badge>
                        </div>
                        <p className="text-gray-700 mb-1">{vocab.meaning_en}</p>
                        <p className="text-sm text-blue-600 mb-1">{vocab.meaning_vi}</p>
                        {vocab.example_sentence && (
                          <p className="text-sm text-gray-600 italic mt-2">"{vocab.example_sentence}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <BookmarkButton
                          vocabId={vocab.vocab_id}
                          isBookmarked={isLearned}
                          onToggle={handleBookmarkToggle}
                        />
                        <MicroRecordingButton
                          vocabId={vocab.vocab_id}
                          targetWord={vocab.word}
                          onResult={handlePronunciationResult}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No words found matching your criteria.</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}