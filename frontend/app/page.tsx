"use client";

import { useEffect, useState } from "react";
import {
  getMessages,
  createMessage,
  deleteMessage,
  getReplies,
  createReply,
  Message,
  Reply,
} from "../services/api";
 
export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [replyInputs, setReplyInputs] = useState<
    Record<number, { body: string; author: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportError = (message: string, err: unknown) => {
    const detail = err instanceof Error ? `${message}: ${err.message}` : message;
    setError(detail);
  };

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      reportError("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleReplies(messageId: number) {
    const isExpanded = expanded[messageId];

    if (!isExpanded && !replies[messageId]) {
      setError(null);
      try {
        const data = await getReplies(messageId);
        setReplies((prev) => ({ ...prev, [messageId]: data }));
      } catch (err) {
        reportError("Failed to load replies", err);
        return;
      }
    }

    setExpanded((prev) => ({
      ...prev,
      [messageId]: !isExpanded,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !author || !content) return;

    setError(null);
    try {
      await createMessage({
        title,
        body: content,
        author_name: author,
      });

      setTitle("");
      setAuthor("");
      setContent("");
      fetchMessages();
    } catch (err) {
      reportError("Failed to create message", err);
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteMessage(id);
      fetchMessages();
    } catch (err) {
      reportError("Failed to delete message", err);
    }
  }

  async function handleReplySubmit(
    e: React.FormEvent,
    messageId: number
  ) {
    e.preventDefault();

    const input = replyInputs[messageId];
    if (!input?.body || !input?.author) return;

    setError(null);
    try {
      await createReply(messageId, {
        body: input.body,
        author_name: input.author,
      });

      setReplyInputs((prev) => ({
        ...prev,
        [messageId]: { body: "", author: "" },
      }));

      const data = await getReplies(messageId);
      setReplies((prev) => ({ ...prev, [messageId]: data }));

      fetchMessages(); // refresh reply_count
    } catch (err) {
      reportError("Failed to create reply", err);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <main style={{ padding: "2rem", color: "white" }}>
      <h1>Staff Message Board</h1>
      {error && (
        <p
          role="alert"
          style={{ color: "#f87171", marginTop: "0.5rem", marginBottom: "1rem" }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <input
          placeholder="Your message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>

      {loading && <p>Loading...</p>}

      {!loading &&
        messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "2rem" }}>
            <h3>{msg.title}</h3>
            <small>
              Posted by {msg.author_name} on{" "}
              {new Date(msg.created_at).toLocaleString()}
            </small>
            <p>{msg.body}</p>

            <button onClick={() => handleDelete(msg.id)}>
              Delete
            </button>

            <button
              onClick={() => toggleReplies(msg.id)}
              style={{ marginLeft: "1rem" }}
            >
              {expanded[msg.id]
                ? "Hide Replies"
                : `Show Replies (${msg.reply_count})`}
            </button>

            {/* Collapsed / Expanded Replies */}
            {expanded[msg.id] && (
              <div style={{ marginTop: "1rem" }}>
                {replies[msg.id]?.map((reply) => (
                  <div
                    key={reply.id}
                    style={{
                      marginLeft: "2rem",
                      marginBottom: "0.5rem",
                      borderLeft: "2px solid gray",
                      paddingLeft: "1rem",
                    }}
                  >
                    <small>
                      {reply.author_name} —{" "}
                      {new Date(reply.created_at).toLocaleString()}
                    </small>
                    <p>{reply.body}</p>
                  </div>
                ))}

                <form
                  onSubmit={(e) =>
                    handleReplySubmit(e, msg.id)
                  }
                  style={{ marginLeft: "2rem", marginTop: "1rem" }}
                >
                  <input
                    placeholder="Your name"
                    value={replyInputs[msg.id]?.author || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({
                        ...prev,
                        [msg.id]: {
                          ...prev[msg.id],
                          author: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    placeholder="Reply"
                    value={replyInputs[msg.id]?.body || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({
                        ...prev,
                        [msg.id]: {
                          ...prev[msg.id],
                          body: e.target.value,
                        },
                      }))
                    }
                  />
                  <button type="submit">Reply</button>
                </form>
              </div>
            )}
          </div>
        ))}
    </main>
  );
}
