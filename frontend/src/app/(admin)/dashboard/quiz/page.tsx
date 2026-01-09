'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
// ✅ Import Hook quản lý câu hỏi (thay vì hook làm bài quiz)
import { useQuizQuestions } from '@/features/quizquestions/hooks/quizquestion.hook';

export default function AdminQuizManagementPage() {
  const { 
    questions, 
    fetchRandomQuestions, // Admin có thể xem danh sách random hoặc cần API getAllQuestions (nếu có)
    deleteQuestion, 
    isLoading 
  } = useQuizQuestions();

  useEffect(() => {
    // Tạm thời fetch 50 câu hỏi ngẫu nhiên để demo quản lý
    // Thực tế nên có API getAllQuestions phân trang
    fetchRandomQuestions(50);
  }, [fetchRandomQuestions]);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this question permanently?')) {
      await deleteQuestion(id);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
          <p className="text-gray-600">Manage quiz questions database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchRandomQuestions(50)} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="w-[40%]">Question Text</TableHead>
                <TableHead>Correct Answer</TableHead>
                <TableHead>Time Limit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin" /> Loading questions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : questions.length > 0 ? (
                questions.map((q) => (
                  <TableRow key={q.quiz_question_id}>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {q.question_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{q.question_text}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {q.correct_answer}
                    </TableCell>
                    <TableCell>{q.time_limit}s</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(q.quiz_question_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No questions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}