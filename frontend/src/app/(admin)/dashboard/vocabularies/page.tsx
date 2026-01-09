'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { DifficultyLevel } from '@/lib/constants/enums';

export default function AdminVocabulariesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Sử dụng hook vocabularies với chức năng quản lý
  const { 
    vocabularies, 
    fetchVocabularies, 
    deleteVocabulary, 
    isLoading,
    isDeleting 
  } = useVocabularies();

  useEffect(() => {
    fetchVocabularies();
  }, [fetchVocabularies]);

  // Logic lọc dữ liệu client-side (cho mượt mà với list nhỏ)
  const filteredVocabs = vocabularies.filter(v => 
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.meaning_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this vocabulary?')) {
      await deleteVocabulary(id);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case DifficultyLevel.BEGINNER: return 'bg-green-100 text-green-700';
      case DifficultyLevel.INTERMEDIATE: return 'bg-yellow-100 text-yellow-700';
      case DifficultyLevel.ADVANCED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vocabulary Management</h1>
          <p className="text-gray-600">Create, update, and remove words from the dictionary</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add New Word
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by word or definition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && vocabularies.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>IPA</TableHead>
                    <TableHead>Meaning (EN)</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVocabs.length > 0 ? (
                    filteredVocabs.map((vocab) => (
                      <TableRow key={vocab.vocab_id}>
                        <TableCell className="font-medium">{vocab.word}</TableCell>
                        <TableCell className="text-gray-500 font-mono text-xs">{vocab.ipa}</TableCell>
                        <TableCell className="max-w-xs truncate" title={vocab.meaning_en}>
                          {vocab.meaning_en}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vocab.topic_name || 'No Topic'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(vocab.difficulty_level)}>
                            {vocab.difficulty_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(vocab.vocab_id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No vocabularies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}