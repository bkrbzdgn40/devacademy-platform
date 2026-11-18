// Public site origin for canonical URLs and structured data. It comes only from
// APP_ORIGIN; when that is missing or invalid, canonical tags are omitted
// instead of guessing a host.
export function siteOrigin(env=process.env){
  const raw=env?.APP_ORIGIN;
  if(!raw)return null;
  try{
    const url=new URL(raw);
    return url.protocol==="https:"||url.protocol==="http:"?url.origin:null;
  }catch{return null;}
}
export function canonicalFor(path,env=process.env){
  return siteOrigin(env)?{alternates:{canonical:path}}:{};
}
export function absoluteUrl(path,env=process.env){
  const origin=siteOrigin(env);
  return origin?new URL(path,origin).toString():undefined;
}
