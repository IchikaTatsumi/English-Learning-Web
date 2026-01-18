'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';

// ✅ FIX: Đổi import từ useQuiz sang useQuizQuestions
import { useQuizQuestions } from '@/features/quizquestions/hooks/quizquestion.hook';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { toast } from '@/lib/utils/toast';

export function QuizManagement() {
  // ✅ FIX: Sử dụng hook useQuizQuestions để có createQuestion, deleteQuestion
  const { 
    questions, 
    fetchRandomQuestions, // Hook này dùng tên fetchRandomQuestions
    createQuestion, 
    deleteQuestion, 
    isLoading 
  } = useQuizQuestions();

  const { vocabularies, fetchVocabularies } = useVocabularies();

  // State cho Modal & Form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    vocabId: '',
    questionType: 'WordToMeaning',
    questionText: '',
    correctAnswer: '',
    wrongAnswer1: '',
    wrongAnswer2: '',
    wrongAnswer3: '',
  });

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    // ✅ FIX: Hàm fetchRandomQuestions nhận tham số là number (count)
    fetchRandomQuestions(100); 
    fetchVocabularies();
  }, [fetchRandomQuestions, fetchVocabularies]);

  // Logic tự động điền câu hỏi/đáp án khi chọn Vocab hoặc Type
  useEffect(() => {
    if (!formData.vocabId) return;

    const selectedVocab = vocabularies.find(v => v.vocab_id.toString() === formData.vocabId);
    if (!selectedVocab) return;

    let autoQuestion = '';
    let autoCorrect = '';

    switch (formData.questionType) {
      case 'WordToMeaning':
        autoQuestion = `What is the meaning of "${selectedVocab.word}"?`;
        autoCorrect = selectedVocab.meaning_vi;
        break;
      case 'MeaningToWord':
        autoQuestion = `Which word means "${selectedVocab.meaning_en}"?`;
        autoCorrect = selectedVocab.word;
        break;
      case 'VietnameseToWord':
        autoQuestion = `Từ nào có nghĩa là "${selectedVocab.meaning_vi}"?`;
        autoCorrect = selectedVocab.word;
        break;
      case 'SentenceToWord':
        autoQuestion = selectedVocab.example_sentence 
          ? selectedVocab.example_sentence.replace(new RegExp(selectedVocab.word, 'gi'), '_______')
          : `_______ means ${selectedVocab.meaning_en}`;
        autoCorrect = selectedVocab.word;
        break;
      default:
        autoQuestion = '';
        autoCorrect = '';
    }

    setFormData(prev => ({
      ...prev,
      questionText: autoQuestion,
      correctAnswer: autoCorrect
    }));
  }, [formData.vocabId, formData.questionType, vocabularies]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.vocabId || !formData.questionText || !formData.correctAnswer || 
        !formData.wrongAnswer1 || !formData.wrongAnswer2 || !formData.wrongAnswer3) {
      toast.error("Vui lòng điền đầy đủ thông tin và 4 đáp án!");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Gọi API tạo câu hỏi từ hook useQuizQuestions
      await createQuestion({
        vocabId: parseInt(formData.vocabId),
        questionType: formData.questionType,
        questionText: formData.questionText,
        correctAnswer: formData.correctAnswer,
        incorrectAnswers: [
          formData.wrongAnswer1,
          formData.wrongAnswer2,
          formData.wrongAnswer3
        ],
        timeLimit: 30,
      } as any);

      toast.success("Tạo câu hỏi trắc nghiệm thành công!");
      setIsDialogOpen(false);
      
      setFormData({
        vocabId: '',
        questionType: 'WordToMeaning',
        questionText: '',
        correctAnswer: '',
        wrongAnswer1: '',
        wrongAnswer2: '',
        wrongAnswer3: '',
      });
      fetchRandomQuestions(100); // Reload list
    } catch (error) {
      toast.error("Lỗi khi tạo câu hỏi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa câu hỏi này?")) {
      await deleteQuestion(id);
      toast.success("Đã xóa câu hỏi");
      fetchRandomQuestions(100);
    }
  };

  return (
    <div className="p-1 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="text-purple-600" /> Quiz Management
          </h1>
          <p className="text-sm text-gray-500">Soạn thảo câu hỏi trắc nghiệm và phát âm thủ công</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add new quiz
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
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">Chưa có câu hỏi nào.</TableCell></TableRow>
                ) : questions.map((q) => (
                  <TableRow key={q.quiz_question_id}>
                    <TableCell className="font-medium text-blue-600">
                      {vocabularies.find(v => v.vocab_id === q.vocab_id)?.word || `ID: ${q.vocab_id}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{q.question_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={q.question_text}>
                      {q.question_text}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">{q.correct_answer}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.quiz_question_id)}>
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

      {/* Dialog giữ nguyên như cũ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Quiz Question</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vocabulary <span className="text-red-500">*</span></Label>
                <Select value={formData.vocabId} onValueChange={(val) => handleInputChange('vocabId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a word..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {vocabularies.map((v) => (
                      <SelectItem key={v.vocab_id} value={v.vocab_id.toString()}>
                        {v.word} ({v.meaning_vi})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={formData.questionType} onValueChange={(val) => handleInputChange('questionType', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WordToMeaning">Word ➜ Meaning</SelectItem>
                    <SelectItem value="MeaningToWord">Meaning ➜ Word</SelectItem>
                    <SelectItem value="VietnameseToWord">Vietnamese ➜ Word</SelectItem>
                    <SelectItem value="SentenceToWord">Fill in Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text <span className="text-red-500">*</span></Label>
              <Textarea 
                placeholder="Câu hỏi hiển thị cho người dùng..."
                value={formData.questionText}
                onChange={(e) => handleInputChange('questionText', e.target.value)}
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <Label className="text-base font-semibold mb-3 block">Answer Options</Label>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Correct Answer <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    className="border-green-200 bg-green-50 focus-visible:ring-green-500"
                    placeholder="Nhập đáp án đúng..."
                    value={formData.correctAnswer}
                    onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                  />
                </div>

                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-1">
                    <Label className="text-red-500 flex items-center gap-1 text-xs">
                      <XCircle className="h-3 w-3" /> Incorrect Answer {num} <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      className="border-red-100 bg-red-50/50 focus-visible:ring-red-500"
                      placeholder={`Nhập đáp án sai ${num}...`}
                      // @ts-ignore
                      value={formData[`wrongAnswer${num}`]} 
                      // @ts-ignore
                      onChange={(e) => handleInputChange(`wrongAnswer${num}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}