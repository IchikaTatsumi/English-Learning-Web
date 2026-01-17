'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { LoudSpeakerButton } from '@/components/buttons/LoudSpeakerButton';
import { DifficultyLevel } from '@/lib/constants/enums';

export default function VocabularyManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { vocabularies, fetchVocabularies, deleteVocabulary, isLoading, isDeleting } = useVocabularies();

  useEffect(() => {
    fetchVocabularies();
  }, [fetchVocabularies]);

  const filteredVocabs = vocabularies.filter(v => 
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.meaning_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vocabulary Management</h1>
        <Button className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Add Word</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search word..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead>Meaning (EN)</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredVocabs.map((vocab) => (
                <TableRow key={vocab.vocab_id}>
                  <TableCell className="font-bold">{vocab.word}</TableCell>
                  <TableCell><LoudSpeakerButton vocabId={vocab.vocab_id} audioPath={vocab.audio_path} className="h-8 w-8" /></TableCell>
                  <TableCell>{vocab.meaning_en}</TableCell>
                  <TableCell><Badge variant="outline">{vocab.difficulty_level}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteVocabulary(vocab.vocab_id)} disabled={isDeleting}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}