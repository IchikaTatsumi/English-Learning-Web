'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockVocabulary } from '@/data/mockData';
import { Search, Volume2, RotateCcw, Calendar, Trophy, BookOpen } from 'lucide-react';

export function LearnedUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  const learnedWords = mockVocabulary.filter(word => word.isLearned);
  
  const filteredAndSortedWords = learnedWords
    .filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'recent':
        default:
          return new Date(b.lastReviewed || b.dateAdded).getTime() - new Date(a.lastReviewed || a.dateAdded).getTime();
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = {
    total: learnedWords.length,
    beginner: learnedWords.filter(w => w.difficulty === 'beginner').length,
    intermediate: learnedWords.filter(w => w.difficulty === 'intermediate').length,
    advanced: learnedWords.filter(w => w.difficulty === 'advanced').length,
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Learned Words</h1>
        <p className="text-gray-600">Review your mastered vocabulary</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Learned</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Beginner</p>
                <p className="text-2xl">{stats.beginner}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Intermediate</p>
                <p className="text-2xl">{stats.intermediate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Advanced</p>
                <p className="text-2xl">{stats.advanced}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search learned words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Learned Words Grid */}
      {filteredAndSortedWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedWords.map((word) => (
            <Card key={word.id} className="hover:shadow-lg transition-shadow">
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
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">{word.definition}</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm italic">{word.example}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(word.difficulty)}>
                    {word.difficulty}
                  </Badge>
                  <Badge variant="outline">{word.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Learned: {formatDate(word.dateAdded)}</span>
                  </div>
                  {word.lastReviewed && (
                    <span>Reviewed: {formatDate(word.lastReviewed)}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            {searchTerm ? (
              <div>
                <p className="text-gray-500 mb-2">No learned words found matching "{searchTerm}"</p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div>
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No words learned yet</p>
                <p className="text-sm text-gray-400">Start learning vocabulary to see them here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {filteredAndSortedWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Review All Words
              </Button>
              <Button variant="outline" className="flex-1">
                Export Word List
              </Button>
              <Button className="flex-1">
                Practice Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
