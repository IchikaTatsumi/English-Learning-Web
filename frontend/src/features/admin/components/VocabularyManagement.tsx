'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Trash2, Edit, Loader2, BookOpen, Languages } from 'lucide-react';

import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { DifficultyLevel } from '@/lib/constants/enums';
import { toast } from '@/lib/utils/toast';

export function VocabularyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // State quản lý dữ liệu Form thêm mới
  const [formData, setFormData] = useState({
    word: '',
    topicId: '',
    ipa: '',
    meaningEn: '',
    meaningVi: '',
    exampleSentence: '',
    difficultyLevel: DifficultyLevel.BEGINNER
  });

  const { 
    vocabularies, 
    fetchVocabularies, 
    createVocabulary, 
    deleteVocabulary, 
    isLoading, 
    isDeleting,
    isCreating 
  } = useVocabularies();

  const { topics, fetchTopics } = useTopics();

  useEffect(() => {
    fetchVocabularies();
    fetchTopics();
  }, [fetchVocabularies, fetchTopics]);

  const filteredVocabs = useMemo(() => {
    return vocabularies.filter(v => 
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning_vi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vocabularies, searchTerm]);

  const handleDelete = async (id: number) => {
    if (confirm('Deleting this vocabulary will remove all related quiz questions. Are you sure?')) {
      try {
        await deleteVocabulary(id);
        toast.success('Vocabulary deleted successfully');
      } catch (error) {
        toast.error('Failed to delete vocabulary');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topicId) {
      toast.error("Please select a topic");
      return;
    }

    try {
      await createVocabulary({
        word: formData.word,
        topicId: parseInt(formData.topicId),
        ipa: formData.ipa,
        meaningEn: formData.meaningEn,
        meaningVi: formData.meaningVi,
        exampleSentence: formData.exampleSentence,
        difficultyLevel: formData.difficultyLevel as DifficultyLevel
      });
      
      toast.success("Vocabulary created successfully");
      setIsAddDialogOpen(false);
      // Reset form sau khi thêm thành công
      setFormData({
        word: '',
        topicId: '',
        ipa: '',
        meaningEn: '',
        meaningVi: '',
        exampleSentence: '',
        difficultyLevel: DifficultyLevel.BEGINNER
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create vocabulary");
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'advanced': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="text-blue-600" /> Vocabulary Management
          </h1>
          <p className="text-muted-foreground text-sm">Manage vocabulary words, meanings, and examples.</p>
        </div>
        
        {/* ADD NEW VOCABULARY DIALOG */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Add new vocabulary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Vocabulary</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.topicId} 
                    onValueChange={(val) => handleSelectChange('topicId', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.topic_id} value={t.topic_id.toString()}>
                          {t.topic_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.difficultyLevel} 
                    onValueChange={(val) => handleSelectChange('difficultyLevel', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DifficultyLevel.BEGINNER}>Beginner</SelectItem>
                      <SelectItem value={DifficultyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                      <SelectItem value={DifficultyLevel.ADVANCED}>Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="word">Word <span className="text-red-500">*</span></Label>
                  <Input 
                    id="word" 
                    name="word" 
                    placeholder="e.g. Apple" 
                    value={formData.word}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipa">IPA (Pronunciation)</Label>
                  <Input 
                    id="ipa" 
                    name="ipa" 
                    placeholder="e.g. /ˈæp.əl/" 
                    value={formData.ipa}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meaningEn">Meaning (English) <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="meaningEn" 
                  name="meaningEn" 
                  placeholder="Definition in English" 
                  value={formData.meaningEn}
                  onChange={handleInputChange}
                  required 
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meaningVi">Meaning (Vietnamese) <span className="text-red-500">*</span></Label>
                <Input 
                  id="meaningVi" 
                  name="meaningVi" 
                  placeholder="Nghĩa tiếng Việt" 
                  value={formData.meaningVi}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="example">Example Sentence</Label>
                <Textarea 
                  id="example" 
                  name="exampleSentence" 
                  placeholder="e.g. I eat an apple every day." 
                  value={formData.exampleSentence}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Vocabulary'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by word or meaning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && vocabularies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-muted-foreground">Loading vocabularies...</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[120px]">Word</TableHead>
                    <TableHead className="w-[120px]">Topic</TableHead>
                    <TableHead className="w-[100px]">IPA</TableHead>
                    <TableHead className="min-w-[150px]">Meaning (EN)</TableHead>
                    <TableHead className="min-w-[150px]">Meaning (VN)</TableHead>
                    <TableHead className="min-w-[200px]">Example</TableHead>
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVocabs.length > 0 ? (
                    filteredVocabs.map((vocab) => (
                      <TableRow key={vocab.vocab_id} className="hover:bg-slate-50/50 align-top">
                        <TableCell className="font-bold text-blue-900 align-top">{vocab.word}</TableCell>
                        <TableCell className="align-top">
                          <Badge variant="outline" className="font-normal bg-slate-100">
                            {vocab.topic_name || 'No Topic'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500 italic align-top">
                          {vocab.ipa || '---'}
                        </TableCell>
                        <TableCell className="align-top text-sm">{vocab.meaning_en}</TableCell>
                        <TableCell className="align-top text-sm text-blue-700">{vocab.meaning_vi}</TableCell>
                        <TableCell className="align-top italic text-xs text-slate-600">
                          {vocab.example_sentence ? `"${vocab.example_sentence}"` : '-'}
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge className={`${getDifficultyColor(vocab.difficulty_level)} border-none shadow-none`}>
                            {vocab.difficulty_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(vocab.vocab_id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                          <p>No vocabularies found.</p>
                        </div>
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