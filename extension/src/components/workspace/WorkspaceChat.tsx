import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getWorkspaceMessages,
  type WorkspaceMessage,
} from "../../api/workspaceChat";

import {
  getSocket,
  disconnectSocket,
} from "../../api/socket";

interface WorkspaceChatProps {
  workspaceId: string;
}

export default function WorkspaceChat({
  workspaceId,
}: WorkspaceChatProps) {
  const [messages, setMessages] = useState<
    WorkspaceMessage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  /*
   * Get logged-in user ID
   */
  async function getCurrentUserId(): Promise<string> {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ["user"],
        (result) => {
          const user = result.user as
            | {
                _id?: string;
                id?: string;
              }
            | undefined;

          resolve(
            user?._id ||
              user?.id ||
              ""
          );
        }
      );
    });
  }

  /*
   * Get authentication token
   */
  async function getToken(): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        "token",
        (result) => {
          resolve(
            (result.token as string) ||
              null
          );
        }
      );
    });
  }

  /*
   * Load previous messages
   */
  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getWorkspaceMessages(
          workspaceId
        );

      setMessages(data);
    } catch (error: any) {
      console.error(
        "Failed to load workspace messages:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load messages."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial setup
   */
  useEffect(() => {
    async function initialize() {
      const userId =
        await getCurrentUserId();

      setCurrentUserId(userId);

      await loadMessages();
    }

    initialize();
  }, [workspaceId]);

  /*
   * Socket.IO
   */
  useEffect(() => {
    let socket:
      | ReturnType<typeof getSocket>
      | null = null;

    async function connectChat() {
      const token = await getToken();

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      socket = getSocket(token);

      socket.on("connect", () => {
        console.log(
          "Socket connected:",
          socket?.id
        );

        socket?.emit(
          "join_workspace",
          workspaceId
        );
      });

      socket.on(
        "connect_error",
        (error) => {
          console.error(
            "Socket connection failed:",
            error
          );

          setError(
            "Unable to connect to chat server."
          );
        }
      );

      socket.on(
        "new_message",
        (message: WorkspaceMessage) => {
          setMessages((current) => {
            const exists = current.some(
              (item) =>
                item._id === message._id
            );

            if (exists) {
              return current;
            }

            return [...current, message];
          });
        }
      );

      socket.on(
        "message_error",
        (data) => {
          setError(
            data?.message ||
              "Failed to send message."
          );
        }
      );
    }

    connectChat();

    return () => {
      if (socket) {
        socket.emit(
          "leave_workspace",
          workspaceId
        );

        socket.off("connect");
        socket.off("connect_error");
        socket.off("new_message");
        socket.off("message_error");
      }

      disconnectSocket();
    };
  }, [workspaceId]);

  /*
   * Scroll to newest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * Send message
   */
  async function handleSend() {
    const content = text.trim();

    if (!content || sending) {
      return;
    }

    const token = await getToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const socket = getSocket(token);

    if (!socket.connected) {
      setError(
        "Chat server is not connected."
      );
      return;
    }

    setSending(true);
    setError("");

    socket.emit("send_message", {
      workspaceId,
      content,
    });

    setText("");
    setSending(false);
  }

  /*
   * Enter = send
   * Shift + Enter = new line
   */
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  }

  /*
   * Format time
   */
  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  /*
   * Get initials
   */
  function getInitials(
    name?: string,
    email?: string
  ) {
    const value =
      name || email || "U";

    const parts = value
      .trim()
      .split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return value
      .charAt(0)
      .toUpperCase();
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />

          <p className="text-xs text-gray-500">
            Loading chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">

      {/* ================= HEADER ================= */}

      {/* <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Team Chat
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              Conversation with your workspace team
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-medium text-gray-500">
              Live
            </span>
          </div>

        </div>
      </div> */}

      {/* ================= MESSAGES ================= */}

      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/60 px-5 py-5">

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-600">
              {error}
            </p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                <span className="text-xl">
                  💬
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-700">
                No messages yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Start a conversation with your team.
              </p>

            </div>
          </div>
        ) : (
          <div className="space-y-5">

            {messages.map((message) => {
              const senderId =
                message.sender?._id ||
                "";

              const isMine =
                String(senderId) ===
                String(currentUserId);

              const senderName =
                message.sender?.name ||
                message.sender?.email ||
                "Unknown user";

              return (
                <div
                  key={message._id}
                  className={`flex w-full ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {/* OTHER USER */}

                  {!isMine && (
                    <div className="flex max-w-[78%] items-end gap-2">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 shadow-sm">
                        {getInitials(
                          message.sender?.name,
                          message.sender?.email
                        )}
                      </div>

                      <div>

                        <div className="mb-1 flex items-center gap-2 px-1">
                          <span className="text-[10px] font-semibold text-gray-700">
                            {senderName}
                          </span>

                          <span className="text-[9px] text-gray-400">
                            {formatTime(
                              message.createdAt
                            )}
                          </span>
                        </div>

                        <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm">
                          <p className="whitespace-pre-wrap break-words text-sm leading-5 text-gray-700">
                            {message.content}
                          </p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* MY MESSAGE */}

                  {isMine && (
                    <div className="flex max-w-[78%] flex-col items-end">

                      <div className="mb-1 flex items-center gap-2 px-1">
                        <span className="text-[9px] text-gray-400">
                          {formatTime(
                            message.createdAt
                          )}
                        </span>

                        <span className="text-[10px] font-semibold text-gray-700">
                          You
                        </span>
                      </div>

                      <div className="rounded-2xl rounded-br-sm bg-gray-900 px-3.5 py-2.5 shadow-sm">
                        <p className="whitespace-pre-wrap break-words text-sm leading-5 text-white">
                          {message.content}
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            <div ref={messagesEndRef} />

          </div>
        )}

      </div>

      {/* ================= COMPOSER ================= */}

      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-1.5 shadow-sm">

          <div className="flex items-end gap-2">

            <textarea
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              disabled={sending}
              rows={1}
              maxLength={2000}
              className="min-h-[38px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => {
                handleSend();
              }}
              disabled={
                sending ||
                !text.trim()
              }
              className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 px-4 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </div>

        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">

          <p className="text-[9px] text-gray-400">
            Enter to send · Shift + Enter for a new line
          </p>

          <p className="text-[9px] text-gray-300">
            {text.length}/2000
          </p>

        </div>

      </div>

    </div>
  );
}