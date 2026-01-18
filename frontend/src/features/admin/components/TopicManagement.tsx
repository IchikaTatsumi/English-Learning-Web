'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Loader2, RefreshCw, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useTopics } from '@/features/topics/hooks/topic.hook';
import { toast } from '@/lib/utils/toast';

export function TopicManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Lấy đầy đủ state và hàm từ hook
  const { topics, fetchTopics, createTopic, deleteTopic, isLoading, isCreating } = useTopics();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    topicName: '',
    description: ''
  });

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Xử lý Create Topic
  const handleCreateTopic = async () => {
    if (!formData.topicName.trim()) {
      toast.error("Please enter a topic name");
      return;
    }

    try {
      // ✅ QUAN TRỌNG: Gửi key 'topicName' (camelCase) thay vì 'topic_name'
      await createTopic({
        topicName: formData.topicName, 
        description: formData.description
      });

      toast.success("Topic created successfully");
      setIsDialogOpen(false);
      setFormData({ topicName: '', description: '' }); // Reset form
      // Không cần gọi fetchTopics() vì hook đã tự update state local
    } catch (error) {
      console.error(error);
      toast.error("Failed to create topic");
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (confirm('Delete this topic? All related vocabularies will also be deleted.')) {
      try {
        await deleteTopic(topicId);
        toast.success("Topic deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete topic");
      }
    }
  };

  const handleEditTopic = (topicId: number) => {
    toast.info(`Edit Topic ${topicId} modal coming soon`);
  };

  const filteredTopics = topics.filter(topic =>
    topic.topic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Topic Management</h1>
          <p className="text-gray-600">Manage vocabulary topics and categories</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => fetchTopics()} disabled={isLoading}>
             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
             <Plus className="mr-2 h-4 w-4" /> Add Topic
           </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topics ({filteredTopics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && topics.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vocabularies</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.topic_id}>
                    <TableCell className="font-medium">{topic.topic_name}</TableCell>
                    <TableCell className="max-w-md truncate text-gray-500">
                      {topic.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{topic.vocabulary_count || topic.vocab_count || 0} words</Badge>
                    </TableCell>
                    <TableCell>{new Date(topic.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTopic(topic.topic_id)}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTopic(topic.topic_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredTopics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No topics found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD TOPIC DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topicName">Topic Name <span className="text-red-500">*</span></Label>
              <Input
                id="topicName"
                placeholder="e.g. Technology, Travel..."
                value={formData.topicName}
                onChange={(e) => handleInputChange('topicName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description about this topic..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleCreateTopic}
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}