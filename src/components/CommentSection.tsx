import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  Users,
  Flame,
  Sparkles,
} from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  avatarText: string;
  avatarBg: string;
  content: string;
  timestamp: string;
  isSimulated?: boolean;
}

interface CommentSectionProps {
  projectId: string;
  scope: "prd" | "userStories";
}

const DEFAULT_SIMULATED_PRD_COMMENTS: Comment[] = [
  {
    id: "sim-prd-1",
    authorName: "Elena Rostova",
    authorRole: "AI Orchestrator PM",
    avatarText: "ER",
    avatarBg: "bg-amber-500",
    content:
      "These generated requirements capture the monetization strategies beautifully. I suggests making sure we prioritize offline capabilities in future sprints if our mobile users are field-heavy.",
    timestamp: "10 minutes ago",
    isSimulated: true,
  },
  {
    id: "sim-prd-2",
    authorName: "Sarah Jenkins",
    authorRole: "Senior Product Director",
    avatarText: "SJ",
    avatarBg: "bg-indigo-600",
    content:
      "Excellent layout. The functional scope defined in Section 2 perfectly matches our Q3 product goals. Ready to sign off once the technical leads review the database schema.",
    timestamp: "7 minutes ago",
    isSimulated: true,
  },
  {
    id: "sim-prd-3",
    authorName: "David Kim",
    authorRole: "Lead Systems Architect",
    avatarText: "DK",
    avatarBg: "bg-emerald-600",
    content:
      "I've cross-referenced the technical requirements against our API boundaries and they are solid. Let's make sure the database indexes we configure match the querying patterns described in Section 3.",
    timestamp: "3 minutes ago",
    isSimulated: true,
  },
];

const DEFAULT_SIMULATED_STORIES_COMMENTS: Comment[] = [
  {
    id: "sim-story-1",
    authorName: "David Kim",
    authorRole: "Lead Systems Architect",
    avatarText: "DK",
    avatarBg: "bg-emerald-600",
    content:
      "Sprint 1 story point velocity looks perfectly calibrated. I strongly recommend we enforce strict PR checklists for Story S-02 and S-03 to verify schema integrity.",
    timestamp: "15 minutes ago",
    isSimulated: true,
  },
  {
    id: "sim-story-2",
    authorName: "Sarah Jenkins",
    authorRole: "Senior Product Director",
    avatarText: "SJ",
    avatarBg: "bg-indigo-600",
    content:
      "The acceptance criteria are incredibly granular here. This makes manual regression checks far easier for the QA squad to automate early in the development lifecycle.",
    timestamp: "12 minutes ago",
    isSimulated: true,
  },
  {
    id: "sim-story-3",
    authorName: "Priya Nair",
    authorRole: "UX Design Lead",
    avatarText: "PN",
    avatarBg: "bg-fuchsia-500",
    content:
      "Great scope details. Note that user story S-01 would greatly benefit from direct tooltips to guide users through the complex initial state configurations. Let's wireframe that!",
    timestamp: "5 minutes ago",
    isSimulated: true,
  },
];

export default function CommentSection({
  projectId,
  scope,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Load comments
  useEffect(() => {
    if (!projectId) return;

    try {
      const storedKey = `ai_pm_comments_${projectId}_${scope}`;
      const savedCommentsString = localStorage.getItem(storedKey);

      const defaultSimulated =
        scope === "prd"
          ? DEFAULT_SIMULATED_PRD_COMMENTS
          : DEFAULT_SIMULATED_STORIES_COMMENTS;

      if (savedCommentsString) {
        const saved = JSON.parse(savedCommentsString) as Comment[];

        // Merge saved with missing simulated comments (in case we want to preserve simulated comments alongside user edits)
        const userComments = saved.filter((c) => !c.isSimulated);
        setComments([...defaultSimulated, ...userComments]);
      } else {
        setComments(defaultSimulated);
      }
    } catch (e) {
      console.error("Error loading comments:", e);
    }
  }, [projectId, scope]);

  // Persist user-added comments
  const saveComments = (allComments: Comment[]) => {
    if (!projectId) return;
    try {
      const storedKey = `ai_pm_comments_${projectId}_${scope}`;
      // Only persist non-simulated comments to avoid polluting default state, or persist all
      localStorage.setItem(storedKey, JSON.stringify(allComments));
    } catch (e) {
      console.error("Error saving comments:", e);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: "Me (Collaborator)",
      authorRole: "Product Owner Admin",
      avatarText: "ME",
      avatarBg: "bg-indigo-700",
      content: newCommentText.trim(),
      timestamp: "Just now",
      isSimulated: false,
    };

    const updated = [...comments, newComment];
    setComments(updated);
    saveComments(updated);
    setNewCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    saveComments(updated);
  };

  return (
    <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900 text-white rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans">
              Collaborative Discussion
            </h4>
            <p className="text-[10px] text-slate-400 font-medium font-sans">
              Draft feedback &amp; peer negotiation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold uppercase shrink-0">
          <Users className="w-3 h-3" />
          <span>Active Squad Chat</span>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-3.5 max-h-85 overflow-y-auto pr-1.5 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 italic">
              No feedback comments recorded. Start the conversation below!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 border rounded-2xl flex flex-col sm:flex-row gap-3 items-start transition-all relative group ${
                comment.isSimulated
                  ? "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
                  : "bg-indigo-50/20 border-indigo-200 hover:bg-indigo-50/40"
              }`}
            >
              {/* Header profile */}
              <div className="flex gap-2 w-full sm:w-auto shrink-0 select-none">
                <div
                  className={`w-8.5 h-8.5 rounded-full ${comment.avatarBg} text-white font-extrabold text-xs flex items-center justify-center`}
                >
                  {comment.avatarText}
                </div>
                <div className="sm:hidden flex-1">
                  <span className="font-extrabold text-[12px] text-slate-800 block leading-tight truncate overflow-hidden">
                    {comment.authorName}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 block leading-none truncate">
                    {comment.authorRole}
                  </span>
                </div>
              </div>

              {/* Message text content */}
              <div className="flex-1 space-y-1 w-full text-xs">
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[12px] text-slate-800 leading-none truncate">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-550 font-bold leading-normal truncate">
                      {comment.authorRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                    {comment.timestamp}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed text-xs pl-0.5 overflow-hidden wrap-break-word">
                  {comment.content}
                </p>

                <div className="sm:hidden text-right">
                  <span className="text-[9px] text-slate-400 font-medium">
                    {comment.timestamp}
                  </span>
                </div>
              </div>

              {/* Action delete button for user-added comments */}
              {!comment.isSimulated && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  title="Remove comment"
                  aria-label={`Remove comment by ${comment.authorName}`}
                  className="sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer self-start absolute right-1.5 top-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={handleAddComment}
        className="border-t border-slate-100 pt-3 flex flex-col gap-2"
      >
        <div className="relative">
          <input
            type="text"
            required
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Suggest feedback, adjust prioritization, or add requirements..."
            className="w-full text-xs p-3 pr-10 border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-slate-50 placeholder-slate-400 rounded-2xl font-medium transition-all"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            aria-label="Send comment"
            className="absolute right-2 top-2 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1 font-sans">
          <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
          <span>Feedback stays persistent to this blueprint sandbox.</span>
        </div>
      </form>
    </div>
  );
}
