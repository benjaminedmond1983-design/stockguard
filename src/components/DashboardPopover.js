export default function DashboardPopover({ popover, onClose, onAction }) {
  if (!popover) return null;
  const N = '#1B2B4B';
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:1998}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:popover.y,left:popover.x,width:300,background:'#fff',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.22)',zIndex:1999,border:'1px solid rgba(27,43,75,0.1)',overflow:'hidden',fontFamily:'system-ui,-apple-system,sans-serif'}}>
        <div style={{background:N,padding:'11px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#fff',fontWeight:600,fontSize:13}}>{popover.title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',cursor:'pointer',fontSize:18,lineHeight:1,padding:0}}>x</button>
        </div>
        <div style={{padding:'12px 16px'}}>
          {popover.what&&<p style={{fontSize:12,color:'#555',lineHeight:1.55,margin:'0 0 10px'}}>{popover.what}</p>}
          {popover.rows?.length>0&&<div>{popover.rows.map((row,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:i<popover.rows.length-1?'1px solid #f2f2f2':'none'}}><span style={{fontSize:12,color:'#666'}}>{row.label}</span><span style={{fontSize:12,fontWeight:600,color:row.color||N}}>{row.value}</span></div>))}</div>}
          {popover.action&&<button onClick={()=>onAction(popover.onAction)} style={{marginTop:12,width:'100%',padding:'8px',borderRadius:7,border:'none',background:N,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>{popover.action} -&gt;</button>}
        </div>
        <div style={{textAlign:'center',fontSize:10,color:'#ccc',paddingBottom:8}}>Click anywhere to close</div>
      </div>
    </>
  );
}
