const headers = {"Content-Type":"application/json","Cache-Control":"no-store"};
const send = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
export default async function(request) {
 if(request.method!=="POST") return send({error:"Método no permitido"},405);
 const key=process.env.GEMINI_API_KEY;
 if(!key)return send({error:"Configura GEMINI_API_KEY en el servidor de Netlify"},500);
 try {
  const {image,mimeType}=await request.json();
  if(!["image/jpeg","image/png","image/webp"].includes(mimeType)||typeof image!=="string"||image.length>5_000_000||!/^[A-Za-z0-9+/]+={0,2}$/.test(image))
   return send({error:"Imagen inválida o demasiado grande"},400);
  const prompt=`Eres un asistente educativo de observación de aves de Cali, Colombia. Examina la fotografía. No inventes identificación ni ubicación. Si no hay ave, deja nombres vacíos. Si no hay rasgos suficientes, indica "No identificada" y certeza "baja". Una fotografía no confirma que el ave habite Cristo Rey. Devuelve SOLO JSON con las propiedades: nombre_comun (string), nombre_cientifico (string), explicacion (string), rasgos (string), conservacion (string), confianza (string: baja, media o alta). Explica la incertidumbre, nunca des una certeza numérica ficticia. La conservación debe ofrecer recomendaciones prácticas, sin afirmar que la especie está amenazada sin evidencia. Todo en español.`;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  let response;
  try {response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',{
    method:'POST',signal:controller.signal,
    headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:image}}]}],generationConfig:{responseMimeType:'application/json',temperature:0.2,maxOutputTokens:4096}})
  });}finally{clearTimeout(timer)}
  const result=await response.json();
  
  if(!response.ok){console.error('Gemini API error',response.status,JSON.stringify(result).slice(0,400));return send({error:response.status===429?'Se alcanzó el límite temporal de Gemini. Intenta de nuevo.':'Gemini no pudo analizar la imagen. Revisa la configuración o inténtalo más tarde.'},502)}
  const raw=result.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('');
  if(!raw)return send({error:'Gemini no devolvió una identificación utilizable'},502);
  let parsed;try{parsed=JSON.parse(raw)}catch{return send({error:'Gemini devolvió una respuesta no válida'},502)}
  const safe={};for(const k of ['nombre_comun','nombre_cientifico','explicacion','rasgos','conservacion','confianza'])safe[k]=typeof parsed[k]==='string'?parsed[k].slice(0,1600):'';
  return send(safe);
 }catch(e){console.error('Identify failure',e?.message);return send({error:'No se pudo procesar la imagen. Comprueba el tamaño y la conexión.'},500)}
}
