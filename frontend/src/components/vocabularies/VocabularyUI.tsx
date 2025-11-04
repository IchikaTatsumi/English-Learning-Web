'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { Search, Volume2, Grid3X3, List, Leaf, Gamepad2, Cloud, Utensils, Cpu, Zap, BookOpen } from 'lucide-react';

export function VocabularyUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTopicId, setFilterTopicId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  const { topics, isLoading: topicsLoading } = useTopics();
  const { vocabularies, isLoading: vocabLoading } = useVocabularies({
    topic_id: filterTopicId,
    difficulty_level: filterDifficulty !== 'all' ? filterDifficulty as any : undefined,
    searchTerm: searchTerm || undefined
  });

  const filteredWords = vocabularies.filter(word => {
    const matchesTab = activeTab === 'all' || word.topic_name === activeTab;
    return matchesTab;
  });

  const getCategoryIcon = (topicName: string) => {
    const iconMap: Record<string, any> = {
      'Animals': Zap,
      'Nature': Leaf,
      'Food': Utensils,
      'Weather': Cloud,
      'Daily Activities': Gamepad2,
      'Colors': Cpu,
      'Numbers': BookOpen,
    };
    const Icon = iconMap[topicName] || Grid3X3;
    return <Icon className="h-4 w-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const playAudio = (audioPath: string | null) => {
    if (audioPath) {
      const audio = new Audio(audioPath);
      audio.play();
    }
  };

  if (topicsLoading || vocabLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Vocabulary Learning</h1>
        <p className="text-gray-600">Explore words by topic and build your vocabulary</p>
      </div>

      {/* Topic Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {topics.map(topic => {
          const topicWords = vocabularies.filter(v => v.topic_id === topic.topic_id);
          return (
            <Card key={topic.topic_id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  {getCategoryIcon(topic.topic_name)}
                </div>
                <h3 className="text-sm mb-1">{topic.topic_name}</h3>
                <p className="text-xs text-gray-600">{topicWords.length} words</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            {topics.slice(0, 3).map(topic => (
              <TabsTrigger key={topic.topic_id} value={topic.topic_name} className="flex items-center gap-1">
                {getCategoryIcon(topic.topic_name)}
                <span className="hidden sm:inline">{topic.topic_name}</span>
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
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Word Display */}
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
            "space-y-4"
          }>
            {filteredWords.map((word) => (
              <Card key={word.vocab_id} className={`hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'p-4' : ''
              }`}>
                {viewMode === 'grid' ? (
                  <>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {word.word}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => playAudio(word.audio_path)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{word.ipa}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-gray-700">{word.meaning_en}</p>
                      <p className="text-sm text-blue-600">{word.meaning_vi}</p>
                      {word.example_sentence && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm italic">{word.example_sentence}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(word.difficulty_level)}>
                          {word.difficulty_level}
                        </Badge>
                        <Badge variant="outline">{word.topic_name}</Badge>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3>{word.word}</h3>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => playAudio(word.audio_path)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <span className="text-sm text-gray-500">{word.ipa}</span>
                        <Badge className={getDifficultyColor(word.difficulty_level)} variant="secondary">
                          {word.difficulty_level}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">{word.meaning_en}</p>
                      <p className="text-sm text-blue-600 mb-1">{word.meaning_vi}</p>
                      {word.example_sentence && (
                        <p className="text-sm text-gray-600 italic">{word.example_sentence}</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No words found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
