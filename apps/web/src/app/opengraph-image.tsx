import {ImageResponse} from "next/og";

export const alt="DevAcademy: Yazılımı öğren, uygulayarak ilerle";
export const size={width:1200,height:630};
export const contentType="image/png";

// Colors are the light "Olive & Earth" token values (design-tokens.css):
// paper #FFFDFA, ink #2F2A22, ink-muted #665B4C, olive-800 #485C32, olive-100 #E5E9D6.
export default function OpenGraphImage(){
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",
      background:"#FFFDFA",color:"#2F2A22",padding:"72px 80px",borderBottom:"18px solid #485C32"}}>
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <div style={{width:72,height:72,borderRadius:16,background:"#485C32",color:"#FFFDFA",display:"flex",
          alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:700}}>{"<>"}</div>
        <div style={{fontSize:40,fontWeight:700}}>DevAcademy</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{fontSize:72,fontWeight:700,lineHeight:1.1}}>Yazılımı öğren, uygulayarak ilerle.</div>
        <div style={{fontSize:30,color:"#665B4C"}}>Önce tahmin et, sonra kodu adım adım izle.</div>
      </div>
      <div style={{display:"flex"}}>
        <div style={{fontSize:24,color:"#485C32",background:"#E5E9D6",borderRadius:999,padding:"8px 20px"}}>Türkçe, etkileşimli yazılım dersleri</div>
      </div>
    </div>,
    size,
  );
}
