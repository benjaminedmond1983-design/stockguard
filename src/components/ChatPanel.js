export default function ChatPanel({ chatOpen, comments, commentText, setCommentText, commentLoading, onPost, onClose }) {
  if (!chatOpen) return null;

  return (
    <>
      <div style={{
        position:"fixed", top:0, right:0, width:360, height:"100vh",
        background:"#fff", boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",
        zIndex:300, display:"flex", flexDirection:"column",
        fontFamily:"system-ui,-apple-system,sans-serif"
      }}>
        <div style={{ background:"#1B2B4B", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"#fff", fontWeight:600, fontSize:14 }}>💬 Chat</div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:2 }}>{chatOpen.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer", padding:4 }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {commentLoading && (
            <div style={{ textAlign:"center", color:"#888", fontSize:13, marginTop:20 }}>Loading...</div>
          )}
          {!commentLoading && comments.length === 0 && (
            <div style={{ textAlign:"center", color:"#888", fontSize:13, marginTop:40 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
              <div>No comments yet</div>
              <div style={{ fontSize:11, marginTop:4 }}>Be the first to add a note</div>
            </div>
          )}
          {comments.map(c => (
            <div key={c.id} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:600, color:"#185FA5" }}>Staff</span>
                <span style={{ fontSize:10, color:"#aaa" }}>
                  {c.created_at
                    ? new Date(c.created_at).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
                    : ""}
                </span>
              </div>
              <div style={{ background:"#F0F4FF", borderRadius:10, borderTopLeftRadius:2, padding:"10px 14px", fontSize:13, color:"#111", lineHeight:1.5 }}>
                {c.message}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:"14px 20px", borderTop:"1px solid #e0e0e0" }}>
          <div style={{ display:"flex", gap:8 }}>
            <input
              placeholder="Type a note..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onPost())}
              style={{ flex:1, padding:"9px 12px", borderRadius:8, border:"1px solid #e0e0e0", fontSize:13, outline:"none" }}
            />
            <button
              onClick={onPost}
              disabled={!commentText.trim()}
              style={{ padding:"9px 16px", borderRadius:8, border:"none", background:"#1B2B4B", color:"#fff", fontSize:13, cursor:"pointer", opacity: commentText.trim() ? 1 : 0.5 }}
            >
              Send
            </button>
          </div>
          <div style={{ fontSize:11, color:"#aaa", marginTop:6 }}>Press Enter to send</div>
        </div>
      </div>

      <div
        onClick={onClose}
        style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", background:"rgba(0,0,0,0.3)", zIndex:299 }}
      />
    </>
  );
}