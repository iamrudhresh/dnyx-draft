'use client';

import { CheckCircle2, Circle, MessageSquare, Plus, Reply, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from '@/lib/db';
import type { CommentItem, ReplyItem } from '@/lib/db/schema';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ open, onOpenChange }) => {
  const { activeDocumentId } = useWorkspaceStore();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newContent, setNewContent] = useState('');
  const [newAnchor, setNewAnchor] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('md-comment-author') || 'You' : 'You',
  );
  const [filterResolved, setFilterResolved] = useState(false);

  const loadComments = async () => {
    if (!db || !activeDocumentId) return;
    const all = await db.comments
      .where('documentId')
      .equals(activeDocumentId)
      .reverse()
      .sortBy('createdAt');
    setComments(all.reverse());
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadComments is stable for these deps
  useEffect(() => {
    if (open) loadComments();
  }, [open, activeDocumentId]);

  const handleAddComment = async () => {
    if (!newContent.trim() || !db || !activeDocumentId) return;
    const comment: CommentItem = {
      id: nanoid(),
      documentId: activeDocumentId,
      anchorText: newAnchor.trim(),
      content: newContent.trim(),
      author: authorName,
      resolved: false,
      replies: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.comments.add(comment);
    setNewContent('');
    setNewAnchor('');
    toast.success('Comment added');
    await loadComments();
  };

  const handleResolve = async (id: string) => {
    if (!db) return;
    await db.comments.update(id, { resolved: true, updatedAt: Date.now() });
    toast.success('Comment resolved');
    await loadComments();
  };

  const handleReopen = async (id: string) => {
    if (!db) return;
    await db.comments.update(id, { resolved: false, updatedAt: Date.now() });
    await loadComments();
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    await db.comments.delete(id);
    toast.success('Comment deleted');
    await loadComments();
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim() || !db) return;
    const comment = await db.comments.get(commentId);
    if (!comment) return;
    const reply: ReplyItem = {
      id: nanoid(),
      content: replyContent.trim(),
      author: authorName,
      createdAt: Date.now(),
    };
    await db.comments.update(commentId, {
      replies: [...comment.replies, reply],
      updatedAt: Date.now(),
    });
    setReplyTo(null);
    setReplyContent('');
    await loadComments();
  };

  const displayed = filterResolved ? comments.filter((c) => !c.resolved) : comments;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Comments
            <span className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterResolved((f) => !f)}
                className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                  filterResolved
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Hide resolved
              </button>
              <span className="text-[11px] text-slate-400 font-normal">
                {comments.filter((c) => !c.resolved).length} open
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Add new comment */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <input
            type="text"
            placeholder="Anchor text (optional — quote the text you're commenting on)"
            value={newAnchor}
            onChange={(e) => setNewAnchor(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <textarea
              placeholder="Add a comment..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={2}
              className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 resize-none"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!newContent.trim()}
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors self-end"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No comments yet</p>
            </div>
          ) : (
            displayed.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg border p-3 space-y-2 transition-colors ${
                  comment.resolved
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(comment.createdAt)}
                      </span>
                      {comment.resolved && (
                        <span className="text-[10px] text-emerald-500 font-medium">Resolved</span>
                      )}
                    </div>
                    {comment.anchorText && (
                      <blockquote className="text-[11px] text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-700 pl-2 mt-0.5 truncate">
                        {comment.anchorText}
                      </blockquote>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!comment.resolved ? (
                      <button
                        type="button"
                        onClick={() => handleResolve(comment.id)}
                        className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-600"
                        title="Resolve"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReopen(comment.id)}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                        title="Reopen"
                      >
                        <Circle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-700 dark:text-slate-200">{comment.content}</p>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-1.5">
                    {comment.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            {reply.author}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyTo === comment.id ? (
                  <div className="flex gap-2 ml-3">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) handleAddReply(comment.id);
                        if (e.key === 'Escape') setReplyTo(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddReply(comment.id)}
                      className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyTo(comment.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
