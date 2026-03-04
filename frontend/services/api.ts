const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/messages";

export type Message = {
  id: number;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
  reply_count: number;
};

export type Reply = {
  id: number;
  body: string;
  author_name: string;
  created_at: string;
  message_id: number;
};

export async function getMessages(): Promise<Message[]> {
  const res = await fetch(API_BASE);

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

export async function createMessage(data: {
  title: string;
  body: string;
  author_name: string;
}) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create message");
  }

  return res.json();
}

export async function deleteMessage(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete message");
  }
}

export async function getReplies(messageId: number): Promise<Reply[]> {
  const res = await fetch(`${API_BASE}/${messageId}/replies`);

  if (!res.ok) {
    throw new Error("Failed to fetch replies");
  }

  return res.json();
}

export async function createReply(
  messageId: number,
  data: { body: string; author_name: string }
) {
  const res = await fetch(`${API_BASE}/${messageId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create reply");
  }

  return res.json();
}
