'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { AddButton } from '@/components/buttons/AddButton';
import { BookmarkButton } from '@/components/buttons/BookmarkButton';
import { LoudspeakerButton } from '@/components/buttons/LoudspeakerButton';
import { ViewModeButton, ViewMode } from '@/components/buttons/ViewModeButton';
import { MicroRecordingButton } from '@/components/buttons/MicroRecordingButton';

export function VocabularyUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTopicId, setFilterTopicId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { topics } = useTopics();
  const { vocabularies, isLoading } = useVocabularies({
    topic_id: filterTopicId,
    difficulty_level: filterDifficulty !== 'all' ? filterDifficulty as any : undefined,
    searchTerm: searchTerm || undefined
  });

  const handleBookmarkToggle = async (vocabId: number, isBookmarked: boolean) => {
    // API call to toggle bookmark
    console.log('Toggle bookmark:', vocabId, isBookmarked);
  };

  const handlePronunciationResult = (result: any) => {
    console.log('Pronunciation result:', result);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Advanced': 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Vocabulary Learning</h1>
          <p className="text-gray-600">Explore words by category and build your vocabulary</p>
        </div>
        <AddButton onClick={() => console.log('Add vocab')} label="Add Word" />
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
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic.topic_id} value={topic.topic_id.toString()}>
                    {topic.topic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ViewModeButton mode={viewMode} onModeChange={setViewMode} />
          </div>
        </CardContent>
      </Card>

      {/* Word Cards */}
      <div className={viewMode === 'grid' ? 
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
        "space-y-4"
      }>
        {vocabularies.map((vocab) => (
          <Card key={vocab.vocab_id} className="hover:shadow-lg transition-shadow">
            {viewMode === 'grid' ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {vocab.word}
                        <LoudspeakerButton 
                          audioPath={vocab.audio_path} 
                          word={vocab.word}
                          size="sm"
                        />
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{vocab.ipa}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookmarkButton
                        vocabId={vocab.vocab_id}
                        isBookmarked={false}
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
                  <p className="text-gray-700">{vocab.meaning_en}</p>
                  <p className="text-sm text-blue-600">{vocab.meaning_vi}</p>
                  {vocab.example_sentence && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm italic">{vocab.example_sentence}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(vocab.difficulty_level)}>
                      {vocab.difficulty_level}
                    </Badge>
                    <Badge variant="outline">{vocab.topic_name}</Badge>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{vocab.word}</h3>
                    <LoudspeakerButton 
                      audioPath={vocab.audio_path} 
                      word={vocab.word}
                      size="sm"
                    />
                    <span className="text-sm text-gray-500">{vocab.ipa}</span>
                    <Badge className={getDifficultyColor(vocab.difficulty_level)} variant="secondary">
                      {vocab.difficulty_level}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-1">{vocab.meaning_en}</p>
                  <p className="text-sm text-blue-600">{vocab.meaning_vi}</p>
                </div>
                <div className="flex items-center gap-1">
                  <BookmarkButton
                    vocabId={vocab.vocab_id}
                    isBookmarked={false}
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
        ))}
      </div>

      {vocabularies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No words found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}