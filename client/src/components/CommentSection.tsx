import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CommentSectionProps {
  postId: number;
  initialCommentsCount?: number;
}

export function CommentSection({ postId, initialCommentsCount = 0 }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/comments', postId],
    enabled: showComments,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          content,
          postId: postId,
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
      setNewComment("");
    },
    onError: () => {
      toast({
        title: "Failed to post comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment.trim());
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="space-y-4">
      {/* Comment Toggle Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-400 hover:text-[hsl(217,91%,60%)]"
        onClick={handleToggleComments}
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        {comments.length || initialCommentsCount}
        {showComments ? ' Hide Comments' : ' Comments'}
      </Button>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-700">
          {/* Add Comment Form */}
          {user && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] text-white text-xs">
                  {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-[hsl(240,29%,11%)] border-gray-700 resize-none min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] hover:from-[hsl(256,87%,76%)] hover:to-[hsl(151,100%,60%)] text-white border-0"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    {createCommentMutation.isPending ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-[hsl(256,87%,66%)] to-[hsl(151,100%,50%)] text-white text-xs">
                      {comment.authorId?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Card className="bg-[hsl(240,29%,11%)] border-gray-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{comment.authorId}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[hsl(0,79%,70%)] h-6 px-2">
                            <Heart className="h-3 w-3 mr-1" />
                            <span className="text-xs">0</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[hsl(217,91%,60%)] h-6 px-2">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Reply</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No comments yet.</p>
              <p className="text-gray-500 text-xs">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}