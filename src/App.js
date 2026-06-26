import { useState, useEffect } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import { MultiFormatReader, BinaryBitmap, HybridBinarizer, HTMLCanvasElementLuminanceSource } from '@zxing/library';
import { supabase } from "./supabase";
import BillingTab from "./BillingTab";
import QuickBooksTab from "./QuickBooksTab";
import AuthScreen  from "./components/AuthScreen";
import RoleScreen  from "./components/RoleScreen";
import Sidebar     from "./components/Sidebar";
import BottomNav   from "./components/BottomNav";
import ChatPanel   from "./components/ChatPanel";
import HelpPanel   from "./components/HelpPanel";
import AuditTrail  from "./tabs/AuditTrail";
import Pricing     from "./tabs/Pricing";
import { useSlack } from "./components/useSlack";
import DashboardPopover from "./components/DashboardPopover";
import { OWNER_TABS, CASHIER_TABS, INIT_INVENTORY, SIDEBAR_W, SIDEBAR, TAB_ICONS, TAB_COLORS, ADD_CATEGORY_VALUE, CSV_TEMPLATE, C, PLANS } from "./components/constants";
import { todayStr, dateStr, shortDate, nowStr, statusBadge, marginBadge, parseRows, buildInitAudit, inp, btn } from "./components/helpers";



const SG_LOGO=(<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#1B2B4B"/><text x="4" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">S</text><text x="19" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">G</text><rect x="33" y="10" width="2" height="10" rx="1" fill="#ffffff" opacity="0.9"/><rect x="30" y="13.5" width="8" height="2" rx="1" fill="#ffffff" opacity="0.9"/></svg>);
export default function App(){
  const [session,setSession]=useState(undefined); // undefined=loading, null=no session, object=logged in
  const [role,setRole]=useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(!session) setRole(null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  if(session===undefined) return(
    <div style={{minHeight:"100vh",background:"#EEF2F7",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <div style={{textAlign:"center"}}>{SG_LOGO}<div style={{fontWeight:600,fontSize:16,color:"#1B2B4B",marginTop:16}}>Loading...</div></div>
    </div>
  );
  if(!session) return <AuthScreen/>;
  if(!role) return <RoleScreen onRole={setRole} onSignOut={()=>supabase.auth.signOut()}/>;
  const TABS=role==="owner"?OWNER_TABS:CASHIER_TABS;
  return <AppInner role={role} userId={session.user.id} userEmail={session.user.email} onLogout={()=>setRole(null)} TABS={TABS}/>;
}

function AppInner({role,onLogout,TABS,userId,userEmail}){
  const isOwner=role==="owner";
  const { sendSlackAlert, sendLowStockAlerts } = useSlack();
  const [tab,setTab]=useState(TABS[0]);
  const [inventory,setInventory]=useState([]);
  const [audit,setAudit]=useState([]);
  const [reorders,setReorders]=useState([]);
  const [dbLoading,setDbLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [annual,setAnnual]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const [deleteConfirmId,setDeleteConfirmId]=useState(null);
  const emptyRec={sku:"",name:"",category:"",qty:"",supplier:"",unitCost:"",sellingPrice:"",location:"",po:"",markup:""};
  const emptySale={sku:"",qty:"",invoice:""};
  const emptyMove={sku:"",qty:"",from:"",to:""};
  const [recForm,setRecForm]=useState(emptyRec);
  const [categories,setCategories]=useState(["Apparel","Footwear","Electronics","Accessories","General"]);
  const [saleForm,setSaleForm]=useState(emptySale);
  const [moveForm,setMoveForm]=useState(emptyMove);
  const [pos,setPOs]=useState([]);
  const [editPOId,setEditPOId]=useState(null);
  const [editPOForm,setEditPOForm]=useState({});
  const [poCounter,setPOCounter]=useState(1);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiAnalysis,setAiAnalysis]=useState("");
  const [suppliers,setSuppliers]=useState([]);
  const [editSupId,setEditSupId]=useState(null);
  const [editSupForm,setEditSupForm]=useState({});
  const [showAddSup,setShowAddSup]=useState(false);
  const emptySup={name:"",contact:"",phone:"",email:"",website:"",leadTime:"",minOrder:"",paymentTerms:"Net 30",notes:""};
  const [newSupForm,setNewSupForm]=useState(emptySup);
  const [insightLoading,setInsightLoading]=useState(false);
  const [swotData,setSwotData]=useState(null);
  const [porterData,setPorterData]=useState(null);
  const [moneyData,setMoneyData]=useState(null);
  const [insightTab,setInsightTab]=useState("SWOT");
  const [industry,setIndustry]=useState("retail clothing and accessories");
  const [importTab,setImportTab]=useState("csv");
  const [importPreview,setImportPreview]=useState([]);
  const [importErrors,setImportErrors]=useState([]);
  const [importStatus,setImportStatus]=useState("");
  const [pasteText,setPasteText]=useState("");
  const [manualRows,setManualRows]=useState([emptyRec]);
  const [mergeStats,setMergeStats]=useState(null);
  const [intelTab,setIntelTab]=useState("Forecast");
  const [simSku,setSimSku]=useState("");
  const [simQty,setSimQty]=useState(100);
  const [showMoreMenu,setShowMoreMenu]=useState(false);
  const [simResult,setSimResult]=useState(null);
  // ── BARCODE SCANNER STATE ──
  const [scanMode,setScanMode]=useState(false);
  const [scanInput,setScanInput]=useState("");
  const [scanFeedback,setScanFeedback]=useState(null);
  const [cameraActive,setCameraActive]=useState(false);
  const [recScanMode,setRecScanMode]=useState(false);
  const [recCameraActive,setRecCameraActive]=useState(false);
  const [recCameraError,setRecCameraError]=useState("");
  const [cameraError,setCameraError]=useState("");
  const [chatOpen,setChatOpen]=useState(null); // {type:"inventory"|"po", id, name}
  const [comments,setComments]=useState([]);
  const [commentText,setCommentText]=useState("");
  const [commentLoading,setCommentLoading]=useState(false);
  const [automations,setAutomations]=useState([]);
  const [popover,setPopover]=useState(null);
  const [showAddAuto,setShowAddAuto]=useState(false);
  const emptyAuto={name:"",trigger_type:"stock_below_min",trigger_value:0,action_type:"create_po",action_value:""};
  const [autoForm,setAutoForm]=useState(emptyAuto);

  useEffect(()=>{
    async function loadAll(){
      setDbLoading(true);
      const[{data:inv},{data:aud},{data:pos_data},{data:sups_data}]=await Promise.all([
        supabase.from("inventory").select("*").eq("user_id",userId).order("created_at",{ascending:true}),
        supabase.from("audit_log").select("*").eq("user_id",userId).order("created_at",{ascending:false}),
        supabase.from("purchase_orders").select("*").eq("user_id",userId).order("created_at",{ascending:false}),
        supabase.from("suppliers").select("*").eq("user_id",userId).order("created_at",{ascending:true}),
      ]);
      const mapInv=r=>({...r,minQty:r.min_qty,unitCost:parseFloat(r.unit_cost)||0,sellingPrice:parseFloat(r.selling_price)||0});
      const mapAudit=r=>({...r,user:r.user_name,revenue:parseFloat(r.revenue)||0,profit:parseFloat(r.profit)||0});
      const mapSup=r=>({...r,leadTime:r.lead_time||"",minOrder:r.min_order||"",paymentTerms:r.payment_terms||"Net 30"});
      const mapPO=r=>({...r,poNumber:r.po_number,itemName:r.item_name,unitCost:parseFloat(r.unit_cost)||0,deliveryDate:r.delivery_date||"",createdFrom:r.created_from||"Manual"});
      if(inv&&inv.length>0){setInventory(inv.map(mapInv));}
      else{
        const{data:ins}=await supabase.from("inventory").insert(INIT_INVENTORY.map(i=>({sku:i.sku,name:i.name,category:i.category,qty:i.qty,min_qty:i.minQty,supplier:i.supplier,unit_cost:i.unitCost,selling_price:i.sellingPrice,location:i.location,user_id:userId}))).select();
        if(ins)setInventory(ins.map(mapInv));
      }
      if(aud&&aud.length>0){setAudit(aud.map(mapAudit));}
      else{
        const{data:ins}=await supabase.from("audit_log").insert(buildInitAudit().map(a=>({time:a.time,action:a.action,item:a.item,qty:a.qty,user_name:a.user||"Staff",note:a.note||"",sku:a.sku||"",revenue:a.revenue||0,profit:a.profit||0,user_id:userId}))).select();
        if(ins)setAudit(ins.map(mapAudit));
      }
      if(pos_data)setPOs(pos_data.map(mapPO));
      if(sups_data&&sups_data.length>0){setSuppliers(sups_data.map(mapSup));}
      else{
        const seed=[
          {name:"DenimCo",lead_time:"14",min_order:"",payment_terms:"Net 30",contact:"",phone:"",email:"",website:"",notes:"",user_id:userId},
          {name:"SoleSupply",lead_time:"21",min_order:"",payment_terms:"Net 30",contact:"",phone:"",email:"",website:"",notes:"",user_id:userId},
          {name:"TechGear Inc",lead_time:"7",min_order:"",payment_terms:"Net 30",contact:"",phone:"",email:"",website:"",notes:"",user_id:userId},
          {name:"FabricWorld",lead_time:"10",min_order:"",payment_terms:"Net 30",contact:"",phone:"",email:"",website:"",notes:"",user_id:userId},
          {name:"LeatherCraft",lead_time:"18",min_order:"",payment_terms:"Net 30",contact:"",phone:"",email:"",website:"",notes:"",user_id:userId},
          {name:"CapMakers",lead_time:"25",min_order:"",payment_terms:"Net 30",contact:"",phone:"",email:"",website:"",notes:"",user_id:userId},
        ];
        const{data:ins}=await supabase.from("suppliers").insert(seed).select();
        if(ins)setSuppliers(ins.map(mapSup));
      }
      const{data:autos}=await supabase.from("automations").select("*").eq("user_id",userId).order("created_at",{ascending:true});
      if(autos)setAutomations(autos);
      setDbLoading(false);
    }
    loadAll();
  },[]);

  const today=todayStr(),yesterday=dateStr(1);
  const salesByDay={};
  for(let i=6;i>=0;i--){const d=dateStr(i);salesByDay[d]={revenue:0,profit:0,units:0,transactions:0};}
  audit.filter(a=>a.action==="Sold").forEach(a=>{const day=a.time.slice(0,10);if(salesByDay[day]){salesByDay[day].revenue+=a.revenue||0;salesByDay[day].profit+=a.profit||0;salesByDay[day].units+=a.qty||0;salesByDay[day].transactions++;}});
  const todaySales=salesByDay[today]||{revenue:0,profit:0,units:0,transactions:0};
  const yesterdaySales=salesByDay[yesterday]||{revenue:0,profit:0,units:0,transactions:0};
  const revenueUp=todaySales.revenue>=yesterdaySales.revenue;
  const todayItemQty={};
  audit.filter(a=>a.action==="Sold"&&a.time.startsWith(today)).forEach(a=>{todayItemQty[a.item]=(todayItemQty[a.item]||0)+a.qty;});
  const topItem=Object.entries(todayItemQty).sort((a,b)=>b[1]-a[1])[0];
  const maxRevenue=Math.max(...Object.values(salesByDay).map(d=>d.revenue),1);
  const lowItems=inventory.filter(i=>i.qty<i.minQty);
  const outItems=inventory.filter(i=>i.qty===0);
  const totalValue=inventory.reduce((s,i)=>s+i.qty*i.unitCost,0);
  const totalRetail=inventory.reduce((s,i)=>s+i.qty*(i.sellingPrice||0),0);
  const marginsWithPrice=inventory.filter(i=>i.sellingPrice>i.unitCost);
  const avgMargin=marginsWithPrice.length?marginsWithPrice.reduce((s,i)=>s+((i.sellingPrice-i.unitCost)/i.sellingPrice)*100,0)/marginsWithPrice.length:0;
  const filteredInv=inventory.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())||i.sku.toLowerCase().includes(search.toLowerCase())||i.category.toLowerCase().includes(search.toLowerCase()));

  // ── DEAD INVENTORY ──
  const deadInventory=inventory.filter(i=>{
    if(i.qty===0) return false;
    const lastSold=audit.filter(a=>a.action==="Sold"&&a.sku===i.sku).sort((a,b)=>b.time.localeCompare(a.time))[0];
    if(!lastSold){
      // Never sold — if has qty and cost, it's dead
      return i.qty>0&&i.unitCost>0;
    }
    const daysSince=Math.floor((new Date()-new Date(lastSold.time))/(1000*60*60*24));
    return daysSince>=30;
  }).map(i=>{
    const lastSold=audit.filter(a=>a.action==="Sold"&&a.sku===i.sku).sort((a,b)=>b.time.localeCompare(a.time))[0];
    const daysSince=lastSold?Math.floor((new Date()-new Date(lastSold.time))/(1000*60*60*24)):null;
    const trapped=(i.qty*i.unitCost);
    const discountPrice=(i.sellingPrice*0.75).toFixed(2);
    return{...i,daysSince,trapped,discountPrice};
  }).sort((a,b)=>b.trapped-a.trapped);
  const totalDeadValue=deadInventory.reduce((s,i)=>s+i.trapped,0);

  function daysUntilStockout(item){const sold=audit.filter(a=>a.action==="Sold"&&a.sku===item.sku);if(!sold.length)return null;const rate=sold.reduce((s,a)=>s+a.qty,0)/7;if(rate<=0)return null;return Math.floor(item.qty/rate);}
  function getForecast(item){const sold=audit.filter(a=>a.action==="Sold"&&a.sku===item.sku);const totalSold=sold.reduce((s,a)=>s+a.qty,0);const dailyRate=totalSold/7;const days14=Math.round(dailyRate*14);const days30=Math.round(dailyRate*30);const stockoutDay=dailyRate>0?Math.floor(item.qty/dailyRate):null;const reorderPoint=Math.ceil(dailyRate*14);return{dailyRate,days14,days30,stockoutDay,reorderPoint,totalSold};}
  function getOverstockItems(){return inventory.filter(i=>{const sold=audit.filter(a=>a.action==="Sold"&&a.sku===i.sku).reduce((s,a)=>s+a.qty,0);return i.qty>i.minQty*2.5&&sold>0&&i.sellingPrice>0;}).map(i=>{const sold=audit.filter(a=>a.action==="Sold"&&a.sku===i.sku).reduce((s,a)=>s+a.qty,0);const dailyRate=sold/7;const daysStock=dailyRate>0?Math.floor(i.qty/dailyRate):999;const excessUnits=Math.max(0,i.qty-i.minQty*2);const excessValue=(excessUnits*i.unitCost).toFixed(2);const discountPrice=(i.sellingPrice*0.85).toFixed(2);return{...i,dailyRate,daysStock,excessUnits,excessValue,discountPrice};}).sort((a,b)=>b.daysStock-a.daysStock);}
  function runSimulator(){const item=inventory.find(i=>i.sku===simSku);if(!item||!simQty)return;const fc=getForecast(item);const qty=parseInt(simQty)||0;const totalQtyAfter=item.qty+qty;const stockoutAfter=fc.dailyRate>0?Math.floor(totalQtyAfter/fc.dailyRate):null;const orderCost=(qty*item.unitCost).toFixed(2);const projRevenue=(qty*item.sellingPrice).toFixed(2);const projProfit=(qty*(item.sellingPrice-item.unitCost)).toFixed(2);const coversDays=fc.dailyRate>0?Math.floor(qty/fc.dailyRate):null;setSimResult({item,qty,orderCost,projRevenue,projProfit,stockoutAfter,coversDays,totalQtyAfter,dailyRate:fc.dailyRate});}
  // ── BARCODE SCAN HANDLER ──
  function handleSaleScan(raw){const code=raw.trim();if(!code)return;if(window._sgStopCamera)window._sgStopCamera();setCameraActive(false);setCameraError("✅ Scanned: "+code);const existing=inventory.find(i=>i.sku===code||i.sku.toLowerCase()===code.toLowerCase());if(existing){setSaleForm(f=>({...f,sku:existing.sku}));}else{setSaleForm(f=>({...f,sku:code}));}setTimeout(()=>{setScanMode(false);setCameraError("");},800);}function handleRecScan(raw){const code=raw.trim();setRecScanMode(false);setRecCameraActive(false);if(window._sgStopRecCamera)window._sgStopRecCamera();if(!code)return;const existing=inventory.find(i=>i.sku===code||i.sku.toLowerCase()===code.toLowerCase());if(existing){setRecForm(r=>({...r,sku:existing.sku,name:existing.name,category:existing.category,supplier:existing.supplier,unitCost:existing.unitCost,sellingPrice:existing.sellingPrice,location:existing.location}));}else{setRecForm(r=>({...r,sku:code}));}}
  async function startSaleCameraScan(){setCameraError("");try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});setCameraActive(true);await new Promise(res=>setTimeout(res,300));const video=document.getElementById("sg-sale-camera-feed");if(!video){stream.getTracks().forEach(t=>t.stop());setCameraActive(false);return;}video.srcObject=stream;await video.play();window._sgStopCamera=()=>{stream.getTracks().forEach(t=>t.stop());setCameraActive(false);};}catch(e){setCameraError("ERR: "+e.name+": "+e.message);setCameraActive(false);}}async function startRecCameraScan(){setRecCameraError("");try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});setRecCameraActive(true);await new Promise(res=>setTimeout(res,300));const video=document.getElementById("sg-rec-camera-feed");if(!video){stream.getTracks().forEach(t=>t.stop());setRecCameraActive(false);return;}video.srcObject=stream;await video.play();window._sgStopRecCamera=()=>{stream.getTracks().forEach(t=>t.stop());setRecCameraActive(false);};window._sgRecVideo=video;window._sgCaptureScanRec=async()=>{if(!video||!video.videoWidth){setRecCameraError("Camera not ready yet. w="+video.videoWidth);return;}setRecCameraError("Scanning...");const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;const ctx=canvas.getContext("2d");ctx.filter="contrast(1.5) brightness(1.1)";ctx.drawImage(video,0,0);const hasBC="BarcodeDetector" in window;setRecCameraError("Trying... BC="+hasBC+" size="+canvas.width+"x"+canvas.height);try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(video);if(codes.length>0){window._sgStopRecCamera();handleRecScan(codes[0].rawValue);}else{setRecCameraError("No barcode found. Tap again.");}}else{const bmp=new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas)));const result=new MultiFormatReader().decode(bmp);window._sgStopRecCamera();handleRecScan(result.getText());}}catch(e){setRecCameraError("No barcode found. Tap again.");}};}catch(e){setRecCameraError("ERR: "+e.name+": "+e.message);setRecCameraActive(false);}}
async function startCameraScan(){setCameraError("");try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});setCameraActive(true);await new Promise(res=>setTimeout(res,300));const video=document.getElementById("sg-camera-feed");if(!video){stream.getTracks().forEach(t=>t.stop());setCameraActive(false);return;}video.srcObject=stream;await video.play();window._sgStopCamera=()=>{stream.getTracks().forEach(t=>t.stop());setCameraActive(false);};window._sgCaptureScan=async()=>{const vid=document.getElementById("sg-camera-feed");if(!vid||!vid.videoWidth){setScanFeedback({ok:false,msg:"Camera not ready yet."});return;}setScanFeedback({ok:false,msg:"Scanning..."});try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){const scanned=codes[0].rawValue;if(window._sgStopCamera)window._sgStopCamera();window._sgSetSaleSku(scanned);window._sgStopCamera&&window._sgStopCamera();window._sgScanDone=true;return;}}setScanFeedback({ok:false,msg:"No barcode found. Tap again."});}catch(e){setScanFeedback({ok:false,msg:"No barcode found. ("+e.name+")"});}};}catch(e){alert("CAM ERR: "+e.name+": "+e.message);setCameraError(e.name==="NotAllowedError"?"Camera access denied. Please allow camera access.":"Camera not available. Use the text input below.");setCameraActive(false);}}
  function stopCamera(){
    if(window._sgStopCamera)window._sgStopCamera();
  }
  // ── AUTOMATION FUNCTIONS ──
  async function saveAutomation(){
    if(!autoForm.name.trim())return;
    const row={user_id:userId,name:autoForm.name,enabled:true,trigger_type:autoForm.trigger_type,trigger_value:parseFloat(autoForm.trigger_value)||0,action_type:autoForm.action_type,action_value:autoForm.action_value||""};
    const{data}=await supabase.from("automations").insert(row).select().single();
    if(data){setAutomations(a=>[...a,data]);setAutoForm(emptyAuto);setShowAddAuto(false);}
  }
  async function toggleAutomation(id,enabled){
    await supabase.from("automations").update({enabled:!enabled}).eq("id",id);
    setAutomations(a=>a.map(x=>x.id===id?{...x,enabled:!enabled}:x));
  }
  async function deleteAutomation(id){
    await supabase.from("automations").delete().eq("id",id);
    setAutomations(a=>a.filter(x=>x.id!==id));
  }
  async function runAutomations(updatedInventory){
    const enabled=automations.filter(a=>a.enabled);
    for(const rule of enabled){
      if(rule.trigger_type==="stock_below_min"){
        const items=updatedInventory.filter(i=>i.qty<i.minQty);
        for(const item of items){
          if(rule.action_type==="create_po"){
            const alreadyPending=pos.find(p=>p.sku===item.sku&&p.status==="Draft");
            if(!alreadyPending){
              const poNumber=`AUTO-PO-${Date.now()}`;
              const poRow={po_number:poNumber,status:"Draft",sku:item.sku,item_name:item.name,description:`Auto-generated: ${rule.name}`,supplier:item.supplier,qty:Math.max(item.minQty*2-item.qty,10),unit_cost:item.unitCost,date:new Date().toISOString().slice(0,10),delivery_date:"",notes:`Created by automation: ${rule.name}`,created_from:"Automation",user_id:userId};
              const{data}=await supabase.from("purchase_orders").insert(poRow).select().single();
              if(data)setPOs(p=>[{...data,poNumber:data.po_number,itemName:data.item_name,unitCost:parseFloat(data.unit_cost),deliveryDate:"",createdFrom:"Automation"},...p]);
              await addLog("Automation",item.name,0,"System",`Auto PO created: ${poNumber}`);
            }
          }
          if(rule.action_type==="log_alert"){
            await addLog("Alert",item.name,item.qty,"System",`Low stock alert: ${rule.name}`);
          }
        }
      }
      if(rule.trigger_type==="stock_zero"){
        const items=updatedInventory.filter(i=>i.qty===0);
        for(const item of items){
          if(rule.action_type==="log_alert"){
            await addLog("Alert",item.name,0,"System",`Out of stock: ${rule.name}`);
          }
        }
      }
      if(rule.trigger_type==="margin_below"){
        const items=updatedInventory.filter(i=>i.sellingPrice>0&&((i.sellingPrice-i.unitCost)/i.sellingPrice)*100<rule.trigger_value);
        for(const item of items){
          if(rule.action_type==="log_alert"){
            await addLog("Alert",item.name,item.qty,"System",`Low margin alert: ${rule.name}`);
          }
        }
      }
      await supabase.from("automations").update({last_fired:new Date().toISOString(),fire_count:(rule.fire_count||0)+1}).eq("id",rule.id);
    }
  }
  // ── CHAT FUNCTIONS ──
  async function openChat(type, id, name){
    setChatOpen({type,id,name});
    setCommentLoading(true);
    const{data}=await supabase.from("comments").select("*").eq("user_id",userId).eq("entity_type",type).eq("entity_id",String(id)).order("created_at",{ascending:true});
    setComments(data||[]);
    setCommentLoading(false);
  }
  function closeChat(){setChatOpen(null);setComments([]);setCommentText("");}
  async function postComment(){
    if(!commentText.trim()||!chatOpen)return;
    const entry={user_id:userId,entity_type:chatOpen.type,entity_id:String(chatOpen.id),entity_name:chatOpen.name,message:commentText.trim(),user_email:""};
    const{data}=await supabase.from("comments").insert(entry).select().single();
    if(data)setComments(c=>[...c,data]);
    setCommentText("");
  }
  // ── HEALTH SCORE ──
  function openPop(e,cfg){const r=e.currentTarget.getBoundingClientRect();const W=300;let left=Math.min(r.left,window.innerWidth-W-16);if(left<8)left=8;let top=r.bottom+8;if(top+340>window.innerHeight)top=Math.max(8,r.top-340-8);setPopover({...cfg,x:left,y:top});}
  function calcHealthScore(){if(!inventory.length)return 100;const score=Math.max(0,100-outItems.length*15-lowItems.filter(i=>i.qty>0).length*8-(avgMargin>=40?0:avgMargin>=20?5:10));return Math.min(100,score);}
  const healthScore=calcHealthScore();
  const healthColor=healthScore>=75?"#3B6D11":healthScore>=50?"#854F0B":"#A32D2D";
  const healthBg=healthScore>=75?"#EAF3DE":healthScore>=50?"#FAEEDA":"#FCEBEB";
  const healthLabel=healthScore>=75?"Healthy":healthScore>=50?"Needs attention":"At risk";

  async function addLog(action,item,qty,user,note,extra={}){
    const entry={time:nowStr(),action,item,qty,user_name:user||"Staff",note,sku:extra.sku||"",revenue:extra.revenue||0,profit:extra.profit||0,user_id:userId};
    const{data}=await supabase.from("audit_log").insert(entry).select().single();
    if(data)setAudit(a=>[{...data,user:data.user_name,revenue:parseFloat(data.revenue)||0,profit:parseFloat(data.profit)||0},...a]);
  }
  function startEdit(item){setEditId(item.id);setEditForm({...item});setDeleteConfirmId(null);}
  function cancelEdit(){setEditId(null);setEditForm({});}
  async function saveEdit(){
    const updated={...editForm,qty:parseInt(editForm.qty)||0,minQty:parseInt(editForm.minQty)||0,unitCost:parseFloat(editForm.unitCost)||0,sellingPrice:parseFloat(editForm.sellingPrice)||0};
    await supabase.from("inventory").update({name:updated.name,category:updated.category,qty:updated.qty,min_qty:updated.minQty,supplier:updated.supplier,unit_cost:updated.unitCost,selling_price:updated.sellingPrice,location:updated.location}).eq("id",editId);
    setInventory(inv=>inv.map(i=>i.id===editId?updated:i));
    addLog("Edited",updated.name,updated.qty,"Staff","Item details updated");cancelEdit();
  }
  function confirmDelete(id){setDeleteConfirmId(id);setEditId(null);}
  async function doDelete(item){
    await supabase.from("inventory").delete().eq("id",item.id);
    setInventory(inv=>inv.filter(i=>i.id!==item.id));
    addLog("Deleted",item.name,item.qty,"Staff",`SKU ${item.sku} removed`);setDeleteConfirmId(null);
  }
  function handleCategorySelect(value){
    if(value!==ADD_CATEGORY_VALUE){setRecForm(r=>({...r,category:value}));return;}
    const next=window.prompt("Enter new category name:");
    if(!next)return;
    const category=next.trim();
    if(!category)return;
    setCategories(prev=>prev.some(c=>c.toLowerCase()===category.toLowerCase())?prev:[...prev,category]);
    setRecForm(r=>({...r,category}));
  }
  async function handleReceive(){
    const qty=parseInt(recForm.qty);if(!recForm.sku||!recForm.name||!qty)return;
    const existing=inventory.find(i=>i.sku===recForm.sku);
    if(existing){
      const newQty=existing.qty+qty;
      await supabase.from("inventory").update({qty:newQty}).eq("id",existing.id);
      setInventory(inv=>inv.map(i=>i.sku===recForm.sku?{...i,qty:newQty}:i));
    } else {
      const row={sku:recForm.sku,name:recForm.name,category:recForm.category||"General",qty,min_qty:10,supplier:recForm.supplier,unit_cost:parseFloat(recForm.unitCost)||0,selling_price:parseFloat(recForm.sellingPrice)||0,location:recForm.location,user_id:userId};
      const{data}=await supabase.from("inventory").insert(row).select().single();
      if(data)setInventory(inv=>[...inv,{...data,minQty:data.min_qty,unitCost:parseFloat(data.unit_cost),sellingPrice:parseFloat(data.selling_price)}]);
    }
    addLog("Received",recForm.name,qty,"Staff",recForm.po||"—");setRecForm(emptyRec);
  }
  async function handleSale(){
    const qty=parseInt(saleForm.qty);const item=inventory.find(i=>i.sku===saleForm.sku);
    if(!item){setScanFeedback({ok:false,msg:"❌ SKU not in inventory. Receive this item first."});return;}
    if(!qty){setScanFeedback({ok:false,msg:"❌ Enter a quantity."});return;}
    if(qty>item.qty){setScanFeedback({ok:false,msg:"❌ Only "+item.qty+" in stock."});return;}
    const revenue=(item.sellingPrice||0)*qty,profit=((item.sellingPrice||0)-item.unitCost)*qty;
    const newQty=item.qty-qty;
    await supabase.from("inventory").update({qty:newQty}).eq("id",item.id);
    setInventory(inv=>inv.map(i=>i.sku===saleForm.sku?{...i,qty:newQty}:i));
    const updatedInv=inventory.map(i=>i.sku===saleForm.sku?{...i,qty:newQty}:i);
    addLog("Sold",item.name,qty,"Staff",saleForm.invoice||"—",{sku:item.sku,revenue,profit});
    setSaleForm(emptySale);
    runAutomations(updatedInv);
    sendLowStockAlerts(updatedInv, audit);
  }
  async function handleMove(){
    const qty=parseInt(moveForm.qty);const item=inventory.find(i=>i.sku===moveForm.sku);
    if(!item||!qty)return;
    const newLoc=moveForm.to||item.location;
    await supabase.from("inventory").update({location:newLoc}).eq("id",item.id);
    setInventory(inv=>inv.map(i=>i.sku===moveForm.sku?{...i,location:newLoc}:i));
    addLog("Moved",item.name,qty,"Staff",`${moveForm.from||"—"} to ${moveForm.to||"—"}`);setMoveForm(emptyMove);
  }
  async function handleReorder(item){
    const suggestedQty=Math.max(item.minQty*2-item.qty,10);
    const poNumber=`PO-${String(poCounter).padStart(4,"0")}`;setPOCounter(c=>c+1);
    const poRow={po_number:poNumber,status:"Draft",sku:item.sku,item_name:item.name,description:`Reorder for ${item.name} — SKU ${item.sku}`,supplier:item.supplier,qty:suggestedQty,unit_cost:item.unitCost,date:new Date().toISOString().slice(0,10),delivery_date:"",notes:"",created_from:"Reorder Center",user_id:userId};
    const{data}=await supabase.from("purchase_orders").insert(poRow).select().single();
    if(data)setPOs(p=>[{...data,poNumber:data.po_number,itemName:data.item_name,unitCost:parseFloat(data.unit_cost),deliveryDate:data.delivery_date||"",createdFrom:data.created_from},...p]);
    setReorders(r=>[{id:Date.now(),sku:item.sku,name:item.name,supplier:item.supplier,qty:suggestedQty,status:"Sent",date:new Date().toISOString().slice(0,10),urgency:item.qty===0?"Critical":item.qty<item.minQty*0.3?"High":"Normal"},...r]);
    addLog("Reordered",item.name,suggestedQty,"Staff",`${poNumber} sent to ${item.supplier}`);
  }
  function handleCSVUpload(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=evt=>{try{const lines=evt.target.result.trim().split(/\r?\n/);const headers=lines[0].split(",").map(c=>c.replace(/"/g,"").trim());const rows=lines.slice(1).filter(l=>l.trim()).map(line=>{const cols=line.split(",").map(c=>c.replace(/"/g,"").trim());const obj={};headers.forEach((h,i)=>{obj[h]=cols[i]||"";});return obj;});const{parsed,errors}=parseRows(rows);setImportErrors(errors);setImportPreview(parsed);setImportStatus("preview");}catch(err){setImportErrors(["Failed to parse file: "+err.message]);}};reader.readAsText(file);e.target.value="";}
  function handlePasteParse(){if(!pasteText.trim()){setImportErrors(["Please paste some data first."]);return;}try{const lines=pasteText.trim().split(/\r?\n/);if(lines.length<2){setImportErrors(["Please paste at least a header row and one data row."]);return;}const headers=lines[0].split(/\t|,/).map(c=>c.trim());const rows=lines.slice(1).filter(l=>l.trim()).map(line=>{const cols=line.split(/\t|,/).map(c=>c.trim());const obj={};headers.forEach((h,i)=>{obj[h]=cols[i]||"";});return obj;});const{parsed,errors}=parseRows(rows);setImportErrors(errors);setImportPreview(parsed);setImportStatus("preview");}catch(err){setImportErrors(["Failed to parse pasted data: "+err.message]);}}
  function handleManualParse(){const filled=manualRows.filter(r=>r.sku.trim()&&r.name.trim());if(!filled.length){setImportErrors(["Please fill in at least one row with SKU and Name."]);return;}const{parsed,errors}=parseRows(filled);setImportErrors(errors);setImportPreview(parsed);setImportStatus("preview");}
  async function confirmMerge(){
    let added=0,updated=0;
    const nextInv=[...inventory];
    for(const item of importPreview){
      const idx=nextInv.findIndex(i=>i.sku===item.sku);
      if(idx>=0){
        const merged={...nextInv[idx],qty:nextInv[idx].qty+item.qty,name:item.name||nextInv[idx].name,category:item.category||nextInv[idx].category,supplier:item.supplier!=="—"?item.supplier:nextInv[idx].supplier,unitCost:item.unitCost||nextInv[idx].unitCost,sellingPrice:item.sellingPrice||nextInv[idx].sellingPrice,location:item.location!=="—"?item.location:nextInv[idx].location,minQty:item.minQty||nextInv[idx].minQty};
        await supabase.from("inventory").update({qty:merged.qty,name:merged.name,category:merged.category,supplier:merged.supplier,unit_cost:merged.unitCost,selling_price:merged.sellingPrice,location:merged.location,min_qty:merged.minQty}).eq("id",merged.id);
        nextInv[idx]=merged;updated++;
      } else {
        const row={sku:item.sku,name:item.name,category:item.category||"General",qty:item.qty,min_qty:item.minQty||10,supplier:item.supplier||"",unit_cost:item.unitCost||0,selling_price:item.sellingPrice||0,location:item.location||"",user_id:userId};
        const{data}=await supabase.from("inventory").insert(row).select().single();
        if(data)nextInv.push({...data,minQty:data.min_qty,unitCost:parseFloat(data.unit_cost),sellingPrice:parseFloat(data.selling_price)});
        added++;
      }
    }
    setInventory(nextInv);
    addLog("Import",`Bulk import (${importPreview.length} items)`,importPreview.length,"Staff",`${added} added, ${updated} updated`);
    setMergeStats({added,updated,total:importPreview.length});
    setImportPreview([]);setImportErrors([]);setImportStatus("done");setPasteText("");setManualRows([emptyRec]);
  }
  function resetImport(){setImportPreview([]);setImportErrors([]);setImportStatus("");setMergeStats(null);}
  function downloadTemplate(){const blob=new Blob([CSV_TEMPLATE],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="stockguard_import_template.csv";a.click();URL.revokeObjectURL(url);}
  function exportCSV(type){let headers,rows;if(type==="inventory"){headers=["SKU","Name","Category","Qty","MinQty","Supplier","UnitCost","SellingPrice","Location"];rows=inventory.map(i=>[i.sku,i.name,i.category,i.qty,i.minQty,i.supplier,i.unitCost,i.sellingPrice||"",i.location]);}else if(type==="sales"){headers=["Time","Item","SKU","Qty","Revenue","Profit","Invoice"];rows=audit.filter(a=>a.action==="Sold").map(a=>[a.time,a.item,a.sku||"",a.qty,a.revenue||0,a.profit||0,a.note]);}else{headers=["Time","Action","Item","Qty","Revenue","Profit","User","Note"];rows=audit.map(a=>[a.time,a.action,a.item,a.qty,a.revenue||0,a.profit||0,a.user,a.note]);}const csv=[headers,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`stockguard_${type}.csv`;a.click();URL.revokeObjectURL(url);}
  async function runAiAnalysis(){setAiLoading(true);setAiAnalysis("");const lowData=lowItems.map(i=>`${i.name} (SKU: ${i.sku}): qty ${i.qty}, min ${i.minQty}, supplier: ${i.supplier}`).join("\n");try{const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1000,messages:[{role:"user",content:`You are a supply chain analyst. Analyze these low-inventory items:\n\n${lowData}\n\nFor each item give:\n1. Urgency level (Critical/High/Normal)\n2. Recommended reorder quantity\n3. Brief reason\n4. Risk if not reordered\n\nBe concise. Format as a short bullet list per item.`}]})});const data=await res.json();setAiAnalysis(data.content?.find(b=>b.type==="text")?.text||"No analysis returned.");}catch(e){setAiAnalysis("Unable to connect to AI analysis. Please try again.");}setAiLoading(false);}
  async function runBusinessInsights(){setInsightLoading(true);setSwotData(null);setPorterData(null);setMoneyData(null);const invSummary=inventory.map(i=>`${i.name}: qty=${i.qty}, min=${i.minQty}, supplier=${i.supplier}, cost=$${i.unitCost}, sell=$${i.sellingPrice||0}`).join("\n");const prompt=`You are a business strategist analyzing a small retail store. Inventory:\n\n${invSummary}\n\nIndustry: ${industry}\nLow stock: ${lowItems.length}, Out of stock: ${outItems.length}, Cost value: $${totalValue.toFixed(0)}, Retail value: $${totalRetail.toFixed(0)}, Avg margin: ${avgMargin.toFixed(1)}%\n\nRespond ONLY with valid JSON (no markdown):\n{"swot":{"strengths":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}],"weaknesses":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}],"opportunities":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}],"threats":[{"point":"...","action":"..."},{"point":"...","action":"..."},{"point":"...","action":"..."}]},"porter":{"supplier_power":{"rating":"Low|Medium|High","insight":"...","action":"..."},"buyer_power":{"rating":"Low|Medium|High","insight":"...","action":"..."},"competitive_rivalry":{"rating":"Low|Medium|High","insight":"...","action":"..."},"new_entrants":{"rating":"Low|Medium|High","insight":"...","action":"..."},"substitutes":{"rating":"Low|Medium|High","insight":"...","action":"..."}},"money":{"revenue_growth":[{"title":"...","description":"...","impact":"High|Medium|Low"},{"title":"...","description":"...","impact":"High|Medium|Low"},{"title":"...","description":"...","impact":"High|Medium|Low"}],"cost_reduction":[{"title":"...","description":"...","saving":"..."},{"title":"...","description":"...","saving":"..."},{"title":"...","description":"...","saving":"..."}],"new_products":[{"title":"...","description":"...","rationale":"..."},{"title":"...","description":"...","rationale":"..."},{"title":"...","description":"...","rationale":"..."}]}}`;try{const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:4000,messages:[{role:"user",content:prompt}]})});const data=await res.json();if(data.error)throw new Error(data.error.message);const text=data.content?.find(b=>b.type==="text")?.text||"";const match=text.match(/\{[\s\S]*\}/);if(!match)throw new Error("No JSON in response");const parsed=JSON.parse(match[0]);if(!parsed.swot||!parsed.porter||!parsed.money)throw new Error("Incomplete response");setSwotData(parsed.swot);setPorterData(parsed.porter);setMoneyData(parsed.money);}catch(e){setSwotData({error:`Analysis failed: ${e.message}. Please try again.`});}setInsightLoading(false);}

  const inp={padding:"7px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:13,width:"100%",boxSizing:"border-box"};
  const btn=(bg)=>({padding:"7px 14px",borderRadius:6,border:"none",background:bg,color:"#fff",fontSize:13,cursor:"pointer",fontWeight:500});

  if(dbLoading) return(
    <div style={{minHeight:"100vh",background:"#EEF2F7",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" style={{marginBottom:16}}><rect width="40" height="40" rx="10" fill="#1B2B4B"/><text x="4" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">S</text><text x="19" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">G</text></svg>
        <div style={{fontWeight:600,fontSize:16,color:"#1B2B4B",marginBottom:8}}>Loading StockGuard...</div>
        <div style={{fontSize:13,color:"#888"}}>Connecting to database</div>
      </div>
    </div>
  );

  const isMobile=typeof window!=="undefined"&&window.innerWidth<=768;
  const BOTTOM_TABS=["Dashboard","Sales","Reorder Center","Receiving","Purchase Orders"].filter(t=>TABS.includes(t)); // first 5 tabs in bottom nav

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"system-ui,-apple-system,sans-serif",color:C.text,background:"#EEF2F7"}}>
      {/* Sidebar — hidden on mobile via inline media workaround */}
      <style>{`
        @media(max-width:768px){
          .sg-sidebar{display:none!important;}
          .sg-main{margin-left:0!important;}
          .sg-content{padding:12px 14px!important;padding-bottom:80px!important;max-width:100%!important;}
          .sg-header{padding:14px 16px 12px!important;}
          .sg-header h1{font-size:18px!important;}
          .sg-bottom-nav{display:flex!important;}
          .sg-tab-header-icon{font-size:22px!important;}
          .sg-table-wrap{overflow-x:auto!important;-webkit-overflow-scrolling:touch;}
          .sg-form-grid{grid-template-columns:1fr!important;}
          .sg-stats-grid{grid-template-columns:1fr 1fr!important;}
          .sg-btn-row{flex-wrap:wrap!important;gap:6px!important;}
          .sg-po-row{flex-direction:column!important;gap:8px!important;}
          .sg-po-actions{flex-direction:row!important;justify-content:flex-start!important;}
          .sg-tab-pills{flex-wrap:wrap!important;}
          .sg-dash-top{grid-template-columns:1fr!important;}
          .sg-alert-row{flex-direction:flex-start!important;align-items:flex-start!important;gap:6px!important;}
          .sg-alert-right{width:100%!important;justify-content:space-between!important;}
          .sg-two-col{grid-template-columns:1fr!important;}
        }
        @media(min-width:769px){
          .sg-bottom-nav{display:none!important;}
        }
        .sg-bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#1B2B4B;z-index:200;border-top:1px solid rgba(255,255,255,0.1);padding:6px 0 8px;}
        .sg-bottom-nav button{flex:1;background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px;font-size:10px;font-family:system-ui,-apple-system,sans-serif;}
        .sg-bottom-nav button.active{color:#fff;}
        .sg-bottom-nav button i{font-size:20px;}
        .sg-more-menu{position:fixed;bottom:64px;left:0;right:0;background:#1B2B4B;z-index:199;padding:8px;border-top:1px solid rgba(255,255,255,0.1);display:grid;grid-template-columns:1fr 1fr;gap:4px;}
        .sg-more-menu button{background:rgba(255,255,255,0.07);border:none;color:rgba(255,255,255,0.8);cursor:pointer;padding:10px 12px;border-radius:8px;font-size:13px;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;gap:8px;text-align:left;}
        .sg-more-menu button.active{background:rgba(255,255,255,0.18);color:#fff;font-weight:600;}
        @media(max-width:768px){
          div[style*='grid-template-columns: 1fr 1fr'],
          div[style*='gridTemplateColumns: "1fr 1fr"'],
          div[style*='gridTemplateColumns:"1fr 1fr"']{grid-template-columns:1fr!important;}
          div[style*='grid-template-columns: repeat(auto-fit'],
          div[style*='gridTemplateColumns:"repeat(auto-fit']{grid-template-columns:1fr 1fr!important;}
          div[style*='grid-template-columns: 180px'],
          div[style*='gridTemplateColumns:"180px']{grid-template-columns:1fr!important;}
          table{font-size:11px!important;}
          th,td{padding:5px 6px!important;}
          div[style*='maxWidth:960']{max-width:100%!important;}
          div[style*='padding:"24px 28px']{padding:12px 14px!important;}
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sg-sidebar" style={{width:SIDEBAR_W,minWidth:SIDEBAR_W,background:SIDEBAR,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:100,overflowY:"auto"}}>
        <div style={{padding:"24px 16px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#ffffff" fillOpacity="0.12"/><text x="4" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">S</text><text x="19" y="28" fontSize="22" fontWeight="700" fill="#ffffff" fontFamily="system-ui">G</text><rect x="33" y="10" width="2" height="10" rx="1" fill="#ffffff" opacity="0.9"/><rect x="30" y="13.5" width="8" height="2" rx="1" fill="#ffffff" opacity="0.9"/></svg>
            <div><div style={{color:"#fff",fontWeight:700,fontSize:16,lineHeight:1}}>StockGuard</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:10,marginTop:3}}>{isOwner?"Owner View":"Cashier View"}</div></div>
          </div>
          <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:isOwner?"rgba(255,255,255,0.1)":"rgba(15,110,86,0.4)",borderRadius:8,padding:"4px 10px"}}>
            <span style={{fontSize:12}}>{isOwner?"👔":"🧾"}</span>
            <span style={{fontSize:11,color:"#fff",fontWeight:600}}>{isOwner?"Owner":"Cashier"}</span>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 8px"}}>{[{label:"OVERVIEW",tabs:["Dashboard"]},{label:"INVENTORY",tabs:["Receiving","Movements","Reorder Center","Import Products"]},{label:"TRADING",tabs:["Sales","Purchase Orders"]},{label:"SUPPLY CHAIN",tabs:["Suppliers","shopify","quickbooks"]},{label:"INTELLIGENCE",tabs:["Intelligence","Business Insights","Automations"]},{label:"RECORDS",tabs:["Audit Trail"]},{label:"ACCOUNT",tabs:["Pricing","billing"]}].map((group,gi)=>{const groupTabs=group.tabs.filter(t=>TABS.includes(t));if(!groupTabs.length)return null;return(<div key={group.label}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em",padding:gi===0?"12px 12px 4px":"16px 12px 4px",textTransform:"uppercase"}}>{group.label}</div>{groupTabs.map(t=>{const active=tab===t;return(<button key={t} onClick={()=>setTab(t)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",background:active?"rgba(255,255,255,0.15)":"transparent",color:active?"#fff":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:active?600:400,marginBottom:1,textAlign:"left"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color="#fff";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}}><i className={`ti ${TAB_ICONS[t]}`} style={{fontSize:17,minWidth:18}} aria-hidden="true"/><span style={{fontSize:13}}>{t==="shopify"?"Shopify":t==="billing"?"Billing":t==="quickbooks"?"QuickBooks":t}</span>{t==="Reorder Center"&&lowItems.length>0&&(<span style={{marginLeft:"auto",background:"#E24B4A",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{lowItems.length}</span>)}</button>);})}</div>);})}</nav>
        <div style={{padding:"16px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <button onClick={onLogout} style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",marginBottom:12}}>🔄 Switch Role</button>
          <div style={{color:"rgba(255,255,255,0.35)",fontSize:10,textAlign:"center",lineHeight:1.5,fontStyle:"italic"}}>"Commit to the Lord whatever you do"<br/>Proverbs 16:3</div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sg-bottom-nav">
        {BOTTOM_TABS.map(t=>(
          <button key={t} className={tab===t?"active":""} onClick={()=>{setTab(t);setShowMoreMenu(false);}}>
            <i className={`ti ${TAB_ICONS[t]}`} aria-hidden="true"/>
            <span>{t==="Reorder Center"?"Reorder":t==="Purchase Orders"?"POs":t}</span>
            {t==="Reorder Center"&&lowItems.length>0&&<span style={{position:"absolute",top:4,background:"#E24B4A",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:10,marginLeft:12}}>{lowItems.length}</span>}
          </button>
        ))}
        <button className={!BOTTOM_TABS.includes(tab)&&showMoreMenu?"active":""} onClick={()=>setShowMoreMenu(m=>!m)}>
          <i className="ti ti-dots" aria-hidden="true"/>
          <span>More</span>
        </button>
      </nav>

      {/* Mobile more menu */}
      {showMoreMenu&&(
        <div className="sg-more-menu">
          {TABS.slice(5).map(t=>(
            <button key={t} className={tab===t?"active":""} onClick={()=>{setTab(t);setShowMoreMenu(false);}}>
              <i className={`ti ${TAB_ICONS[t]}`} style={{fontSize:16}} aria-hidden="true"/>
              {t}
            </button>
          ))}
          <button onClick={()=>{onLogout();setShowMoreMenu(false);}} style={{gridColumn:"1/-1"}}>
            <i className="ti ti-logout" style={{fontSize:16}} aria-hidden="true"/>
            Switch Role
          </button>
        </div>
      )}

      <div className="sg-main" style={{marginLeft:SIDEBAR_W,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <div className="sg-header" style={{background:TAB_COLORS[tab]||"#185FA5",padding:"20px 28px 16px",color:"#fff"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <i className={`ti ${TAB_ICONS[tab]} sg-tab-header-icon`} style={{fontSize:28,opacity:0.9}} aria-hidden="true"/>
            <div>
              <h1 style={{fontSize:22,fontWeight:600,margin:0,color:"#fff"}}>{tab}</h1>
              <p style={{fontSize:12,margin:0,opacity:0.75}}>
                {tab==="Dashboard"&&"Your inventory at a glance"}
                {tab==="Receiving"&&"Log incoming shipments"}
                {tab==="Movements"&&"Track stock movements"}
                {tab==="Sales"&&"Record sales and dispatches"}
                {tab==="Reorder Center"&&`${lowItems.length} item${lowItems.length!==1?"s":""} need attention`}
                {tab==="Purchase Orders"&&`${pos.length} purchase order${pos.length!==1?"s":""}`}
                {tab==="Suppliers"&&`${suppliers.length} supplier${suppliers.length!==1?"s":""} on file`}
                {tab==="Audit Trail"&&"Full activity history"}
                {tab==="Intelligence"&&"Demand forecasting, what-if simulation, and overstock analysis"}
                {tab==="Business Insights"&&"AI-powered business analysis"}
                {tab==="Automations"&&"Automate your inventory workflows"}
                {tab==="Import Products"&&"Bulk import your inventory"}
        {tab==="Pricing"&&"Choose the right plan"}
              </p>
            </div>
          </div>
        </div>

        <div className="sg-content" style={{flex:1,padding:"24px 28px",maxWidth:960}}>

      {tab==="Dashboard"&&(<div>
        <div style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:16,marginBottom:20}}>
          <div style={{background:healthBg,border:`1px solid ${healthColor}33`,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
            <div style={{fontSize:11,color:healthColor,fontWeight:600,marginBottom:6,opacity:0.8}}>Inventory Health</div>
            <div onClick={(e)=>openPop(e,{title:"Inventory Health Score",what:"Starts at 100. Deductions: -15 per out-of-stock item, -8 per low-stock item, -10 if avg margin below 20%, -5 if below 40%.",rows:[{label:"Base score",value:"100",color:"#3B6D11"},{label:"Out of stock ("+outItems.length+"x -15)",value:"-"+(outItems.length*15),color:"#A32D2D"},{label:"Low stock ("+(lowItems.filter(i=>i.qty>0).length)+"x -8)",value:"-"+(lowItems.filter(i=>i.qty>0).length*8),color:"#BA7517"},{label:"Margin penalty",value:"-"+(avgMargin>=40?0:avgMargin>=20?5:10),color:"#854F0B"},{label:"Your score",value:healthScore+"/100",color:healthColor}],action:"Fix low stock",onAction:()=>setTab("Reorder Center")})} style={{fontSize:44,fontWeight:700,color:healthColor,lineHeight:1,cursor:"pointer",textDecoration:"underline dotted"}}>{healthScore}</div>
            <div style={{fontSize:10,color:healthColor,marginTop:4,opacity:0.8}}>/100</div>
            <div style={{marginTop:8,background:healthColor,color:"#fff",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:10}}>{healthLabel}</div>
            {outItems.length>0&&<div style={{fontSize:10,color:healthColor,marginTop:6,opacity:0.75}}>{outItems.length} out of stock</div>}
          </div>
          <div style={{background:"linear-gradient(135deg,#185FA5 0%,#0d3d6b 100%)",borderRadius:12,padding:"16px 20px",color:"#fff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div><div style={{fontSize:12,opacity:0.8,marginBottom:2}}>Today's Sales Summary</div><div onClick={(e)=>openPop(e,{title:"Today's Revenue",what:"Gross income from all sales today. Revenue = selling price x qty sold. Does not deduct product costs.",rows:Object.entries(todayItemQty).map(([nm,qty])=>{const it=inventory.find(i=>i.name===nm);return{label:nm+" ("+qty+"u)",value:it?"$"+(it.sellingPrice*qty).toFixed(2):qty+" units"};}).concat([{label:"Total revenue",value:"$"+todaySales.revenue.toFixed(2),color:"#185FA5"}])})} style={{fontSize:28,fontWeight:700,lineHeight:1,cursor:"pointer",textDecoration:"underline dotted"}}>${todaySales.revenue.toFixed(2)}</div><div style={{fontSize:12,opacity:0.8,marginTop:2}}>{revenueUp?"▲":"▼"} vs yesterday ${yesterdaySales.revenue.toFixed(2)}</div></div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}><div style={{textAlign:"center"}}><div onClick={(e)=>openPop(e,{title:"Today's Profit",what:"Profit = (selling price - unit cost) x qty. What you keep after paying for goods sold.",rows:Object.entries(todayItemQty).map(([nm,qty])=>{const it=inventory.find(i=>i.name===nm);const p=it?((it.sellingPrice||0)-it.unitCost)*qty:0;return{label:nm,value:"$"+p.toFixed(2),color:p>=0?"#3B6D11":"#A32D2D"};}).concat([{label:"Total profit",value:"$"+todaySales.profit.toFixed(2),color:"#A8D57B"}])})} style={{fontSize:20,fontWeight:700,color:"#A8D57B",cursor:"pointer",textDecoration:"underline dotted"}}>${todaySales.profit.toFixed(2)}</div><div style={{fontSize:11,opacity:0.8}}>Profit today</div></div><div style={{textAlign:"center"}}><div onClick={(e)=>openPop(e,{title:"Units Sold Today",what:"Total individual units sold across all transactions today.",rows:Object.entries(todayItemQty).map(([nm,qty])=>({label:nm,value:qty+" units"})).concat([{label:"Total units",value:todaySales.units,color:"#7EC8E3"}])})} style={{fontSize:20,fontWeight:700,color:"#7EC8E3",cursor:"pointer",textDecoration:"underline dotted"}}>{todaySales.units}</div><div style={{fontSize:11,opacity:0.8}}>Units sold</div></div><div style={{textAlign:"center"}}><div onClick={(e)=>openPop(e,{title:"Transactions Today",what:"Number of separate sale events recorded today. One transaction can cover multiple products.",rows:[{label:"Sales recorded",value:todaySales.transactions},{label:"Avg units/sale",value:todaySales.transactions>0?(todaySales.units/todaySales.transactions).toFixed(1):"--"},{label:"Avg revenue/sale",value:todaySales.transactions>0?"$"+(todaySales.revenue/todaySales.transactions).toFixed(2):"--",color:"#F9C74F"}]})} style={{fontSize:20,fontWeight:700,color:"#F9C74F",cursor:"pointer",textDecoration:"underline dotted"}}>{todaySales.transactions}</div><div style={{fontSize:11,opacity:0.8}}>Transactions</div></div></div>
            </div>
            {topItem&&<div style={{marginTop:10,padding:"6px 12px",background:"rgba(255,255,255,0.12)",borderRadius:8,fontSize:12}}>🏆 Top seller today: <strong>{topItem[0]}</strong> — {topItem[1]} units</div>}
            {!topItem&&<div style={{marginTop:10,padding:"6px 12px",background:"rgba(255,255,255,0.12)",borderRadius:8,fontSize:12,opacity:0.8}}>No sales recorded yet today. Go make some sales! 💪</div>}
          </div>
        </div>
        <div style={{background:C.bg2,borderRadius:10,padding:"14px 16px",marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:12}}>Revenue — last 7 days</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:110}}>
            {Object.entries(salesByDay).map(([day,data])=>{const isToday=day===today;const barH=maxRevenue>0?Math.max((data.revenue/maxRevenue)*72,data.revenue>0?6:2):2;return(<div key={day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{fontSize:10,color:C.muted,fontWeight:isToday?700:400,marginBottom:4}}>${data.revenue>0?data.revenue.toFixed(0):0}</div><div onClick={(e)=>data.revenue>0&&openPop(e,{title:isToday?"Today":"Revenue: "+day,what:"Sales recorded on this day.",rows:[{label:"Revenue",value:"$"+data.revenue.toFixed(2),color:"#185FA5"},{label:"Profit",value:"$"+data.profit.toFixed(2),color:"#3B6D11"},{label:"Units sold",value:data.units},{label:"Transactions",value:data.transactions}]})} style={{width:"100%",height:barH,background:isToday?"#185FA5":"#B8D4F0",borderRadius:"3px 3px 0 0",cursor:data.revenue>0?"pointer":"default"}}/><div style={{fontSize:10,color:isToday?C.text:C.muted,fontWeight:isToday?700:400,whiteSpace:"nowrap"}}>{shortDate(day)}</div></div>);})}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:20}}>
          <><div style={{background:C.bg2,borderRadius:8,padding:"14px 16px"}}><div style={{fontSize:12,color:C.muted,marginBottom:4}}>Total SKUs</div><div onClick={(e)=>openPop(e,{title:"Total SKUs",what:"Count of unique products in your inventory. Each SKU is one distinct product regardless of quantity.",rows:Object.entries(inventory.reduce((m,i)=>{m[i.category]=(m[i.category]||0)+1;return m;},{})).map(([cat,n])=>({label:cat,value:n+" SKUs"})).concat([{label:"Total",value:inventory.length+" SKUs",color:"#185FA5"}])})} style={{fontSize:22,fontWeight:600,color:"#185FA5",cursor:"pointer",textDecoration:"underline dotted"}}>{inventory.length}</div></div><div style={{background:C.bg2,borderRadius:8,padding:"14px 16px"}}><div style={{fontSize:12,color:C.muted,marginBottom:4}}>Low stock</div><div onClick={(e)=>openPop(e,{title:"Low Stock Items",what:"Items below minimum quantity. Each one is a stockout risk.",rows:lowItems.slice(0,7).map(i=>({label:i.name,value:i.qty+" / "+i.minQty+" min",color:"#BA7517"})).concat([{label:"Total",value:lowItems.length+" items",color:"#A32D2D"}]),action:"Go to Reorder Center",onAction:()=>setTab("Reorder Center")})} style={{fontSize:22,fontWeight:600,color:"#BA7517",cursor:"pointer",textDecoration:"underline dotted"}}>{lowItems.length}</div></div><div style={{background:C.bg2,borderRadius:8,padding:"14px 16px"}}><div style={{fontSize:12,color:C.muted,marginBottom:4}}>Cost value</div><div onClick={(e)=>openPop(e,{title:"Inventory Cost Value",what:"Total capital tied up in stock at purchase cost. Qty x unit cost per item. Top 5 shown.",rows:inventory.slice().sort((a,b)=>b.qty*b.unitCost-a.qty*a.unitCost).slice(0,5).map(i=>({label:i.name,value:"$"+(i.qty*i.unitCost).toFixed(0)})).concat([{label:"Total",value:"$"+totalValue.toLocaleString("en-US",{maximumFractionDigits:0}),color:"#3B6D11"}])})} style={{fontSize:22,fontWeight:600,color:"#3B6D11",cursor:"pointer",textDecoration:"underline dotted"}}>${totalValue.toLocaleString("en-US",{maximumFractionDigits:0})}</div></div><div style={{background:C.bg2,borderRadius:8,padding:"14px 16px"}}><div style={{fontSize:12,color:C.muted,marginBottom:4}}>Retail value</div><div onClick={(e)=>openPop(e,{title:"Inventory Retail Value",what:"What your stock would sell for at full price. Retail minus cost = potential gross profit.",rows:[{label:"Retail value",value:"$"+totalRetail.toLocaleString("en-US",{maximumFractionDigits:0}),color:"#534AB7"},{label:"Cost value",value:"$"+totalValue.toLocaleString("en-US",{maximumFractionDigits:0}),color:"#A32D2D"},{label:"Potential profit",value:"$"+(totalRetail-totalValue).toLocaleString("en-US",{maximumFractionDigits:0}),color:"#3B6D11"}]})} style={{fontSize:22,fontWeight:600,color:"#534AB7",cursor:"pointer",textDecoration:"underline dotted"}}>${totalRetail.toLocaleString("en-US",{maximumFractionDigits:0})}</div></div><div style={{background:C.bg2,borderRadius:8,padding:"14px 16px"}}><div style={{fontSize:12,color:C.muted,marginBottom:4}}>Avg margin</div><div onClick={(e)=>openPop(e,{title:"Average Gross Margin",what:"Average of (sell - cost) / sell across all priced items. Shows how much of each sale you keep.",rows:inventory.filter(i=>i.sellingPrice>i.unitCost).sort((a,b)=>((b.sellingPrice-b.unitCost)/b.sellingPrice)-((a.sellingPrice-a.unitCost)/a.sellingPrice)).slice(0,5).map(i=>({label:i.name,value:(((i.sellingPrice-i.unitCost)/i.sellingPrice)*100).toFixed(0)+"%",color:((i.sellingPrice-i.unitCost)/i.sellingPrice)>=0.4?"#3B6D11":"#854F0B"})).concat([{label:"Average",value:avgMargin>0?avgMargin.toFixed(1)+"%":"--",color:avgMargin>=40?"#3B6D11":avgMargin>=20?"#854F0B":"#A32D2D"}])})} style={{fontSize:22,fontWeight:600,color:avgMargin>=40?"#3B6D11":avgMargin>=20?"#854F0B":"#A32D2D",cursor:"pointer",textDecoration:"underline dotted"}}>{avgMargin>0?avgMargin.toFixed(1)+"%":"--"}</div></div></>
        </div>
        {lowItems.length>0&&<div style={{background:"#FAEEDA",border:"1px solid #EF9F27",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontWeight:600,color:"#854F0B",fontSize:13,marginBottom:8}}>Low stock alerts ({lowItems.length})</div>
          {lowItems.map(i=>{const s=statusBadge(i.qty,i.minQty);const days=daysUntilStockout(i);return(<div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #EF9F2733",fontSize:13}}>
            <span style={{color:"#633806"}}>{i.name} <span style={{color:"#BA7517"}}>({i.sku})</span>{days!==null&&<span style={{marginLeft:8,fontSize:11,fontWeight:600,background:days<=3?"#FCEBEB":days<=7?"#FAEEDA":"#E6F1FB",color:days<=3?"#A32D2D":days<=7?"#854F0B":"#185FA5",padding:"2px 7px",borderRadius:8}}>{days<=0?"Stockout imminent":`~${days}d until stockout`}</span>}</span>
            <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#854F0B"}}>{i.qty} / {i.minQty}</span><span style={{background:s.bg,color:s.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span><button onClick={()=>{handleReorder(i);setTab("Reorder Center");}} style={{...btn("#BA7517"),padding:"3px 10px",fontSize:11}}>Reorder</button></span>
          </div>);})}
        </div>}
        {deadInventory.length>0&&<div style={{background:"#1B2B4B",border:"1px solid #0D1F36",borderRadius:8,padding:"12px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontWeight:600,color:"#fff",fontSize:13}}>💀 Dead Inventory Alert</div>
            <button onClick={()=>{setTab("Intelligence");setIntelTab("Overstock");}} style={{...btn("#E24B4A"),padding:"3px 10px",fontSize:11}}>View all →</button>
          </div>
          <div style={{background:"rgba(226,75,74,0.15)",border:"1px solid rgba(226,75,74,0.4)",borderRadius:8,padding:"10px 14px",marginBottom:10}}>
            <div style={{fontSize:22,fontWeight:700,color:"#E24B4A"}}>${totalDeadValue.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:2}}>trapped in {deadInventory.length} slow-moving item{deadInventory.length!==1?"s":""} — not selling</div>
          </div>
          {deadInventory.slice(0,3).map(i=>(
            <div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:12}}>
              <div>
                <span style={{color:"#fff",fontWeight:500}}>{i.name}</span>
                <span style={{color:"rgba(255,255,255,0.5)",marginLeft:8}}>{i.daysSince===null?"Never sold":`No sales in ${i.daysSince}d`}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#E24B4A",fontWeight:600}}>${i.trapped.toLocaleString("en-US",{maximumFractionDigits:0})} trapped</span>
                <span style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",fontSize:10,padding:"2px 7px",borderRadius:6}}>Try ${i.discountPrice}</span>
              </div>
            </div>
          ))}
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:500,color:C.muted}}>All inventory</div>
          <div style={{display:"flex",gap:6}}><button onClick={()=>exportCSV("inventory")} style={{...btn("#185FA5"),padding:"5px 12px",fontSize:11}}>⬇ Inventory CSV</button><button onClick={()=>exportCSV("sales")} style={{...btn("#3B6D11"),padding:"5px 12px",fontSize:11}}>⬇ Sales CSV</button><button onClick={()=>exportCSV("audit")} style={{...btn("#534AB7"),padding:"5px 12px",fontSize:11}}>⬇ Audit CSV</button></div>
        </div>
        <input placeholder="Search by name, SKU, or category" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:10}}/>
        <div className="sg-table-wrap" style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["SKU","Item","Cat","Qty","Min","Cost","Sell","Margin","Location","Status","Actions"].map(h=>(<th key={h} style={{textAlign:h==="Actions"?"right":"left",padding:"6px 8px",fontWeight:500,color:C.muted,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
          <tbody>{filteredInv.map(i=>{const s=statusBadge(i.qty,i.minQty);const m=marginBadge(i.unitCost,i.sellingPrice);const isEditing=editId===i.id;const isConfirmingDelete=deleteConfirmId===i.id;
            if(isEditing)return(<tr key={i.id} style={{borderBottom:`1px solid ${C.border}`,background:"#F0F4FF"}}>{[["sku",70],["name",120],["category",90],["qty",55,"number"],["minQty",55,"number"],["unitCost",70,"number"],["sellingPrice",70,"number"]].map(([f,w,t])=>(<td key={f} style={{padding:"5px 6px"}}><input type={t||"text"} value={editForm[f]||""} onChange={e=>setEditForm(f2=>({...f2,[f]:e.target.value}))} style={{...inp,fontSize:11,padding:"4px 6px",width:w}}/></td>))}<td style={{padding:"5px 6px"}}><input value={editForm.location||""} onChange={e=>setEditForm(f=>({...f,location:e.target.value}))} style={{...inp,fontSize:11,padding:"4px 6px",width:80}}/></td><td/><td style={{padding:"5px 6px",textAlign:"right"}}><div style={{display:"flex",gap:4,justifyContent:"flex-end"}}><button onClick={saveEdit} style={{...btn("#3B6D11"),padding:"4px 10px",fontSize:11}}>Save</button><button onClick={cancelEdit} style={{...btn("#888"),padding:"4px 10px",fontSize:11}}>Cancel</button></div></td></tr>);
            return(<tr key={i.id} style={{borderBottom:`1px solid ${C.border}`,background:isConfirmingDelete?"#FFF5F5":"transparent"}}>
              <td style={{padding:"7px 8px",color:C.muted}}>{i.sku}</td><td style={{padding:"7px 8px",fontWeight:500}}>{i.name}</td><td style={{padding:"7px 8px",color:C.muted}}>{i.category}</td>
              <td style={{padding:"7px 8px",fontWeight:600,color:i.qty<i.minQty?"#A32D2D":C.text}}>{i.qty}</td><td style={{padding:"7px 8px",color:C.muted}}>{i.minQty}</td>
              <td style={{padding:"7px 8px",color:C.muted}}>${i.unitCost.toFixed(2)}</td><td style={{padding:"7px 8px",color:C.muted}}>{i.sellingPrice?`$${i.sellingPrice.toFixed(2)}`:"—"}</td>
              <td style={{padding:"7px 8px"}}>{i.sellingPrice?<span style={{background:m.bg,color:m.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{((i.sellingPrice-i.unitCost)/i.sellingPrice*100).toFixed(0)}% · +${m.profit.toFixed(2)}</span>:<span style={{color:C.muted,fontSize:11}}>Not set</span>}</td>
              <td style={{padding:"7px 8px",color:C.muted}}>{i.location}</td>
              <td style={{padding:"7px 8px"}}><span style={{background:s.bg,color:s.color,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span></td>
              <td style={{padding:"7px 8px",textAlign:"right"}}>{isConfirmingDelete?(<div style={{display:"flex",gap:4,alignItems:"center",justifyContent:"flex-end"}}><span style={{fontSize:11,color:"#A32D2D",fontWeight:500}}>Delete?</span><button onClick={()=>doDelete(i)} style={{...btn("#A32D2D"),padding:"3px 8px",fontSize:11}}>Yes</button><button onClick={()=>setDeleteConfirmId(null)} style={{...btn("#888"),padding:"3px 8px",fontSize:11}}>No</button></div>):(<div style={{display:"flex",gap:4,justifyContent:"flex-end"}}><button onClick={()=>openChat("inventory",i.id,i.name)} style={{...btn("#0D7E6E"),padding:"3px 10px",fontSize:11}}>💬</button><button onClick={()=>startEdit(i)} style={{...btn("#185FA5"),padding:"3px 10px",fontSize:11}}>Edit</button><button onClick={()=>confirmDelete(i.id)} style={{...btn("#A32D2D"),padding:"3px 10px",fontSize:11}}>Delete</button></div>)}</td>
            </tr>);
          })}</tbody>
        </table></div>
      </div>)}

      {tab==="Receiving"&&(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontWeight:500}}>Log incoming shipment</div><button onClick={()=>{if(recScanMode){setRecScanMode(false);setRecCameraActive(false);setRecCameraError("");if(window._sgStopRecCamera)window._sgStopRecCamera();}else{setRecScanMode(true);startRecCameraScan();}}} style={{...btn(recScanMode?"#A32D2D":"#0D7E6E"),padding:"6px 14px",fontSize:12}}>{recScanMode?"✕ Cancel scan":"📷 Scan SKU"}</button></div>{recScanMode&&(<div style={{background:"#0D1F2D",borderRadius:12,padding:"14px 16px",marginBottom:14,overflow:"hidden"}}>{recCameraActive&&(<div style={{position:"relative",marginBottom:12}}><video id="sg-rec-camera-feed" style={{width:"100%",borderRadius:8,display:"block",maxHeight:200,objectFit:"cover"}} playsInline muted/><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:200,height:80,border:"2px solid #0D7E6E",borderRadius:8,boxShadow:"0 0 0 1000px rgba(0,0,0,0.4)"}}/><div style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}><button onClick={async()=>{const vid=document.getElementById("sg-rec-camera-feed");if(!vid||!vid.videoWidth){setRecCameraError("Camera not ready yet.");return;}setRecCameraError("Scanning...");try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){if(window._sgStopRecCamera)window._sgStopRecCamera();handleRecScan(codes[0].rawValue);return;}}setRecCameraError("No barcode found. Tap again.");}catch(e){setRecCameraError("No barcode found. ("+e.name+")");}}} style={{background:"#0D7E6E",border:"none",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:15,fontWeight:700,cursor:"pointer"}}>📷 Tap to scan</button></div></div>)}{!recCameraActive&&!recCameraError&&<div style={{textAlign:"center",padding:"16px 0",color:"rgba(255,255,255,0.6)",fontSize:13}}><div style={{fontSize:28,marginBottom:6}}>📷</div><div>Starting camera...</div></div>}{recCameraError&&<div style={{background:"rgba(226,75,74,0.15)",border:"1px solid rgba(226,75,74,0.4)",borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#E24B4A"}}>{recCameraError}</div>}<div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:6}}>Or type barcode / SKU manually:</div><div style={{display:"flex",gap:8}}><input autoFocus placeholder="Scan or type barcode and press Enter" onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){handleRecScan(e.target.value);e.target.value="";}}} style={{...inp,fontSize:13,padding:"9px 12px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",flex:1}}/><button onClick={e=>{const el=e.currentTarget.previousSibling;if(el.value.trim()){handleRecScan(el.value);el.value="";}}} style={{...btn("#0D7E6E"),padding:"9px 16px"}}>Go</button></div></div>)}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
<div><label style={{fontSize:12,color:C.muted}}>SKU *</label><select value={recForm.sku} onChange={e=>{const item=inventory.find(i=>i.sku===e.target.value);if(item){setRecForm(r=>({...r,sku:item.sku,name:item.name,category:item.category,supplier:item.supplier,unitCost:item.unitCost,sellingPrice:item.sellingPrice,location:item.location}));}else{setRecForm(r=>({...r,sku:e.target.value}));}}} style={inp}><option value="">Select or type SKU</option>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} — {i.name}</option>)}{recForm.sku&&recForm.sku!=="__new__"&&!inventory.find(i=>i.sku===recForm.sku)&&<option value={recForm.sku}>{recForm.sku} (scanned)</option>}<option value="__new__">+ New item (type below)</option></select></div>
<div><label style={{fontSize:12,color:C.muted}}>Item name *</label><input type="text" placeholder="Auto-filled or type new" value={recForm.name} onChange={e=>setRecForm(r=>({...r,name:e.target.value}))} style={{...inp,background:inventory.find(i=>i.sku===recForm.sku)?"#f9f9f9":C.bg}}/></div>
<div><label style={{fontSize:12,color:C.muted}}>Category</label><select value={recForm.category} onChange={e=>handleCategorySelect(e.target.value)} style={inp}><option value="">Select category</option>{categories.map(cat=><option key={cat} value={cat}>{cat}</option>)}<option value={ADD_CATEGORY_VALUE}>+ Add Category...</option></select></div>
<div><label style={{fontSize:12,color:C.muted}}>Qty received *</label><input type="number" placeholder="0" value={recForm.qty} onChange={e=>setRecForm(r=>({...r,qty:e.target.value}))} style={inp}/></div>
<div><label style={{fontSize:12,color:C.muted}}>Supplier</label><select value={recForm.supplier} onChange={e=>setRecForm(r=>({...r,supplier:e.target.value}))} style={inp}><option value="">Select supplier</option>{suppliers.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
<div><label style={{fontSize:12,color:C.muted}}>Unit cost ($)</label><input type="number" placeholder="0.00" value={recForm.unitCost} onChange={e=>{const cost=e.target.value;const pct=parseFloat(recForm.markup)||0;const sp=pct&&cost?(parseFloat(cost)*(1+pct/100)).toFixed(2):recForm.sellingPrice;setRecForm(r=>({...r,unitCost:cost,sellingPrice:sp}));}} style={inp}/></div>
<div><label style={{fontSize:12,color:C.muted}}>Markup %</label><input type="number" placeholder="e.g. 50" value={recForm.markup} onChange={e=>{const pct=e.target.value;const cost=parseFloat(recForm.unitCost)||0;const sp=pct&&cost?(cost*(1+parseFloat(pct)/100)).toFixed(2):recForm.sellingPrice;setRecForm(r=>({...r,markup:pct,sellingPrice:sp}));}} style={inp}/></div><div><label style={{fontSize:12,color:C.muted}}>Selling price ($){recForm.markup&&recForm.unitCost?<span style={{marginLeft:6,color:"#3B6D11",fontSize:11,fontWeight:600}}>auto-calculated</span>:null}</label><input type="number" placeholder="0.00" value={recForm.sellingPrice} onChange={e=>setRecForm(r=>({...r,sellingPrice:e.target.value}))} style={inp}/></div>
<div><label style={{fontSize:12,color:C.muted}}>Storage location</label><input type="text" placeholder="Aisle A1" value={recForm.location} onChange={e=>setRecForm(r=>({...r,location:e.target.value}))} style={inp}/></div>
<div><label style={{fontSize:12,color:C.muted}}>PO number</label><input type="text" placeholder="PO-2201" value={recForm.po} onChange={e=>setRecForm(r=>({...r,po:e.target.value}))} style={inp}/></div>
</div><button onClick={handleReceive} style={btn("#185FA5")}>Confirm receipt</button><div style={{marginTop:24,fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Recent receipts</div>{audit.filter(a=>a.action==="Received").slice(0,8).map(a=>(<div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span style={{fontWeight:500}}>{a.item}</span><span style={{color:C.muted}}>+{a.qty} · {a.note} · {a.time}</span></div>))}</div>)}

      {tab==="Movements"&&(<div><div style={{fontWeight:500,marginBottom:12}}>Log inventory movement</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div><label style={{fontSize:12,color:C.muted}}>Select item</label><select value={moveForm.sku} onChange={e=>setMoveForm(f=>({...f,sku:e.target.value}))} style={inp}><option value="">Select SKU</option>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} - {i.name}</option>)}</select></div><div><label style={{fontSize:12,color:C.muted}}>Qty moved</label><input type="number" placeholder="0" value={moveForm.qty} onChange={e=>setMoveForm(f=>({...f,qty:e.target.value}))} style={inp}/></div><div><label style={{fontSize:12,color:C.muted}}>From</label><input placeholder="Stockroom" value={moveForm.from} onChange={e=>setMoveForm(f=>({...f,from:e.target.value}))} style={inp}/></div><div><label style={{fontSize:12,color:C.muted}}>To</label><input placeholder="Sales Floor" value={moveForm.to} onChange={e=>setMoveForm(f=>({...f,to:e.target.value}))} style={inp}/></div></div><button onClick={handleMove} style={btn("#0F6E56")}>Log movement</button><div style={{marginTop:24,fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Movement log</div>{audit.filter(a=>a.action==="Moved").map(a=>(<div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span style={{fontWeight:500}}>{a.item}</span><span style={{color:C.muted}}>{a.qty} units · {a.note} · {a.time}</span></div>))}</div>)}

      {tab==="Sales"&&(<div>
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:20,flexWrap:"wrap"}}>
          <div><div style={{fontSize:11,color:C.muted}}>Today's revenue</div><div style={{fontSize:18,fontWeight:700,color:"#185FA5"}}>${todaySales.revenue.toFixed(2)}</div></div>
          <div><div style={{fontSize:11,color:C.muted}}>Today's profit</div><div style={{fontSize:18,fontWeight:700,color:"#3B6D11"}}>${todaySales.profit.toFixed(2)}</div></div>
          <div><div style={{fontSize:11,color:C.muted}}>Units sold</div><div style={{fontSize:18,fontWeight:700,color:"#534AB7"}}>{todaySales.units}</div></div>
          <div><div style={{fontSize:11,color:C.muted}}>Transactions</div><div style={{fontSize:18,fontWeight:700,color:"#854F0B"}}>{todaySales.transactions}</div></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:500}}>Record sale / dispatch</div>
          <button onClick={()=>{
            if(scanMode){setScanMode(false);setScanInput("");setScanFeedback(null);stopCamera();setCameraActive(false);setCameraError("");}
            else{setScanMode(true);setScanFeedback(null);startSaleCameraScan();}
          }} style={{...btn(scanMode?"#A32D2D":"#0D7E6E"),padding:"6px 14px",fontSize:12}}>
            {scanMode?"✕ Cancel scan":"📷 Scan barcode"}
          </button>
        </div>
        {scanMode&&(
          <div style={{background:"#0D1F2D",borderRadius:12,padding:"14px 16px",marginBottom:14,overflow:"hidden"}}>
            {cameraActive&&(
              <div style={{position:"relative",marginBottom:12}}>
                <video id="sg-sale-camera-feed" style={{width:"100%",borderRadius:8,display:"block",maxHeight:240,objectFit:"cover"}} playsInline muted/>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:200,height:100,border:"2px solid #0D7E6E",borderRadius:8,boxShadow:"0 0 0 1000px rgba(0,0,0,0.4)"}}/>
                <div style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",color:"rgba(255,255,255,0.8)",fontSize:12}}><button onClick={async(e)=>{e.stopPropagation();const vid=document.getElementById("sg-sale-camera-feed");if(!vid||!vid.videoWidth){setCameraError("Camera not ready.");return;}setCameraError("Scanning...");try{if("BarcodeDetector" in window){const det=new BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});const codes=await det.detect(vid);if(codes.length>0){handleSaleScan(codes[0].rawValue);return;}}setCameraError("No barcode found. Tap again.");}catch(e){setCameraError("No barcode found. Tap again.");}}} style={{background:"#0D7E6E",border:"none",color:"#fff",padding:"10px 28px",borderRadius:20,fontSize:15,fontWeight:700,cursor:"pointer"}}>📷 Tap to scan</button></div>
              </div>
            )}
            {!cameraActive&&!cameraError&&(
              <div style={{textAlign:"center",padding:"20px 0",color:"rgba(255,255,255,0.6)",fontSize:13}}>
                <div style={{fontSize:32,marginBottom:8}}>📷</div>
                <div>Starting camera...</div>
              </div>
            )}
            {cameraError&&(
              <div style={{background:"rgba(226,75,74,0.15)",border:"1px solid rgba(226,75,74,0.4)",borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#E24B4A"}}>{cameraError}</div>
            )}
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:6}}>Or type / paste SKU manually:</div>
            <div style={{display:"flex",gap:8}}>
              <input autoFocus placeholder="Type SKU and press Enter" value={scanInput} onChange={e=>setScanInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleScan(scanInput);}} style={{...inp,fontSize:13,padding:"9px 12px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",flex:1}}/>
              <button onClick={()=>handleScan(scanInput)} style={{...btn("#0D7E6E"),padding:"9px 16px"}}>Go</button>
            </div>
          </div>
        )}
        {scanFeedback&&(
          <div style={{background:scanFeedback.ok?"#EAF3DE":"#FCEBEB",border:`1px solid ${scanFeedback.ok?"#6BAD2E":"#E05A5A"}`,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:13,fontWeight:600,color:scanFeedback.ok?"#3B6D11":"#A32D2D"}}>
            {scanFeedback.msg}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={{fontSize:12,color:C.muted}}>Item sold</label><select value={saleForm.sku} onChange={e=>setSaleForm(f=>({...f,sku:e.target.value}))} style={inp}><option value="">Select SKU</option>{inventory.map(i=>{const m=marginBadge(i.unitCost,i.sellingPrice);return<option key={i.sku} value={i.sku}>{i.sku} - {i.name} ({i.qty} in stock{i.sellingPrice?` · $${i.sellingPrice} · ${m.label} margin`:""})</option>;})}{saleForm.sku&&!inventory.find(i=>i.sku===saleForm.sku)&&<option value={saleForm.sku}>{saleForm.sku} (scanned)</option>}</select></div>
          <div><label style={{fontSize:12,color:C.muted}}>Qty sold</label><input type="number" placeholder="0" value={saleForm.qty} onChange={e=>setSaleForm(f=>({...f,qty:e.target.value}))} style={inp}/></div>
          <div><label style={{fontSize:12,color:C.muted}}>Invoice / ref #</label><input placeholder="INV-0001" value={saleForm.invoice} onChange={e=>setSaleForm(f=>({...f,invoice:e.target.value}))} style={inp}/></div>
        </div>
        {saleForm.sku&&(()=>{const item=inventory.find(i=>i.sku===saleForm.sku);const m=item?marginBadge(item.unitCost,item.sellingPrice):null;const qty=parseInt(saleForm.qty)||0;if(!item||!m||!item.sellingPrice)return null;return(<div style={{background:"#EAF3DE",border:"1px solid #6BAD2E",borderRadius:8,padding:"10px 14px",marginBottom:10,fontSize:12}}><strong style={{color:"#3B6D11"}}>Sale summary</strong><div style={{marginTop:4,color:"#3B6D11"}}>Selling at <strong>${item.sellingPrice.toFixed(2)}</strong> · Cost <strong>${item.unitCost.toFixed(2)}</strong> · Profit per unit <strong>${m.profit.toFixed(2)}</strong> ({m.label} margin){qty>0&&<span> · Total profit: <strong>${(m.profit*qty).toFixed(2)}</strong></span>}</div></div>);})()} 
        <button onClick={handleSale} style={btn("#A32D2D")}>Record sale</button>
        <div style={{marginTop:24,fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Sales log</div>
        {audit.filter(a=>a.action==="Sold").map(a=>(<div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span style={{fontWeight:500}}>{a.item}</span><span style={{color:C.muted,display:"flex",gap:10,alignItems:"center"}}><span>{a.qty} units</span>{a.revenue>0&&<span style={{color:"#185FA5",fontWeight:600}}>${a.revenue.toFixed(2)}</span>}{a.profit>0&&<span style={{color:"#3B6D11",fontWeight:600}}>+${a.profit.toFixed(2)} profit</span>}<span>{a.note} · {a.time}</span></span></div>))}
      </div>)}

      {tab==="Reorder Center"&&(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontWeight:500}}>Low inventory analyzer</div><button onClick={runAiAnalysis} disabled={aiLoading} style={{...btn("#534AB7"),opacity:aiLoading?0.7:1}}>{aiLoading?"Analyzing...":"AI analyze and recommend"}</button></div>{aiAnalysis&&(<div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px",marginBottom:20,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}><div style={{fontWeight:600,color:"#534AB7",marginBottom:8,fontSize:12}}>AI reorder analysis</div>{aiAnalysis}</div>)}<div style={{fontSize:13,fontWeight:500,color:C.muted,marginBottom:8}}>Items needing reorder ({lowItems.length})</div>{lowItems.length===0&&<div style={{color:C.muted,fontSize:13}}>All items are sufficiently stocked.</div>}{lowItems.map(i=>{const s=statusBadge(i.qty,i.minQty);const m=marginBadge(i.unitCost,i.sellingPrice);const sugQty=Math.max(i.minQty*2-i.qty,10);const ordered=reorders.find(r=>r.sku===i.sku);const days=daysUntilStockout(i);return(<div key={i.id} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontWeight:500}}>{i.name} <span style={{color:C.muted,fontWeight:400,fontSize:12}}>({i.sku})</span>{days!==null&&<span style={{marginLeft:8,fontSize:11,fontWeight:600,background:days<=3?"#FCEBEB":days<=7?"#FAEEDA":"#E6F1FB",color:days<=3?"#A32D2D":days<=7?"#854F0B":"#185FA5",padding:"2px 7px",borderRadius:8}}>{days<=0?"Stockout imminent":`~${days}d left`}</span>}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Supplier: {i.supplier} · Location: {i.location}</div><div style={{display:"flex",gap:12,marginTop:6,fontSize:12}}><span>In stock: <strong>{i.qty}</strong></span><span>Min: <strong>{i.minQty}</strong></span><span>Suggest: <strong>{sugQty} units</strong></span>{i.sellingPrice&&<span style={{color:m.color}}>Margin: <strong>{m.label}</strong></span>}</div></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}><span style={{background:s.bg,color:s.color,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span>{ordered?<span style={{fontSize:12,color:"#3B6D11",background:"#EAF3DE",padding:"3px 10px",borderRadius:10}}>Order sent</span>:<button onClick={()=>handleReorder(i)} style={btn("#185FA5")}>Send reorder</button>}</div></div></div>);})}{reorders.length>0&&(<><div style={{fontSize:13,fontWeight:500,color:C.muted,marginTop:24,marginBottom:8}}>Reorder history</div>{reorders.map(r=>{const urg={Critical:"#A32D2D",High:"#854F0B",Normal:"#3B6D11"};const urgBg={Critical:"#FCEBEB",High:"#FAEEDA",Normal:"#EAF3DE"};return(<div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span><strong>{r.name}</strong> — {r.qty} units from {r.supplier}</span><span style={{display:"flex",gap:8,alignItems:"center",color:C.muted}}><span>{r.date}</span><span style={{background:urgBg[r.urgency],color:urg[r.urgency],padding:"1px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{r.urgency}</span></span></div>);})}</>)}</div>)}

      {tab==="Purchase Orders"&&(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><div style={{fontWeight:600,fontSize:15}}>Purchase Orders</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Create, edit and track orders sent to suppliers</div></div><button onClick={()=>{const poNumber=`PO-${String(poCounter).padStart(4,"0")}`;setPOCounter(c=>c+1);const newPO={id:Date.now(),poNumber,status:"Draft",sku:"",itemName:"",description:"",supplier:"",qty:1,unitCost:0,date:new Date().toISOString().slice(0,10),deliveryDate:"",notes:"",createdFrom:"Manual",user_id:userId};setPOs(p=>[newPO,...p]);setEditPOId(newPO.id);setEditPOForm({...newPO});}} style={btn("#185FA5")}>+ New Purchase Order</button></div>{pos.length===0&&(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>📋</div><div style={{fontWeight:600,marginBottom:4,color:C.text}}>No purchase orders yet</div><div>Click "Send Reorder" in the Reorder Center or create a new PO manually.</div></div>)}{pos.map(po=>{const isEditing=editPOId===po.id;const total=(po.qty*(po.unitCost||0)).toFixed(2);const statusColor={Draft:"#854F0B",Sent:"#185FA5",Received:"#3B6D11"}[po.status]||"#888";const statusBg={Draft:"#FAEEDA",Sent:"#E6F1FB",Received:"#EAF3DE"}[po.status]||"#eee";if(isEditing)return(<div key={po.id} style={{border:`2px solid #185FA5`,borderRadius:10,padding:16,marginBottom:12,background:"#F0F4FF"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontWeight:700,fontSize:14,color:"#185FA5"}}>{editPOForm.poNumber} — Editing</div><div style={{display:"flex",gap:6}}><button onClick={async()=>{await supabase.from("purchase_orders").update({po_number:editPOForm.poNumber,status:editPOForm.status,sku:editPOForm.sku||"",item_name:editPOForm.itemName||"",description:editPOForm.description||"",supplier:editPOForm.supplier||"",qty:editPOForm.qty||1,unit_cost:editPOForm.unitCost||0,date:editPOForm.date||"",delivery_date:editPOForm.deliveryDate||"",notes:editPOForm.notes||""}).eq("id",editPOForm.id);setPOs(p=>p.map(x=>x.id===editPOForm.id?{...editPOForm}:x));setEditPOId(null);setEditPOForm({});}} style={{...btn("#3B6D11"),padding:"5px 14px"}}>Save PO</button><button onClick={()=>{setEditPOId(null);setEditPOForm({});}} style={{...btn("#888"),padding:"5px 14px"}}>Cancel</button></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted}}>Select product (auto-fills fields)</label><select onChange={e=>{const item=inventory.find(i=>i.sku===e.target.value);if(item)setEditPOForm(x=>({...x,sku:item.sku,itemName:item.name,description:`Reorder for ${item.name} — SKU ${item.sku}`,supplier:item.supplier,unitCost:item.unitCost,qty:Math.max(item.minQty*2-item.qty,10)}));}} style={inp}><option value="">— Pick a product to auto-fill —</option>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} — {i.name} (stock: {i.qty}, min: {i.minQty})</option>)}</select></div>{[["itemName","Item name *"],["description","Description"],["supplier","Supplier"],["deliveryDate","Expected delivery","date"]].map(([f,l,t])=>(<div key={f}><label style={{fontSize:12,color:C.muted}}>{l}</label><input type={t||"text"} value={editPOForm[f]||""} onChange={e=>setEditPOForm(x=>({...x,[f]:e.target.value}))} style={inp}/></div>))}<div><label style={{fontSize:12,color:C.muted}}>Order quantity *</label><input type="number" value={editPOForm.qty||""} onChange={e=>setEditPOForm(x=>({...x,qty:parseInt(e.target.value)||0}))} style={inp}/></div><div><label style={{fontSize:12,color:C.muted}}>Unit cost ($)</label><input type="number" value={editPOForm.unitCost||""} onChange={e=>setEditPOForm(x=>({...x,unitCost:parseFloat(e.target.value)||0}))} style={inp}/></div><div><label style={{fontSize:12,color:C.muted}}>Status</label><select value={editPOForm.status} onChange={e=>setEditPOForm(x=>({...x,status:e.target.value}))} style={inp}><option>Draft</option><option>Sent</option><option>Received</option></select></div><div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted}}>Notes</label><textarea value={editPOForm.notes||""} onChange={e=>setEditPOForm(x=>({...x,notes:e.target.value}))} style={{...inp,height:60,resize:"vertical"}}/></div></div><div style={{marginTop:10,padding:"8px 12px",background:"#E6F1FB",borderRadius:8,fontSize:13,color:"#185FA5",fontWeight:600}}>Total: ${((editPOForm.qty||0)*(editPOForm.unitCost||0)).toFixed(2)}</div></div>);return(<div key={po.id} style={{border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}><div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontWeight:700,fontSize:14}}>{po.poNumber}</span><span style={{background:statusBg,color:statusColor,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:700}}>{po.status}</span></div><div style={{fontWeight:500,fontSize:13}}>{po.itemName||"—"}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{po.description}</div><div style={{display:"flex",gap:16,marginTop:8,fontSize:12,flexWrap:"wrap"}}><span>Supplier: <strong>{po.supplier||"—"}</strong></span><span>Qty: <strong>{po.qty}</strong></span><span>Unit cost: <strong>${(po.unitCost||0).toFixed(2)}</strong></span><span style={{color:"#3B6D11",fontWeight:600}}>Total: <strong>${total}</strong></span>{po.deliveryDate&&<span>Expected: <strong>{po.deliveryDate}</strong></span>}</div>{po.notes&&<div style={{fontSize:12,color:C.muted,marginTop:6,fontStyle:"italic"}}>Note: {po.notes}</div>}</div><div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><div style={{fontSize:11,color:C.muted}}>{po.date}</div><div style={{display:"flex",gap:6}}><button onClick={()=>openChat("po",po.id,po.poNumber)} style={{...btn("#0D7E6E"),padding:"4px 12px",fontSize:11}}>💬 Chat</button><button onClick={()=>{setEditPOId(po.id);setEditPOForm({...po});}} style={{...btn("#185FA5"),padding:"4px 12px",fontSize:11}}>Edit</button><button onClick={()=>{const content=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${po.poNumber}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#1B2B4B;max-width:700px}h1{font-size:28px;margin:0}h2{font-size:16px;font-weight:400;color:#555;margin:4px 0 24px}.logo{display:flex;align-items:center;gap:12px;margin-bottom:32px}.badge{background:#1B2B4B;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:700}.divider{border:none;border-top:2px solid #1B2B4B;margin:24px 0}.row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px}.label{color:#666;width:160px;flex-shrink:0}.value{font-weight:600;color:#1B2B4B}table{width:100%;border-collapse:collapse;margin-top:24px}th{background:#1B2B4B;color:#fff;padding:10px 12px;text-align:left;font-size:13px}td{padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:14px}.total-row td{font-weight:700;background:#f0f4ff;font-size:15px}.status{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700;background:${po.status==="Received"?"#EAF3DE":po.status==="Sent"?"#E6F1FB":"#FAEEDA"};color:${po.status==="Received"?"#3B6D11":po.status==="Sent"?"#185FA5":"#854F0B"}}.footer{margin-top:48px;font-size:11px;color:#aaa;text-align:center;font-style:italic}</style></head><body><div class="logo"><div style="background:#1B2B4B;padding:10px 16px;border-radius:8px;color:#fff;font-size:22px;font-weight:700">SG</div><div><h1>StockGuard</h1><h2>Purchase Order</h2></div></div><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="font-size:24px;font-weight:700;color:#1B2B4B">${po.poNumber}</div><div style="margin-top:6px"><span class="status">${po.status}</span></div></div><div style="text-align:right;font-size:13px;color:#666"><div>Date: <strong>${po.date}</strong></div>${po.deliveryDate?`<div style="margin-top:4px">Expected delivery: <strong>${po.deliveryDate}</strong></div>`:""}</div></div><hr class="divider"><div class="row"><span class="label">Supplier</span><span class="value">${po.supplier||"—"}</span></div><div class="row"><span class="label">Created from</span><span class="value">${po.createdFrom||"Manual"}</span></div>${po.description?`<div class="row"><span class="label">Description</span><span class="value">${po.description}</span></div>`:""}<table><thead><tr><th>Item</th><th>SKU</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit Cost</th><th style="text-align:right">Total</th></tr></thead><tbody><tr><td>${po.itemName||"—"}</td><td style="font-family:monospace">${po.sku||"—"}</td><td style="text-align:right">${po.qty}</td><td style="text-align:right">$${(po.unitCost||0).toFixed(2)}</td><td style="text-align:right">$${total}</td></tr></tbody><tfoot><tr class="total-row"><td colspan="4" style="text-align:right">Order Total</td><td style="text-align:right">$${total}</td></tr></tfoot></table>${po.notes?`<div style="margin-top:24px;padding:14px;background:#f8f9fa;border-radius:8px;font-size:13px"><strong>Notes:</strong> ${po.notes}</div>`:""}<div class="footer">"Commit to the Lord whatever you do" — Proverbs 16:3 · Generated by StockGuard · getstockguard.com</div></body></html>`;const blob=new Blob([content],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${po.poNumber}.html`;a.click();URL.revokeObjectURL(url);}} style={{...btn("#534AB7"),padding:"4px 12px",fontSize:11}}>⬇ Download</button><button onClick={async()=>{await supabase.from("purchase_orders").delete().eq("id",po.id);setPOs(p=>p.filter(x=>x.id!==po.id));}} style={{...btn("#A32D2D"),padding:"4px 12px",fontSize:11}}>Delete</button></div></div></div></div>);})}
      </div>)}

      {tab==="Suppliers"&&(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><div style={{fontWeight:600,fontSize:15}}>Supplier Management</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Contacts, scorecards, and risk analysis</div></div><button onClick={()=>setShowAddSup(s=>!s)} style={btn("#185FA5")}>+ Add Supplier</button></div>{(()=>{const catMap={};inventory.forEach(i=>{if(!catMap[i.category])catMap[i.category]={};catMap[i.category][i.supplier]=(catMap[i.category][i.supplier]||0)+1;});const warnings=[];Object.entries(catMap).forEach(([cat,supMap])=>{const total=Object.values(supMap).reduce((a,b)=>a+b,0);Object.entries(supMap).forEach(([sup,count])=>{const pct=Math.round((count/total)*100);if(pct>=60&&total>=2)warnings.push({cat,sup,pct,count,total});});});if(!warnings.length)return null;return(<div style={{background:"#FCEBEB",border:"1px solid #E05A5A",borderRadius:10,padding:"12px 16px",marginBottom:16}}><div style={{fontWeight:600,color:"#A32D2D",fontSize:13,marginBottom:8}}>⚠ Single Point of Failure Detected</div>{warnings.map((w,i)=>(<div key={i} style={{fontSize:12,color:"#791F1F",marginBottom:3}}><strong>{w.pct}%</strong> of <strong>{w.cat}</strong> products depend on <strong>{w.sup}</strong> ({w.count} of {w.total} SKUs) — consider diversifying.</div>))}</div>);})()}{showAddSup&&(<div style={{border:`2px solid #185FA5`,borderRadius:10,padding:16,marginBottom:16,background:"#F0F4FF"}}><div style={{fontWeight:600,fontSize:13,color:"#185FA5",marginBottom:12}}>New Supplier</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>{[["name","Supplier name *"],["contact","Contact person"],["phone","Phone"],["email","Email"],["website","Website"],["leadTime","Lead time (days)"],["minOrder","Min order qty"],["paymentTerms","Payment terms"]].map(([f,l])=>(f==="paymentTerms"?<div key={f}><label style={{fontSize:12,color:C.muted}}>{l}</label><select value={newSupForm[f]} onChange={e=>setNewSupForm(x=>({...x,[f]:e.target.value}))} style={inp}>{["Net 30","Net 60","Net 90","COD","Prepaid"].map(t=><option key={t}>{t}</option>)}</select></div>:<div key={f}><label style={{fontSize:12,color:C.muted}}>{l}</label><input type={["phone"].includes(f)?"tel":["leadTime","minOrder"].includes(f)?"number":"text"} value={newSupForm[f]} onChange={e=>setNewSupForm(x=>({...x,[f]:e.target.value}))} style={inp}/></div>))}<div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted}}>Notes</label><textarea value={newSupForm.notes} onChange={e=>setNewSupForm(x=>({...x,notes:e.target.value}))} style={{...inp,height:60,resize:"vertical"}} placeholder="e.g. Call before ordering..."/></div></div><div style={{display:"flex",gap:8}}><button onClick={async()=>{if(!newSupForm.name.trim())return;const row={name:newSupForm.name,contact:newSupForm.contact||"",phone:newSupForm.phone||"",email:newSupForm.email||"",website:newSupForm.website||"",lead_time:newSupForm.leadTime||"",min_order:newSupForm.minOrder||"",payment_terms:newSupForm.paymentTerms||"Net 30",notes:newSupForm.notes||"",user_id:userId};const{data}=await supabase.from("suppliers").insert(row).select().single();if(data)setSuppliers(s=>[...s,{...data,leadTime:data.lead_time||"",minOrder:data.min_order||"",paymentTerms:data.payment_terms||"Net 30"}]);setNewSupForm(emptySup);setShowAddSup(false);}} style={btn("#3B6D11")}>Save supplier</button><button onClick={()=>{setShowAddSup(false);setNewSupForm(emptySup);}} style={btn("#888")}>Cancel</button></div></div>)}{suppliers.map(sup=>{const linkedProducts=inventory.filter(i=>i.supplier===sup.name);const isEditing=editSupId===sup.id;const totalLinked=linkedProducts.length,lowLinked=linkedProducts.filter(p=>p.qty<p.minQty).length,outLinked=linkedProducts.filter(p=>p.qty===0).length;const stockHealth=totalLinked===0?100:Math.max(0,Math.round(100-(outLinked*30)-(lowLinked*15)));const stockHealthColor=stockHealth>=75?"#3B6D11":stockHealth>=50?"#854F0B":"#A32D2D";const stockHealthBg=stockHealth>=75?"#EAF3DE":stockHealth>=50?"#FAEEDA":"#FCEBEB";const lt=parseInt(sup.leadTime)||0;const leadScore=sup.leadTime?Math.max(0,100-Math.min(lt,30)*2):null;const leadColor=leadScore===null?"#888":leadScore>=70?"#3B6D11":leadScore>=40?"#854F0B":"#A32D2D";const sameCatTotal=inventory.filter(i=>linkedProducts.some(p=>p.category===i.category)).length;const depPct=sameCatTotal>0?Math.round((totalLinked/sameCatTotal)*100):0;const depColor=depPct>=60?"#A32D2D":depPct>=40?"#854F0B":"#3B6D11";if(isEditing)return(<div key={sup.id} style={{border:`2px solid #185FA5`,borderRadius:10,padding:16,marginBottom:12,background:"#F0F4FF"}}><div style={{fontWeight:600,fontSize:13,color:"#185FA5",marginBottom:12}}>Editing: {sup.name}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>{[["name","Supplier name *"],["contact","Contact person"],["phone","Phone"],["email","Email"],["website","Website"],["leadTime","Lead time (days)"],["minOrder","Min order qty"],["paymentTerms","Payment terms"]].map(([f,l])=>(f==="paymentTerms"?<div key={f}><label style={{fontSize:12,color:C.muted}}>{l}</label><select value={editSupForm[f]} onChange={e=>setEditSupForm(x=>({...x,[f]:e.target.value}))} style={inp}>{["Net 30","Net 60","Net 90","COD","Prepaid"].map(t=><option key={t}>{t}</option>)}</select></div>:<div key={f}><label style={{fontSize:12,color:C.muted}}>{l}</label><input type={["phone"].includes(f)?"tel":["leadTime","minOrder"].includes(f)?"number":"text"} value={editSupForm[f]||""} onChange={e=>setEditSupForm(x=>({...x,[f]:e.target.value}))} style={inp}/></div>))}<div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted}}>Notes</label><textarea value={editSupForm.notes||""} onChange={e=>setEditSupForm(x=>({...x,notes:e.target.value}))} style={{...inp,height:60,resize:"vertical"}}/></div></div><div style={{display:"flex",gap:8}}><button onClick={async()=>{await supabase.from("suppliers").update({name:editSupForm.name,contact:editSupForm.contact||"",phone:editSupForm.phone||"",email:editSupForm.email||"",website:editSupForm.website||"",lead_time:editSupForm.leadTime||"",min_order:editSupForm.minOrder||"",payment_terms:editSupForm.paymentTerms||"Net 30",notes:editSupForm.notes||""}).eq("id",sup.id);setSuppliers(s=>s.map(x=>x.id===sup.id?{...editSupForm,id:sup.id}:x));setEditSupId(null);setEditSupForm({});}} style={btn("#3B6D11")}>Save</button><button onClick={()=>{setEditSupId(null);setEditSupForm({});}} style={btn("#888")}>Cancel</button></div></div>);return(<div key={sup.id} style={{border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{sup.name}</div>{sup.contact&&<div style={{fontSize:13,color:C.muted,marginBottom:6}}>👤 {sup.contact}</div>}<div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:13,marginBottom:8}}>{sup.phone&&<a href={`tel:${sup.phone}`} style={{color:"#185FA5",textDecoration:"none"}}>📞 {sup.phone}</a>}{sup.email&&<a href={`mailto:${sup.email}`} style={{color:"#185FA5",textDecoration:"none"}}>✉️ {sup.email}</a>}{sup.website&&<a href={sup.website.startsWith("http")?sup.website:`https://${sup.website}`} target="_blank" rel="noreferrer" style={{color:"#185FA5",textDecoration:"none"}}>🌐 {sup.website}</a>}</div><div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,marginBottom:10}}>{sup.leadTime&&<span style={{background:"#E6F1FB",color:"#185FA5",padding:"2px 8px",borderRadius:8}}>⏱ {sup.leadTime} day lead time</span>}{sup.minOrder&&<span style={{background:"#EAF3DE",color:"#3B6D11",padding:"2px 8px",borderRadius:8}}>📦 Min order: {sup.minOrder} units</span>}{sup.paymentTerms&&<span style={{background:"#FAEEDA",color:"#854F0B",padding:"2px 8px",borderRadius:8}}>💳 {sup.paymentTerms}</span>}</div>{totalLinked>0&&(<div style={{background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:8,letterSpacing:"0.5px"}}>SUPPLIER SCORECARD</div>{[{label:"Stock health",value:stockHealth,color:stockHealthColor},{label:"Lead time score",value:leadScore,color:leadColor},{label:"Category dependency",value:depPct,color:depColor}].map(bar=>(<div key={bar.label} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted}}>{bar.label}</span><span style={{fontWeight:600,color:bar.color}}>{bar.value===null?"N/A":`${bar.value}%`}</span></div><div style={{background:C.border,borderRadius:4,height:5}}><div style={{width:`${bar.value===null?0:bar.value}%`,background:bar.color,height:5,borderRadius:4}}/></div></div>))}<div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}><span style={{background:stockHealthBg,color:stockHealthColor,fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8}}>{outLinked>0?`${outLinked} out of stock`:lowLinked>0?`${lowLinked} low stock`:"All stocked ✓"}</span>{depPct>=60&&<span style={{background:"#FCEBEB",color:"#A32D2D",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8}}>⚠ High dependency risk</span>}{leadScore!==null&&leadScore<40&&<span style={{background:"#FAEEDA",color:"#854F0B",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:8}}>⏱ Slow lead time</span>}</div></div>)}{sup.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic",marginBottom:8}}>📝 {sup.notes}</div>}{linkedProducts.length>0&&(<div style={{marginTop:8}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>LINKED PRODUCTS ({linkedProducts.length})</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{linkedProducts.map(p=>{const s=statusBadge(p.qty,p.minQty);return<span key={p.sku} style={{background:s.bg,color:s.color,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600}}>{p.name} ({p.qty} in stock)</span>;})}</div></div>)}</div><div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><button onClick={()=>{setEditSupId(sup.id);setEditSupForm({...sup});}} style={{...btn("#185FA5"),padding:"4px 12px",fontSize:11}}>Edit</button><button onClick={async()=>{await supabase.from("suppliers").delete().eq("id",sup.id);setSuppliers(s=>s.filter(x=>x.id!==sup.id));}} style={{...btn("#A32D2D"),padding:"4px 12px",fontSize:11}}>Delete</button>{sup.email&&<button onClick={()=>window.open(`mailto:${sup.email}?subject=Purchase Order&body=Hi ${sup.contact||sup.name},%0A%0AWe would like to place an order.`)} style={{...btn("#3B6D11"),padding:"4px 12px",fontSize:11}}>✉️ Email</button>}</div></div></div>);})}</div>)}

      {tab==="Audit Trail"&&(<div><div style={{fontWeight:500,marginBottom:12}}>Full inventory activity log</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["Time","Action","Item","Qty","Revenue","Profit","User","Reference"].map(h=>(<th key={h} style={{textAlign:"left",padding:"6px 8px",fontWeight:500,color:C.muted,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{audit.map(a=>{const aColor={Received:"#185FA5",Sold:"#A32D2D",Moved:"#0F6E56",Reordered:"#854F0B",Import:"#534AB7",Edited:"#185FA5",Deleted:"#A32D2D"}[a.action]||"#888";const aBg={Received:"#E6F1FB",Sold:"#FCEBEB",Moved:"#E1F5EE",Reordered:"#FAEEDA",Import:"#EDE9FB",Edited:"#E6F1FB",Deleted:"#FCEBEB"}[a.action]||"#eee";return(<tr key={a.id} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"7px 8px",color:C.muted,whiteSpace:"nowrap"}}>{a.time}</td><td style={{padding:"7px 8px"}}><span style={{background:aBg,color:aColor,padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600}}>{a.action}</span></td><td style={{padding:"7px 8px",fontWeight:500}}>{a.item}</td><td style={{padding:"7px 8px"}}>{a.qty}</td><td style={{padding:"7px 8px",color:"#185FA5",fontWeight:600}}>{a.revenue>0?`$${a.revenue.toFixed(2)}`:"—"}</td><td style={{padding:"7px 8px",color:"#3B6D11",fontWeight:600}}>{a.profit>0?`$${a.profit.toFixed(2)}`:"—"}</td><td style={{padding:"7px 8px",color:C.muted}}>{a.user}</td><td style={{padding:"7px 8px",color:C.muted}}>{a.note}</td></tr>);})}</tbody></table></div></div>)}

      {tab==="Intelligence"&&(<div><div style={{display:"flex",gap:4,marginBottom:20}}>{["Forecast","What-If Simulator","Overstock"].map(t=>(<button key={t} onClick={()=>setIntelTab(t)} style={{padding:"7px 16px",borderRadius:20,border:`1px solid ${intelTab===t?"#0D7E6E":C.border}`,background:intelTab===t?"#0D7E6E":"transparent",color:intelTab===t?"#fff":C.muted,fontSize:12,cursor:"pointer",fontWeight:intelTab===t?600:400}}>{t==="Forecast"&&"📈 "}{t==="What-If Simulator"&&"🔀 "}{t==="Overstock"&&"📦 "}{t}</button>))}</div>{intelTab==="Forecast"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:16}}>Demand forecast based on your last 7 days of sales velocity.</div>{inventory.map(item=>{const fc=getForecast(item);if(fc.totalSold===0)return null;const s=statusBadge(item.qty,item.minQty);const urgent=fc.stockoutDay!==null&&fc.stockoutDay<=14;return(<div key={item.sku} style={{border:`1px solid ${urgent?"#E05A5A":C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:10,background:urgent?"#FFF8F8":"#fff"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{item.name} <span style={{color:C.muted,fontWeight:400,fontSize:12}}>({item.sku})</span></div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{item.category} · {item.supplier}</div><div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap",fontSize:12}}><span>Daily rate: <strong style={{color:"#0D7E6E"}}>{fc.dailyRate.toFixed(1)} units/day</strong></span><span>14-day demand: <strong>{fc.days14} units</strong></span><span>30-day demand: <strong>{fc.days30} units</strong></span><span>Reorder point: <strong>{fc.reorderPoint} units</strong></span></div><div style={{marginTop:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:3}}><span>Current stock: {item.qty}</span><span>14-day need: {fc.days14}</span><span>30-day need: {fc.days30}</span></div><div style={{background:C.border,borderRadius:4,height:8,position:"relative"}}><div style={{position:"absolute",left:0,top:0,height:8,borderRadius:4,background:"#0D7E6E",width:`${Math.min(100,(item.qty/Math.max(fc.days30,1))*100)}%`}}/><div style={{position:"absolute",left:`${Math.min(100,(fc.days14/Math.max(fc.days30,1))*100)}%`,top:-2,height:12,width:2,background:"#854F0B"}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:2}}><span style={{color:"#0D7E6E"}}>■ Current stock</span><span style={{color:"#854F0B"}}>| 14-day mark</span></div></div></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}><span style={{background:s.bg,color:s.color,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600}}>{s.label}</span>{fc.stockoutDay!==null&&<span style={{background:fc.stockoutDay<=3?"#FCEBEB":fc.stockoutDay<=14?"#FAEEDA":"#E6F1FB",color:fc.stockoutDay<=3?"#A32D2D":fc.stockoutDay<=14?"#854F0B":"#185FA5",fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:8}}>Stockout in ~{fc.stockoutDay}d</span>}{urgent&&<button onClick={()=>{setIntelTab("What-If Simulator");setSimSku(item.sku);}} style={{...btn("#0D7E6E"),padding:"4px 12px",fontSize:11}}>Simulate reorder</button>}</div></div></div>);})}{inventory.every(i=>getForecast(i).totalSold===0)&&(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>📊</div><div style={{fontWeight:600,marginBottom:4,color:C.text}}>No sales data yet</div></div>)}</div>)}{intelTab==="What-If Simulator"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:16}}>Model the financial impact of a reorder before you commit.</div><div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:16}}><div style={{fontWeight:600,fontSize:14,marginBottom:12}}>Configure simulation</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}><div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Select product</label><select value={simSku} onChange={e=>{setSimSku(e.target.value);setSimResult(null);}} style={inp}><option value="">— Choose a product —</option>{inventory.map(i=><option key={i.sku} value={i.sku}>{i.sku} — {i.name} (stock: {i.qty})</option>)}</select></div><div><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Reorder quantity</label><input type="number" value={simQty} min="1" onChange={e=>{setSimQty(e.target.value);setSimResult(null);}} style={inp}/></div></div><button onClick={runSimulator} disabled={!simSku||!simQty} style={{...btn("#0D7E6E"),opacity:(!simSku||!simQty)?0.5:1}}>Run simulation</button></div>{simResult&&(<div><div style={{fontWeight:600,fontSize:14,marginBottom:12,color:"#0D7E6E"}}>Simulation: {simResult.item.name} — reorder {simResult.qty} units</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:16}}>{[{label:"Order cost",val:`$${simResult.orderCost}`,color:"#A32D2D",sub:"cash out"},{label:"Projected revenue",val:`$${simResult.projRevenue}`,color:"#185FA5",sub:"if all sold"},{label:"Projected profit",val:`$${simResult.projProfit}`,color:"#3B6D11",sub:"gross profit"},{label:"Stock after",val:`${simResult.totalQtyAfter} units`,color:"#534AB7",sub:"total on hand"}].map(c=>(<div key={c.label} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>{c.label}</div><div style={{fontSize:22,fontWeight:700,color:c.color}}>{c.val}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{c.sub}</div></div>))}</div><div style={{background:"#E8F7F3",border:"1px solid #0D7E6E",borderRadius:10,padding:"14px 16px"}}><div style={{fontWeight:600,color:"#0D7E6E",marginBottom:8,fontSize:13}}>📋 Decision summary</div><div style={{fontSize:13,color:"#0A5A4D",lineHeight:1.7}}>{simResult.coversDays!==null&&<div>✓ This order covers approximately <strong>{simResult.coversDays} days</strong> of demand at {simResult.dailyRate.toFixed(1)} units/day.</div>}{simResult.stockoutAfter!==null&&<div>✓ Combined stock of <strong>{simResult.totalQtyAfter} units</strong> lasts ~<strong>{simResult.stockoutAfter} days</strong> before next stockout.</div>}<div>✓ ROI: spend <strong>${simResult.orderCost}</strong>, earn <strong>${simResult.projRevenue}</strong> — a <strong>${simResult.projProfit}</strong> gross profit ({(((parseFloat(simResult.projRevenue)-parseFloat(simResult.orderCost))/parseFloat(simResult.orderCost))*100).toFixed(0)}% return on spend).</div></div></div><div style={{marginTop:12,display:"flex",gap:8}}><button onClick={()=>{handleReorder(simResult.item);setTab("Purchase Orders");}} style={btn("#0D7E6E")}>Create purchase order</button><button onClick={()=>setSimResult(null)} style={btn("#888")}>Clear</button></div></div>)}</div>)}{intelTab==="Overstock"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:16}}>Items with excess inventory relative to sales velocity.</div>{(()=>{const overstock=getOverstockItems();if(!overstock.length)return(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>✅</div><div style={{fontWeight:600,marginBottom:4,color:C.text}}>No overstock detected</div></div>);const totalExcessValue=overstock.reduce((s,i)=>s+parseFloat(i.excessValue),0);return(<><div style={{background:"#FFF8E8",border:"1px solid #F0A500",borderRadius:10,padding:"12px 16px",marginBottom:16}}><div style={{fontWeight:600,color:"#854F0B",fontSize:13}}>{overstock.length} overstock item{overstock.length!==1?"s":""} detected</div><div style={{fontSize:12,color:"#A06010",marginTop:2}}>~${totalExcessValue.toFixed(0)} in excess inventory cost tied up</div></div>{overstock.map(i=>{const m=marginBadge(i.unitCost,i.sellingPrice);const discountMargin=marginBadge(i.unitCost,parseFloat(i.discountPrice));return(<div key={i.sku} style={{border:`1px solid #F0A500`,borderRadius:10,padding:"14px 16px",marginBottom:12,background:"#FFFCF0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{i.name} <span style={{color:C.muted,fontWeight:400,fontSize:12}}>({i.sku})</span></div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{i.category} · {i.supplier}</div><div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap",fontSize:12}}><span>In stock: <strong>{i.qty}</strong></span><span>Daily rate: <strong>{i.dailyRate.toFixed(1)}/day</strong></span><span>Days stock: <strong style={{color:"#854F0B"}}>{i.daysStock===999?"∞":i.daysStock+"d"}</strong></span><span>Excess: <strong>{i.excessUnits} units</strong></span><span>Value: <strong style={{color:"#A32D2D"}}>${i.excessValue}</strong></span></div><div style={{marginTop:10,background:"#FFF0D0",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:12,fontWeight:600,color:"#854F0B",marginBottom:6}}>💡 Liquidation options</div><div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:"#633806"}}><div><strong>Option A — 15% discount</strong><br/>Sell at <strong>${i.discountPrice}</strong> · still {discountMargin.label} margin</div><div><strong>Option B — Bundle deal</strong><br/>Pair with a low-margin SKU to move volume</div></div></div></div><div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><span style={{background:"#FAEEDA",color:"#854F0B",padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600}}>Overstock</span><span style={{background:m.bg,color:m.color,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:600}}>{m.label} margin</span><button onClick={()=>{setIntelTab("What-If Simulator");setSimSku(i.sku);}} style={{...btn("#854F0B"),padding:"4px 12px",fontSize:11}}>Simulate</button></div></div></div>);})}</>);})()}</div>)}</div>)}

      {tab==="Business Insights"&&(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}><div><div style={{fontWeight:600,fontSize:15}}>Business Insights</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>AI-powered SWOT, Porter's Five Forces and money strategies</div></div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="Your industry" style={{...inp,width:200}}/><button onClick={runBusinessInsights} disabled={insightLoading} style={{...btn("#534AB7"),opacity:insightLoading?0.7:1}}>{insightLoading?"Analyzing...":"Run AI Analysis"}</button></div></div>{!swotData&&!insightLoading&&(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>✦</div><div style={{fontWeight:600,marginBottom:4,color:C.text}}>Ready to analyze your business</div><div>Click "Run AI Analysis" to generate your SWOT, Porter's Five Forces, and money-making strategies.</div></div>)}{insightLoading&&(<div style={{background:C.bg2,borderRadius:10,padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13}}><div style={{fontSize:24,marginBottom:8}}>⏳</div><div>Analyzing...</div></div>)}{swotData&&!swotData.error&&(<><div style={{display:"flex",gap:4,marginBottom:18}}>{["SWOT","Porter's Five Forces","Money Strategies"].map(t=>(<button key={t} onClick={()=>setInsightTab(t)} style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${C.border}`,background:insightTab===t?"#534AB7":"transparent",color:insightTab===t?"#fff":C.muted,fontSize:12,cursor:"pointer",fontWeight:insightTab===t?600:400}}>{t}</button>))}</div>{insightTab==="SWOT"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{[{key:"strengths",label:"Strengths",icon:"💪",bg:"#EAF3DE",border:"#6BAD2E",head:"#3B6D11"},{key:"weaknesses",label:"Weaknesses",icon:"⚠",bg:"#FCEBEB",border:"#E05A5A",head:"#A32D2D"},{key:"opportunities",label:"Opportunities",icon:"🚀",bg:"#E6F1FB",border:"#4A90D9",head:"#185FA5"},{key:"threats",label:"Threats",icon:"🛡",bg:"#FAEEDA",border:"#EF9F27",head:"#854F0B"}].map(q=>(<div key={q.key} style={{background:q.bg,border:`1px solid ${q.border}`,borderRadius:10,padding:14}}><div style={{fontWeight:700,color:q.head,fontSize:13,marginBottom:10}}>{q.icon} {q.label}</div>{(swotData[q.key]||[]).map((item,i)=>(<div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<swotData[q.key].length-1?`1px solid ${q.border}55`:"none"}}><div style={{fontWeight:600,fontSize:12,color:q.head}}>{item.point}</div><div style={{fontSize:11,color:q.head,opacity:0.8,marginTop:3}}>→ {item.action}</div></div>))}</div>))}</div>)}{insightTab==="Porter's Five Forces"&&porterData&&(<div style={{display:"flex",flexDirection:"column",gap:10}}>{[{key:"supplier_power",label:"Supplier Power",icon:"🏭"},{key:"buyer_power",label:"Buyer Power",icon:"🛒"},{key:"competitive_rivalry",label:"Competitive Rivalry",icon:"⚔"},{key:"new_entrants",label:"Threat of New Entrants",icon:"🚪"},{key:"substitutes",label:"Threat of Substitutes",icon:"🔄"}].map(f=>{const d=porterData[f.key];const rC=d.rating==="High"?"#A32D2D":d.rating==="Medium"?"#854F0B":"#3B6D11";const rB=d.rating==="High"?"#FCEBEB":d.rating==="Medium"?"#FAEEDA":"#EAF3DE";const bW=d.rating==="High"?"85%":d.rating==="Medium"?"50%":"25%";return(<div key={f.key} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontWeight:600,fontSize:13}}>{f.icon} {f.label}</div><span style={{background:rB,color:rC,padding:"2px 10px",borderRadius:10,fontSize:11,fontWeight:700}}>{d.rating} Risk</span></div><div style={{background:C.border,borderRadius:4,height:6,marginBottom:8}}><div style={{width:bW,background:rC,height:6,borderRadius:4}}/></div><div style={{fontSize:12,color:C.muted,marginBottom:4}}>{d.insight}</div><div style={{fontSize:12,color:"#534AB7",fontWeight:600}}>→ {d.action}</div></div>);})}</div>)}{insightTab==="Money Strategies"&&moneyData&&(<div style={{display:"flex",flexDirection:"column",gap:20}}><div><div style={{fontWeight:700,fontSize:13,color:"#3B6D11",marginBottom:10}}>💰 Revenue Growth</div>{(moneyData.revenue_growth||[]).map((item,i)=>(<div key={i} style={{background:"#EAF3DE",border:"1px solid #6BAD2E",borderRadius:8,padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontWeight:600,fontSize:13,color:"#3B6D11"}}>{item.title}</div><span style={{background:item.impact==="High"?"#3B6D11":item.impact==="Medium"?"#6BAD2E":"#A8D57B",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{item.impact} Impact</span></div><div style={{fontSize:12,color:"#3B6D11",opacity:0.85}}>{item.description}</div></div>))}</div><div><div style={{fontWeight:700,fontSize:13,color:"#185FA5",marginBottom:10}}>✂️ Cost Reduction</div>{(moneyData.cost_reduction||[]).map((item,i)=>(<div key={i} style={{background:"#E6F1FB",border:"1px solid #4A90D9",borderRadius:8,padding:"12px 14px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontWeight:600,fontSize:13,color:"#185FA5"}}>{item.title}</div><span style={{background:"#185FA5",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>Save {item.saving}</span></div><div style={{fontSize:12,color:"#185FA5",opacity:0.85}}>{item.description}</div></div>))}</div><div><div style={{fontWeight:700,fontSize:13,color:"#7B3FA0",marginBottom:10}}>🆕 New Ideas</div>{(moneyData.new_products||[]).map((item,i)=>(<div key={i} style={{background:"#F4EBF9",border:"1px solid #B57FD4",borderRadius:8,padding:"12px 14px",marginBottom:8}}><div style={{fontWeight:600,fontSize:13,color:"#7B3FA0",marginBottom:4}}>{item.title}</div><div style={{fontSize:12,color:"#7B3FA0",opacity:0.85,marginBottom:4}}>{item.description}</div><div style={{fontSize:11,color:"#7B3FA0",fontWeight:600}}>Why now → {item.rationale}</div></div>))}</div></div>)}</>)}{swotData?.error&&<div style={{color:"#A32D2D",fontSize:13,padding:12}}>{swotData.error}</div>}</div>)}

      {tab==="Automations"&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div><div style={{fontWeight:600,fontSize:15}}>Workflow Automations</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Set rules that run automatically when conditions are met</div></div>
          <button onClick={()=>setShowAddAuto(s=>!s)} style={btn("#7B3FA0")}>+ New Rule</button>
        </div>

        {showAddAuto&&(<div style={{border:"2px solid #7B3FA0",borderRadius:10,padding:16,marginBottom:16,background:"#F9F5FF"}}>
          <div style={{fontWeight:600,fontSize:13,color:"#7B3FA0",marginBottom:12}}>New Automation Rule</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted}}>Rule name *</label><input placeholder="e.g. Auto-reorder when low" value={autoForm.name} onChange={e=>setAutoForm(f=>({...f,name:e.target.value}))} style={inp}/></div>
            <div><label style={{fontSize:12,color:C.muted}}>When (trigger)</label>
              <select value={autoForm.trigger_type} onChange={e=>setAutoForm(f=>({...f,trigger_type:e.target.value}))} style={inp}>
                <option value="stock_below_min">Stock drops below minimum</option>
                <option value="stock_zero">Item goes out of stock</option>
                <option value="margin_below">Margin drops below %</option>
              </select>
            </div>
            <div><label style={{fontSize:12,color:C.muted}}>{autoForm.trigger_type==="margin_below"?"Margin threshold (%)":"Trigger value (0 = use item min)"}</label>
              <input type="number" value={autoForm.trigger_value} onChange={e=>setAutoForm(f=>({...f,trigger_value:e.target.value}))} style={inp}/>
            </div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.muted}}>Then (action)</label>
              <select value={autoForm.action_type} onChange={e=>setAutoForm(f=>({...f,action_type:e.target.value}))} style={inp}>
                <option value="create_po">Auto-create purchase order</option>
                <option value="log_alert">Log alert in audit trail</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveAutomation} style={btn("#7B3FA0")}>Save rule</button>
            <button onClick={()=>{setShowAddAuto(false);setAutoForm(emptyAuto);}} style={btn("#888")}>Cancel</button>
          </div>
        </div>)}

        {automations.length===0&&!showAddAuto&&(<div style={{background:C.bg2,borderRadius:10,padding:"40px 20px",textAlign:"center",color:C.muted,fontSize:13}}>
          <div style={{fontSize:36,marginBottom:12}}>🤖</div>
          <div style={{fontWeight:600,fontSize:15,color:C.text,marginBottom:6}}>No automations yet</div>
          <div style={{marginBottom:16}}>Create your first rule to automate repetitive inventory tasks.</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",fontSize:12}}>
            {[["Auto-reorder low stock","stock_below_min","create_po"],["Alert on stockout","stock_zero","log_alert"],["Alert on low margin","margin_below","log_alert"]].map(([name,trigger,action])=>(
              <button key={name} onClick={()=>{setAutoForm({name,trigger_type:trigger,trigger_value:0,action_type:action,action_value:""});setShowAddAuto(true);}} style={{...btn("#7B3FA0"),padding:"6px 14px",fontSize:12}}>+ {name}</button>
            ))}
          </div>
        </div>)}

        {automations.map(rule=>{
          const triggerLabel={stock_below_min:"Stock below minimum",stock_zero:"Item out of stock",margin_below:`Margin below ${rule.trigger_value}%`}[rule.trigger_type]||rule.trigger_type;
          const actionLabel={create_po:"Auto-create purchase order",log_alert:"Log alert in audit trail"}[rule.action_type]||rule.action_type;
          return(<div key={rule.id} style={{border:`1px solid ${rule.enabled?"#B57FD4":C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:10,background:rule.enabled?"#F9F5FF":C.bg}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:rule.enabled?"#7B3FA0":C.muted,marginBottom:4}}>{rule.name}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:6}}>
                  <span style={{background:"#F4EBF9",color:"#7B3FA0",padding:"2px 8px",borderRadius:6,marginRight:6}}>When: {triggerLabel}</span>
                  <span style={{background:"#EAF3DE",color:"#3B6D11",padding:"2px 8px",borderRadius:6}}>Then: {actionLabel}</span>
                </div>
                {rule.last_fired&&<div style={{fontSize:11,color:C.muted}}>Last ran: {new Date(rule.last_fired).toLocaleString()} · Fired {rule.fire_count} times</div>}
                {!rule.last_fired&&<div style={{fontSize:11,color:C.muted}}>Never fired yet</div>}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <div onClick={()=>toggleAutomation(rule.id,rule.enabled)} style={{position:"relative",width:36,height:20,cursor:"pointer",background:rule.enabled?"#7B3FA0":C.border,borderRadius:20,transition:".2s"}}>
                  <div style={{position:"absolute",width:14,height:14,left:rule.enabled?19:3,top:3,background:"#fff",borderRadius:"50%",transition:".2s"}}/>
                </div>
                <button onClick={()=>deleteAutomation(rule.id)} style={{...btn("#A32D2D"),padding:"4px 10px",fontSize:11}}>Delete</button>
              </div>
            </div>
          </div>);
        })}

        {automations.length>0&&(<div style={{background:"#F0F4FF",border:"1px solid #B8C9F5",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#185FA5",marginTop:8}}>
          ℹ️ Rules run automatically when you record a sale. They check all inventory against your conditions.
        </div>)}
      </div>)}

      {tab==="Import Products"&&(<div><div style={{marginBottom:16}}><div style={{fontWeight:600,fontSize:15}}>Import Products into StockGuard</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Transfer your existing product list all at once.</div></div>{importStatus==="done"&&mergeStats&&(<div style={{background:"#EAF3DE",border:"1px solid #6BAD2E",borderRadius:10,padding:"20px 24px",marginBottom:16,textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>✅</div><div style={{fontWeight:700,fontSize:15,color:"#3B6D11",marginBottom:4}}>Import Successful!</div><div style={{fontSize:13,color:"#3B6D11",marginBottom:12}}><strong>{mergeStats.total}</strong> products imported — <strong>{mergeStats.added}</strong> new, <strong>{mergeStats.updated}</strong> updated.</div><div style={{display:"flex",gap:8,justifyContent:"center"}}><button onClick={()=>setTab("Dashboard")} style={btn("#3B6D11")}>View inventory</button><button onClick={resetImport} style={btn("#185FA5")}>Import more</button></div></div>)}{importStatus!=="done"&&(<><div style={{display:"flex",gap:4,marginBottom:18}}>{[["csv","CSV / Excel"],["paste","Paste from Spreadsheet"],["manual","Type Manually"]].map(([k,l])=>(<button key={k} onClick={()=>{setImportTab(k);resetImport();}} style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${C.border}`,background:importTab===k?"#185FA5":"transparent",color:importTab===k?"#fff":C.muted,fontSize:12,cursor:"pointer",fontWeight:importTab===k?600:400}}>{l}</button>))}</div>{importTab==="csv"&&importStatus!=="preview"&&(<div><div style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:"32px 20px",textAlign:"center",marginBottom:14,background:C.bg2}}><div style={{fontSize:32,marginBottom:8}}>📂</div><div style={{fontWeight:600,marginBottom:4}}>Upload your CSV file</div><div style={{fontSize:12,color:C.muted,marginBottom:14}}>Supported columns: SKU, Name, Category, Qty, MinQty, Supplier, UnitCost, SellingPrice, Location</div><label style={{...btn("#185FA5"),display:"inline-block",cursor:"pointer"}}>Choose file <input type="file" accept=".csv,.txt" onChange={handleCSVUpload} style={{display:"none"}}/></label></div><div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.muted}}><span>Don't have the right format?</span><button onClick={downloadTemplate} style={{...btn("#0F6E56"),padding:"4px 12px",fontSize:12}}>Download template</button></div></div>)}{importTab==="paste"&&importStatus!=="preview"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:8}}>Copy cells from Excel or Google Sheets and paste below.</div><textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"SKU\tName\tCategory\tQty\tMinQty\tSupplier\tUnitCost\tSellingPrice\tLocation"} style={{...inp,height:160,fontFamily:"monospace",fontSize:12,resize:"vertical"}}/><button onClick={handlePasteParse} style={{...btn("#185FA5"),marginTop:10}}>Preview import</button></div>)}{importTab==="manual"&&importStatus!=="preview"&&(<div><div style={{fontSize:13,color:C.muted,marginBottom:10}}>Enter products row by row.</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["SKU","Name","Category","Qty","Min Qty","Supplier","Unit Cost","Sell Price","Location",""].map(h=>(<th key={h} style={{padding:"4px 6px",fontWeight:600,color:C.muted,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{manualRows.map((row,i)=>(<tr key={i}>{["sku","name","category","qty","minQty","supplier","unitCost","sellingPrice","location"].map(f=>(<td key={f} style={{padding:"3px 4px"}}><input value={row[f]||""} onChange={e=>setManualRows(rows=>rows.map((r,j)=>j===i?{...r,[f]:e.target.value}:r))} style={{...inp,fontSize:12,padding:"5px 7px",minWidth:f==="name"?120:70}} placeholder={["qty","minQty","unitCost","sellingPrice"].includes(f)?"0":""}/></td>))}<td style={{padding:"3px 4px"}}><button onClick={()=>setManualRows(rows=>rows.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#A32D2D",cursor:"pointer",fontSize:16}}>x</button></td></tr>))}</tbody></table></div><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setManualRows(r=>[...r,{sku:"",name:"",category:"",qty:"",minQty:"",supplier:"",unitCost:"",sellingPrice:"",location:""}])} style={{...btn("#0F6E56"),fontSize:12}}>+ Add row</button><button onClick={handleManualParse} style={btn("#185FA5")}>Preview import</button></div></div>)}{importErrors.length>0&&(<div style={{background:"#FCEBEB",border:"1px solid #E05A5A",borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:12,color:"#A32D2D"}}><strong>Warnings:</strong> {importErrors.join(" · ")}</div>)}{importStatus==="preview"&&importPreview.length>0&&(<div style={{marginTop:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontWeight:600,fontSize:13}}>Preview — {importPreview.length} products ready</div><div style={{display:"flex",gap:8}}><button onClick={resetImport} style={{...btn("#888"),padding:"6px 12px",fontSize:12}}>Cancel</button><button onClick={confirmMerge} style={btn("#3B6D11")}>Confirm and merge</button></div></div><div style={{overflowX:"auto",maxHeight:320,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["SKU","Name","Category","Qty","Min","Supplier","Cost","Sell","Location","Status"].map(h=>(<th key={h} style={{padding:"6px 8px",fontWeight:600,color:C.muted,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{importPreview.map((item,i)=>{const exists=inventory.find(x=>x.sku===item.sku);return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:exists?"#FAEEDA":"#EAF3DE"}}><td style={{padding:"6px 8px",fontFamily:"monospace"}}>{item.sku}</td><td style={{padding:"6px 8px",fontWeight:600}}>{item.name}</td><td style={{padding:"6px 8px"}}>{item.category}</td><td style={{padding:"6px 8px"}}>{item.qty}</td><td style={{padding:"6px 8px"}}>{item.minQty}</td><td style={{padding:"6px 8px"}}>{item.supplier}</td><td style={{padding:"6px 8px"}}>${item.unitCost}</td><td style={{padding:"6px 8px"}}>{item.sellingPrice?`$${item.sellingPrice}`:"—"}</td><td style={{padding:"6px 8px"}}>{item.location}</td><td style={{padding:"6px 8px"}}><span style={{background:exists?"#FAEEDA":"#EAF3DE",color:exists?"#854F0B":"#3B6D11",padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{exists?"Update":"New"}</span></td></tr>);})}</tbody></table></div></div>)}</>)}</div>)}

      {tab==="shopify"&&(
          <ShopifyTab supabase={supabase} userId={userId} />
        )}

        {tab==="shopify"&&(
          <ShopifyTab supabase={supabase} userId={userId} />
        )}
        {tab==="shopify"&&(
          <ShopifyTab supabase={supabase} userId={userId} />
        )}
        {tab==="Pricing"&&(<div><div style={{textAlign:"center",marginBottom:6}}><p style={{fontSize:12,color:C.muted,marginBottom:16}}>Choose the plan that fits your store</p></div><div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:28}}><span style={{fontSize:13,color:annual?C.muted:C.text,fontWeight:annual?400:600}}>Monthly</span><div onClick={()=>setAnnual(a=>!a)} style={{position:"relative",width:40,height:22,cursor:"pointer",background:annual?"#185FA5":C.border,borderRadius:22,transition:".2s"}}><div style={{position:"absolute",width:16,height:16,left:annual?21:3,top:3,background:"#fff",borderRadius:"50%",transition:".2s"}}/></div><span style={{fontSize:13,color:annual?C.text:C.muted,fontWeight:annual?600:400}}>Annual</span><span style={{fontSize:11,background:"#EAF3DE",color:"#3B6D11",padding:"2px 8px",borderRadius:10,fontWeight:700,border:"1px solid #6BAD2E"}}>Save 20%</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:14}}>{PLANS.map((pl,i)=>{const p=annual?pl.ap:pl.price;const saving=annual&&pl.price>0?`Save $${(pl.price-pl.ap)*12}/yr`:"";return(<div key={i} style={{background:C.bg,border:pl.featured?`2px solid ${pl.color}`:`1px solid ${C.border}`,borderRadius:14,padding:20,display:"flex",flexDirection:"column"}}>{pl.badge?<span style={{display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:6,background:pl.badgeBg,color:pl.badgeColor,marginBottom:10,alignSelf:"flex-start"}}>{pl.badge}</span>:<div style={{height:24}}/>}<div style={{fontWeight:600,fontSize:15,color:pl.color,marginBottom:4}}>{pl.name}</div><div style={{fontSize:34,fontWeight:600,lineHeight:1,color:pl.color,marginBottom:4}}>{p===0?"Free":`$${p}`}{p>0&&<span style={{fontSize:13,fontWeight:400,color:C.muted}}>/mo</span>}</div><div style={{fontSize:11,color:"#3B6D11",marginBottom:14,minHeight:16}}>{saving}</div><button style={{display:"block",width:"100%",padding:10,borderRadius:8,border:"none",background:pl.color,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:16}}>{pl.cta}</button>{pl.inc.map((f,j)=><div key={j} style={{display:"flex",gap:6,fontSize:12,padding:"3px 0",color:C.text}}><span style={{color:pl.color,fontWeight:700}}>✓</span>{f}</div>)}{pl.exc.map((f,j)=><div key={j} style={{display:"flex",gap:6,fontSize:12,padding:"3px 0",color:C.muted}}><span>✕</span>{f}</div>)}</div>);})}</div></div>)}

        </div>
      </div>
      {tab==="shopify"&&(
  <ShopifyTab supabase={supabase} userId={userId} />
)}

      {tab==="quickbooks"&&(
        <QuickBooksTab supabase={supabase} userId={userId} />
      )}

      
        {tab==="billing"&&(
          <BillingTab supabase={supabase} userId={userId} userEmail={userEmail} />
        )}
        {/* ── CHAT SLIDE-OVER PANEL ── */}
      <DashboardPopover popover={popover} onClose={()=>setPopover(null)} onAction={(fn)=>{fn&&fn();setPopover(null);}}/>
      {chatOpen&&(
        <div style={{position:"fixed",top:0,right:0,width:360,height:"100vh",background:"#fff",boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",zIndex:300,display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>
          <div style={{background:"#1B2B4B",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#fff",fontWeight:600,fontSize:14}}>💬 Chat</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:2}}>{chatOpen.name}</div>
            </div>
            <button onClick={closeChat} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:20,cursor:"pointer",padding:4}}>✕</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
            {commentLoading&&<div style={{textAlign:"center",color:"#888",fontSize:13,marginTop:20}}>Loading...</div>}
            {!commentLoading&&comments.length===0&&<div style={{textAlign:"center",color:"#888",fontSize:13,marginTop:40}}><div style={{fontSize:32,marginBottom:8}}>💬</div><div>No comments yet</div><div style={{fontSize:11,marginTop:4}}>Be the first to add a note</div></div>}
            {comments.map(c=>(
              <div key={c.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:600,color:"#185FA5"}}>Staff</span>
                  <span style={{fontSize:10,color:"#aaa"}}>{c.created_at?new Date(c.created_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}</span>
                </div>
                <div style={{background:"#F0F4FF",borderRadius:10,borderTopLeftRadius:2,padding:"10px 14px",fontSize:13,color:"#111",lineHeight:1.5}}>{c.message}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"14px 20px",borderTop:"1px solid #e0e0e0"}}>
            <div style={{display:"flex",gap:8}}>
              <input
                placeholder="Type a note..."
                value={commentText}
                onChange={e=>setCommentText(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),postComment())}
                style={{flex:1,padding:"9px 12px",borderRadius:8,border:"1px solid #e0e0e0",fontSize:13,outline:"none"}}
              />
              <button onClick={postComment} disabled={!commentText.trim()} style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#1B2B4B",color:"#fff",fontSize:13,cursor:"pointer",opacity:commentText.trim()?1:0.5}}>Send</button>
            </div>
            <div style={{fontSize:11,color:"#aaa",marginTop:6}}>Press Enter to send</div>
          </div>
        </div>
      )}
      {chatOpen&&<div onClick={closeChat} style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",background:"rgba(0,0,0,0.3)",zIndex:299}}/>}
      <HelpPanel />
    </div>
  );
}function ShopifyTab({ supabase, userId }) {
  // Debug: render immediately to test
  if (!userId) return <div style={{padding:40,color:'red'}}>No userId provided</div>;
  const [connection, setConnection] = useState(null);
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [syncStats, setSyncStats] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [loadingConnection, setLoadingConnection] = useState(true);

  useEffect(() => { loadConnection(); }, [userId]);

  async function loadConnection() {
    setLoadingConnection(true);
    try {
      const { data } = await supabase
        .from('shopify_connections')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) { setConnection(data); setShopUrl(data.shop_url || ''); }
    } catch (e) {}
    setLoadingConnection(false);
  }

  async function testAndSaveConnection() {
    if (!shopUrl || !accessToken) {
      setStatus('error'); setMessage('Please enter both your store URL and access token.'); return;
    }
    setStatus('testing'); setMessage('Testing connection...');
    try {
      const res = await fetch('/api/shopify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', shop_url: shopUrl, access_token: accessToken }),
      });
      const data = await res.json();
      if (!data.success) { setStatus('error'); setMessage('Connection failed: ' + (data.error || 'Invalid credentials')); return; }
      const { error: upsertErr } = await supabase.from('shopify_connections').upsert({
        user_id: userId,
        shop_url: shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        access_token: accessToken,
        shop_name: data.shop?.name || shopUrl,
        connected_at: new Date().toISOString(),
        last_sync: null,
      }, { onConflict: 'user_id' });
      if (upsertErr) throw upsertErr;
      setStatus('success'); setMessage('✓ Connected to ' + (data.shop?.name || shopUrl));
      loadConnection();
    } catch (err) { setStatus('error'); setMessage('Error: ' + err.message); }
  }

  async function syncProducts() {
    if (!connection) return;
    setStatus('syncing'); setMessage('Fetching products from Shopify...');
    try {
      const res = await fetch('/api/shopify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_products', shop_url: connection.shop_url, access_token: connection.access_token }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const products = data.products;
      setMessage(`Processing ${products.length} products...`);
      let newCount = 0, updatedCount = 0;
      for (const product of products) {
        for (const variant of product.variants) {
          const sku = variant.sku || `shopify-${variant.id}`;
          const { data: existing } = await supabase.from('inventory').select('id, qty')
            .eq('shopify_variant_id', String(variant.id)).eq('user_id', userId).single();
          const inventoryRow = {
            user_id: userId,
            name: product.title + (variant.title !== 'Default Title' ? ` - ${variant.title}` : ''),
            sku, qty: variant.inventory_quantity || 0,
            cost: parseFloat(variant.compare_at_price || variant.price) * 0.6 || 0,
            selling_price: parseFloat(variant.price) || 0,
            category: product.product_type || 'Shopify',
            supplier: product.vendor || '', location: 'Main', min_stock: 5,
            shopify_product_id: String(product.id), shopify_variant_id: String(variant.id), shopify_synced: true,
          };
          if (existing) {
            await supabase.from('inventory').update({ qty: variant.inventory_quantity || 0, shopify_synced: true }).eq('id', existing.id);
            updatedCount++;
          } else {
            await supabase.from('inventory').insert(inventoryRow);
            newCount++;
          }
        }
      }
      await supabase.from('shopify_connections').update({ last_sync: new Date().toISOString(), product_count: products.length }).eq('user_id', userId);
      setSyncStats({ newCount, updatedCount, total: products.length });
      setStatus('success'); setMessage(`✓ Sync complete! ${newCount} new, ${updatedCount} updated.`);
      loadConnection();
    } catch (err) { setStatus('error'); setMessage('Sync failed: ' + err.message); }
  }

  async function syncOrders() {
    if (!connection) return;
    setStatus('syncing'); setMessage('Fetching recent Shopify orders...');
    try {
      const since = connection.last_sync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch('/api/shopify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_orders', shop_url: connection.shop_url, access_token: connection.access_token, since_date: since }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      let deducted = 0;
      for (const order of data.orders) {
        for (const item of order.line_items) {
          if (!item.variant_id) continue;
          const { data: invItem } = await supabase.from('inventory').select('id, qty, name, selling_price, cost')
            .eq('shopify_variant_id', String(item.variant_id)).eq('user_id', userId).single();
          if (!invItem) continue;
          const newQty = Math.max(0, (invItem.qty || 0) - item.quantity);
          await supabase.from('inventory').update({ qty: newQty }).eq('id', invItem.id);
          await supabase.from('audit_log').insert({
            user_id: userId, action: 'sold', item_id: invItem.id, item_name: invItem.name,
            qty_change: -item.quantity, note: `Shopify Order ${order.name}`,
            revenue: item.quantity * (invItem.selling_price || 0),
            profit: item.quantity * ((invItem.selling_price || 0) - (invItem.cost || 0)),
            created_at: order.created_at,
          });
          deducted++;
        }
      }
      await supabase.from('shopify_connections').update({ last_sync: new Date().toISOString() }).eq('user_id', userId);
      setStatus('success'); setMessage(`✓ Orders synced! ${data.orders.length} orders, ${deducted} inventory adjustments.`);
      loadConnection();
    } catch (err) { setStatus('error'); setMessage('Order sync failed: ' + err.message); }
  }

  async function disconnect() {
    if (!window.confirm('Disconnect Shopify? Your inventory data will remain, but syncing will stop.')) return;
    await supabase.from('shopify_connections').delete().eq('user_id', userId);
    setConnection(null); setShopUrl(''); setAccessToken(''); setStatus('idle'); setMessage('');
  }

  const sidebarColor = '#1B2B4B', green = '#10b981', red = '#ef4444', shopifyGreen = '#96bf48';

  if (loadingConnection) return <div style={{padding:40,color:'#64748b'}}>Loading Shopify connection...</div>;

  return (
    <div style={{padding:'32px',maxWidth:720,fontFamily:'system-ui,sans-serif'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        <div style={{width:40,height:40,borderRadius:10,background:shopifyGreen,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:'#fff'}}>S</div>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:700,color:sidebarColor}}>Shopify Integration</h2>
          <p style={{margin:0,fontSize:13,color:'#64748b'}}>Import products and sync orders from your Shopify store</p>
        </div>
      </div>
      <hr style={{border:'none',borderTop:'1px solid #e2e8f0',margin:'20px 0'}} />
      {message && (
        <div style={{padding:'10px 16px',borderRadius:8,marginBottom:20,fontSize:14,
          background:status==='error'?'#fef2f2':status==='success'?'#f0fdf4':'#f0f9ff',
          color:status==='error'?red:status==='success'?green:'#0369a1',
          border:`1px solid ${status==='error'?'#fecaca':status==='success'?'#bbf7d0':'#bae6fd'}`}}>
          {message}
        </div>
      )}
      {!connection && (
        <div style={{background:'#f8fafc',borderRadius:12,padding:28,border:'1px solid #e2e8f0'}}>
          <h3 style={{margin:'0 0 6px',fontSize:16,fontWeight:600,color:sidebarColor}}>Connect Your Shopify Store</h3>
          <p style={{margin:'0 0 24px',fontSize:13,color:'#64748b',lineHeight:1.5}}>Enter your Shopify store URL and Admin API access token.</p>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Store URL</label>
              <input type="text" placeholder="your-store.myshopify.com" value={shopUrl} onChange={e=>setShopUrl(e.target.value)}
                style={{width:'100%',padding:'10px 14px',borderRadius:8,boxSizing:'border-box',border:'1.5px solid #d1d5db',fontSize:14,fontFamily:'monospace'}} />
            </div>
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Admin API Access Token</label>
              <div style={{position:'relative'}}>
                <input type={showToken?'text':'password'} placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" value={accessToken} onChange={e=>setAccessToken(e.target.value)}
                  style={{width:'100%',padding:'10px 40px 10px 14px',borderRadius:8,boxSizing:'border-box',border:'1.5px solid #d1d5db',fontSize:14,fontFamily:'monospace'}} />
                <button onClick={()=>setShowToken(v=>!v)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:13}}>
                  {showToken?'Hide':'Show'}
                </button>
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:8,padding:16,border:'1px solid #e2e8f0',fontSize:13,color:'#374151'}}>
              <p style={{margin:'0 0 8px',fontWeight:600,color:sidebarColor}}>How to get your access token:</p>
              <ol style={{margin:0,paddingLeft:18,lineHeight:2}}>
                <li>Shopify Admin → <strong>Settings</strong> → <strong>Apps and sales channels</strong></li>
                <li>Click <strong>Develop apps</strong> → <strong>Create an app</strong></li>
                <li>Name it "StockGuard" → <strong>Configure Admin API scopes</strong></li>
                <li>Enable: <code>read_products</code>, <code>read_inventory</code>, <code>read_orders</code>, <code>write_inventory</code></li>
                <li>Click <strong>Install app</strong> → copy the <strong>Admin API access token</strong></li>
              </ol>
            </div>
            <button onClick={testAndSaveConnection} disabled={status==='testing'}
              style={{padding:'12px 24px',borderRadius:8,border:'none',background:status==='testing'?'#94a3b8':sidebarColor,color:'#fff',fontWeight:600,fontSize:15,cursor:status==='testing'?'not-allowed':'pointer'}}>
              {status==='testing'?'Testing connection...':'Connect Shopify'}
            </button>
          </div>
        </div>
      )}
      {connection && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'#f0fdf4',borderRadius:12,padding:20,border:'1.5px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:22}}>✓</span>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:'#065f46'}}>{connection.shop_name||connection.shop_url}</div>
                <div style={{fontSize:12,color:'#059669'}}>{connection.shop_url} · Connected {new Date(connection.connected_at).toLocaleDateString()}</div>
              </div>
            </div>
            <button onClick={disconnect} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #fca5a5',background:'#fff',color:red,fontSize:13,cursor:'pointer',fontWeight:500}}>Disconnect</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            {[{label:'Products Synced',value:connection.product_count||'—'},{label:'Last Sync',value:connection.last_sync?new Date(connection.last_sync).toLocaleString():'Never'},{label:'Store',value:connection.shop_url}].map((stat,i)=>(
              <div key={i} style={{background:'#f8fafc',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0'}}>
                <div style={{fontSize:11,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>{stat.label}</div>
                <div style={{fontSize:14,fontWeight:700,color:sidebarColor,wordBreak:'break-all'}}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#f8fafc',borderRadius:12,padding:24,border:'1px solid #e2e8f0'}}>
            <h3 style={{margin:'0 0 6px',fontSize:16,fontWeight:600,color:sidebarColor}}>Sync Actions</h3>
            <p style={{margin:'0 0 20px',fontSize:13,color:'#64748b'}}>Products sync qty; orders deduct inventory and log to Audit Trail.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <button onClick={syncProducts} disabled={status==='syncing'}
                style={{padding:'11px 20px',borderRadius:8,border:'none',background:status==='syncing'?'#94a3b8':sidebarColor,color:'#fff',fontWeight:600,fontSize:14,cursor:status==='syncing'?'not-allowed':'pointer'}}>
                {status==='syncing'?'Syncing...':'⬇ Sync Products'}
              </button>
              <button onClick={syncOrders} disabled={status==='syncing'}
                style={{padding:'11px 20px',borderRadius:8,border:`1.5px solid ${sidebarColor}`,background:'#fff',color:sidebarColor,fontWeight:600,fontSize:14,cursor:status==='syncing'?'not-allowed':'pointer'}}>
                {status==='syncing'?'Syncing...':'📦 Sync Orders'}
              </button>
            </div>
          </div>
          {syncStats && (
            <div style={{background:'#fff',borderRadius:10,padding:18,border:'1px solid #e2e8f0',fontSize:14}}>
              <p style={{margin:0,fontWeight:600,color:sidebarColor,marginBottom:8}}>Last sync results:</p>
              <p style={{margin:'4px 0',color:'#374151'}}>• {syncStats.total} total Shopify products processed</p>
              <p style={{margin:'4px 0',color:green}}>• {syncStats.newCount} new items added to inventory</p>
              <p style={{margin:'4px 0',color:'#0369a1'}}>• {syncStats.updatedCount} existing items updated</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}