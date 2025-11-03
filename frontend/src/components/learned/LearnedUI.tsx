// frontend/src/components/learned/LearnedUI.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Import DTOs và Hooks
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { VocabularyDto } from '@/features/vocabularies/dtos/vocabulary.dto';
import { Search, Volume2, RotateCcw, Calendar, Trophy, BookOpen } from 'lucide-react';

// Giả lập mockVocabulary cho UI Learned
const mockVocabulary: VocabularyDto[] = [
  { id: 1, lessonId: 1, word: 'Ecosystem', pronunciation: '/ˈiːkoʊˌsɪstəm/', partOfSpeech: 'noun', definition: 'A community of living and non-living things in an environment', example: 'The rainforest ecosystem supports thousands of species.', difficulty: 'B1', topicId: 2, isLearned: true, dateAdded: '2024-10-01', lastReviewed: '2024-10-04' },
  { id: 2, lessonId: 1, word: 'Nutritious', pronunciation: '/nuːˈtrɪʃəs/', partOfSpeech: 'adjective', definition: 'Containing substances that help the body grow and stay healthy', example: 'Vegetables are nutritious and essential for a balanced diet.', difficulty: 'A2', topicId: 3, isLearned: true, dateAdded: '2024-09-25', lastReviewed: '2024-10-07' },
  { id: 3, lessonId: 1, word: 'Hibernate', pronunciation: '/ˈhaɪ.bə.neɪt/', partOfSpeech: 'verb', definition: 'To spend the winter in a dormant state', example: 'Bears hibernate during the cold winter months.', difficulty: 'A2', topicId: 1, isLearned: true, dateAdded: '2024-09-28', lastReviewed: '2024-10-06' },
  { id: 4, lessonId: 1, word: 'Digital', pronunciation: '/ˈdɪdʒɪtəl/', partOfSpeech: 'adjective', definition: 'Using computer technology', example: 'Digital cameras have replaced traditional film cameras.', difficulty: 'A1', topicId: 6, isLearned: true, dateAdded: '2024-09-20', lastReviewed: '2024-09-20' },
  { id: 5, lessonId: 1, word: 'Nocturnal', pronunciation: '/nɒkˈtɜːnəl/', partOfSpeech: 'adjective', definition: 'Active during the night', example: 'Owls are nocturnal birds that hunt in the darkness.', difficulty: 'B1', topicId: 1, isLearned: true, dateAdded: '2024-09-22', lastReviewed: '2024-10-03' },
  { id: 6, lessonId: 1, word: 'Agility', pronunciation: '/əˈdʒɪlɪti/', partOfSpeech: 'noun', definition: 'The ability to move quickly and easily', example: 'Soccer players need agility to dodge opponents and change direction.', difficulty: 'A2', topicId: 5, isLearned: true, dateAdded: '2024-09-18', lastReviewed: '2024-09-18' },
];


export function LearnedUI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  // Giả lập việc fetch chỉ các từ đã học
  const { vocabularies: learnedWords } = useVocabularies({ isLearned: true });
  
  const filteredAndSortedWords = (learnedWords.length > 0 ? learnedWords : mockVocabulary) // Fallback for demonstration
    .filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        case 'difficulty':
          // A1 < A2 < B1 < B2 < C1
          const difficultyOrder: { [key: string]: number } = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        case 'recent':
        default:
          return new Date(b.lastReviewed || b.dateAdded).getTime() - new Date(a.lastReviewed || a.dateAdded).getTime();
      }
    });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Tính stats dựa trên dữ liệu đã học
  const stats = {
    total: filteredAndSortedWords.length,
    A1: filteredAndSortedWords.filter(w => w.difficulty === 'A1').length,
    A2: filteredAndSortedWords.filter(w => w.difficulty === 'A2').length,
    B1: filteredAndSortedWords.filter(w => w.difficulty === 'B1').length,
    B2: filteredAndSortedWords.filter(w => w.difficulty === 'B2').length,
    C1: filteredAndSortedWords.filter(w => w.difficulty === 'C1').length,
    beginner: filteredAndSortedWords.filter(w => w.difficulty === 'A1' || w.difficulty === 'A2').length,
    intermediate: filteredAndSortedWords.filter(w => w.difficulty === 'B1' || w.difficulty === 'B2').length,
    advanced: filteredAndSortedWords.filter(w => w.difficulty === 'C1').length,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Title Section */}
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
                <p className="text-sm text-gray-600">Beginner (A1/A2)</p>
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
                <p className="text-sm text-gray-600">Intermediate (B1/B2)</p>
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
                <p className="text-sm text-gray-600">Advanced (C1)</p>
                <p className="text-2xl">{stats.advanced}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/*  */}

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
                  <Trophy className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">{word.definition}</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm italic">{word.example}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(word.difficulty)}>{word.difficulty}</Badge>
                  <Badge variant="outline">Topic {word.topicId}</Badge>
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
            {/* ... (UI cho empty state) */}
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