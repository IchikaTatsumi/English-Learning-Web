'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Plus, Trash2, Loader2, BrainCircuit } from 'lucide-react';
import { useQuiz } from '@/features/quiz/hooks/quiz.hook';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { toast } from '@/lib/utils/toast';

export function QuizManagement() {
  const { questions, fetchQuizQuestions, isLoading } = useQuiz();
  const { vocabularies, fetchVocabularies } = useVocabularies();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchQuizQuestions({ limit: 100 });
    fetchVocabularies();
  }, [fetchQuizQuestions, fetchVocabularies]);

  return (
    <div className="p-1 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="text-purple-600" /> Quiz Management
          </h1>
          <p className="text-sm text-gray-500">Soạn thảo câu hỏi trắc nghiệm và phát âm thủ công</p>
        </div>
        <Button className="bg-purple-600" onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Vocabulary</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[300px]">Question Text</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></TableCell></TableRow>
                ) : questions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">Chưa có câu hỏi nào. Hãy nhấn "Thêm câu hỏi".</TableCell></TableRow>
                ) : questions.map((q) => (
                  <TableRow key={q.quiz_question_id}>
                    <TableCell className="font-medium text-blue-600">
                      {vocabularies.find(v => v.vocab_id === q.vocab_id)?.word || `ID: ${q.vocab_id}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{q.question_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{q.question_text}</TableCell>
                    <TableCell className="text-green-600 font-medium">{q.correct_answer}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}