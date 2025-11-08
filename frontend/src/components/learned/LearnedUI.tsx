'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { ViewModeButton, ViewMode } from '@/components/buttons/ViewModeButton';
import { BookmarkButton } from '@/components/buttons/BookmarkButton';
import { LoudspeakerButton } from '@/components/buttons/LoudspeakerButton';
import { MicroRecordingButton } from '@/components/buttons/MicroRecordingButton';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';

export function LearnedUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { vocabularies, fetchVocabularies, isLoading } = useVocabularies({
    isLearned: true, // Chỉ lấy từ đã bookmark/learned
    difficulty_level: filterDifficulty !== 'all' ? filterDifficulty as any : undefined,
    searchTerm: searchTerm || undefined
  });

  useEffect(() => {
    fetchVocabularies();
  }, [filterDifficulty, searchTerm, fetchVocabularies]);

  // Sort vocabularies
  const sortedVocabularies = [...vocabularies].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.word.localeCompare(b.word);
      case 'difficulty':
        const difficultyOrder: Record<string, number> = {
          'Beginner': 1,
          'Intermediate': 2,
          'Advanced': 3
        };
        return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

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
    // Refresh danh sách sau khi unbookmark
    fetchVocabularies();
  };

  const handlePronunciationResult = (result: any) => {
    console.log('Pronunciation result:', result);
    // TODO: Handle pronunciation result
  };

  // Calculate stats
  const totalLearned = vocabularies.length;
  const thisWeek = vocabularies.filter(v => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(v.created_at) > weekAgo;
  }).length;
  const avgScore = 85; // TODO: Calculate from actual results

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading learned words...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Learned Words</h1>
        <p className="text-gray-600">Review your mastered vocabulary and track your progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Learned</p>
                <p className="text-2xl font-bold">{totalLearned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search learned words..."
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Learned</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
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
        {sortedVocabularies.map((vocab) => (
          <Card key={vocab.vocab_id} className="hover:shadow-lg transition-shadow">
            {viewMode === 'grid' ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
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
                        isBookmarked={true}
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
                    <Badge variant="outline">{vocab.topic_name}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Learned: {new Date(vocab.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{vocab.word}</h3>
                    <LoudspeakerButton 
                      audioPath={vocab.audio_path} 
                      word={vocab.word}
                      size="sm"
                    />
                    <span className="text-sm text-gray-500">{vocab.ipa}</span>
                    <Badge className={getDifficultyColor(vocab.difficulty_level)} variant="secondary">
                      {vocab.difficulty_level}
                    </Badge>
                    <Badge variant="outline">{vocab.topic_name}</Badge>
                  </div>
                  <p className="text-gray-700 mb-1">{vocab.meaning_en}</p>
                  <p className="text-sm text-blue-600 mb-1">{vocab.meaning_vi}</p>
                  <p className="text-xs text-gray-500">
                    Learned: {new Date(vocab.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <BookmarkButton
                    vocabId={vocab.vocab_id}
                    isBookmarked={true}
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

      {sortedVocabularies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No words learned yet</h3>
            <p className="text-gray-500 mb-4">Start bookmarking words from the Vocabulary tab to track your learning!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}