import { useState } from "react";
import type { Conversation, Page } from "../types";
import { GRAY_IMAGE, initialConversations } from "../utils/mockData";
import { Icon } from "../components/ui";

export default function ChatPage({
  setPage,
  conversations = initialConversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onSelectProduct,
}: {
  setPage: (p: Page) => void;
  conversations?: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onSendMessage?: (convId: string, message: string) => void;
  onSelectProduct?: (productId: number) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(
    activeConversationId || (conversations[0]?.id ?? "conv-1"),
  );
  const [text, setText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const currentConv =
    conversations.find((c) => c.id === (activeConversationId || selectedId)) ||
    conversations[0];

  const handleSelectConv = (id: string) => {
    setSelectedId(id);
    if (onSelectConversation) onSelectConversation(id);
  };

  const handleSend = (content?: string) => {
    const msgToSend = (content ?? text).trim();
    if (!msgToSend || !currentConv) return;

    if (onSendMessage) {
      onSendMessage(currentConv.id, msgToSend);
    }
    setText("");
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.productTitle && c.productTitle.toLowerCase().includes(searchFilter.toLowerCase())),
  );

  return (
    <main className="shell inbox">
      <aside className="conversation-list">
        <div className="inbox-title">
          <h1>Messages</h1>
        </div>

        <div style={{ padding: "0 16px 12px" }}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              fontSize: "14px",
            }}
          />
        </div>

        <div className="chat-tabs">
          <button className="active">All ({conversations.length})</button>
        </div>

        {filteredConversations.map((c) => (
          <button
            className={`conversation ${c.id === currentConv?.id ? "selected" : ""}`}
            key={c.id}
            onClick={() => handleSelectConv(c.id)}
            type="button"
          >
            <span className="avatar">{c.initials}</span>
            <span className="conversation-copy">
              <b>{c.name}</b>
              {c.productTitle && (
                <small style={{ color: "var(--primary)", fontWeight: 500 }}>
                  {c.productTitle}
                </small>
              )}
              <small>{c.msg}</small>
            </span>
            <span className="conversation-meta">
              <small>{c.time}</small>
              {c.unread ? <i>{c.unread}</i> : null}
            </span>
            {c.productImage && (
              <img
                src={c.productImage}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = GRAY_IMAGE;
                }}
              />
            )}
          </button>
        ))}
      </aside>

      {currentConv ? (
        <section className="chat-window">
          <div className="chat-header">
            <button className="back-mobile" onClick={() => setPage("home")}>
              ‹
            </button>
            <span className="avatar">{currentConv.initials}</span>
            <div>
              <b>{currentConv.name}</b>
              <small>
                <i />
                Online on Bidzaar
              </small>
            </div>
          </div>

          {currentConv.productTitle && (
            <button
              className="chat-product"
              onClick={() => {
                if (currentConv.productId && onSelectProduct) {
                  onSelectProduct(currentConv.productId);
                }
                setPage("detail");
              }}
              type="button"
            >
              {currentConv.productImage && (
                <img
                  src={currentConv.productImage}
                  alt={currentConv.productTitle}
                  onError={(e) => {
                    e.currentTarget.src = GRAY_IMAGE;
                  }}
                />
              )}
              <div>
                <b>{currentConv.productTitle}</b>
                {currentConv.productPrice && <span>{currentConv.productPrice}</span>}
              </div>
              <Icon name="chevron" />
            </button>
          )}

          <div className="safety">
            <Icon name="shield" size={17} />
            Always pay safely with Bidzaar Buyer Protection. Never share bank details in chat.
          </div>

          <div className="messages">
            <span className="day">Conversation</span>
            {currentConv.messages?.map((m) => (
              <div className={`bubble ${m.sender === "me" ? "mine" : ""}`} key={m.id}>
                <p>{m.text}</p>
                <small>
                  {m.time} {m.sender === "me" && "✓✓"}
                </small>
              </div>
            ))}
          </div>

          <div className="quick-replies">
            {currentConv.messages?.some((m) => m.text.includes("I offer €")) && (
              <>
                <button
                  type="button"
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#16a34a",
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    handleSend(
                      "Agreed! I accept your offer. You can now check out safely with Buyer Protection.",
                    )
                  }
                >
                  ✓ Accept offer
                </button>
                <button
                  type="button"
                  onClick={() => setText("Thanks for your offer. My lowest price is € ")}
                >
                  Send a counteroffer...
                </button>
              </>
            )}
            <button type="button" onClick={() => handleSend("Is this still available?")}>
              Is this still available?
            </button>
            <button type="button" onClick={() => handleSend("When can I pick this up?")}>
              When can I pick this up?
            </button>
            <button type="button" onClick={() => handleSend("What is your lowest price?")}>
              What is your lowest price?
            </button>
          </div>

          <div className="composer">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
            />
            <button className="send-btn" onClick={() => handleSend()} type="button">
              <Icon name="send" />
            </button>
          </div>
        </section>
      ) : (
        <section className="chat-window" style={{ display: "grid", placeItems: "center" }}>
          <p>Select a conversation to view messages.</p>
        </section>
      )}
    </main>
  );
}
