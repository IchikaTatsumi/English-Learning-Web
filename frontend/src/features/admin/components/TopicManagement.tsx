'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2 } from 'lucide-react';
import { AddButton } from '@/components/buttons/AddButton';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TopicManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { topics, fetchTopics, isLoading } = useTopics();

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleAddTopic = () => {
    console.log('Add topic');
    // TODO: Open dialog to add topic
  };

  const handleEditTopic = (topicId: number) => {
    console.log('Edit topic:', topicId);
    // TODO: Open dialog to edit topic
  };

  const handleDeleteTopic = (topicId: number) => {
    console.log('Delete topic:', topicId);
    // TODO: Confirm and delete topic
  };

  const filteredTopics = topics.filter(topic =>
    topic.topic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Topic Management</h1>
          <p className="text-gray-600">Manage vocabulary topics and categories</p>
        </div>
        <AddButton onClick={handleAddTopic} label="Add Topic" />
      </div>

      {/* Search */}
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

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Topics ({filteredTopics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Topic Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Words</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.topic_id}>
                    <TableCell>{topic.topic_id}</TableCell>
                    <TableCell className="font-medium">{topic.topic_name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {topic.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{topic.vocab_count || 0} words</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTopic(topic.topic_id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTopic(topic.topic_id)}
                          className="text-red-600 hover:text-red-700"
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
              No topics found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}