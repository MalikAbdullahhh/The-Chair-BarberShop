"use client";
import {createContext,useContext,useEffect,useMemo,useState} from "react";
import {api} from "@/lib/api";
import {services as fallbackServices,barbers as fallbackBarbers,journal as fallbackJournal,looks as fallbackLooks} from "@/data/site";
import type {Barber,JournalItem,Review,Service} from "@/lib/types";

type PublicData={services:Service[];barbers:Barber[];reviews:Review[];journal:JournalItem[];lookbook:any[];memberships:any[];content:Record<string,any>;settings:any;live:boolean};
const fallback:PublicData={services:fallbackServices,barbers:fallbackBarbers,reviews:[],journal:fallbackJournal,lookbook:fallbackLooks,memberships:[],content:{},settings:null,live:false};
const Ctx=createContext<PublicData>(fallback);

function padBy<T>(live:T[],base:T[],key:(item:T)=>string){
  const seen=new Set(live.map(key));
  return [...live,...base.filter(item=>!seen.has(key(item)))];
}
function mergeServices(remote:any[]=[]):Service[]{
  if(!remote.length)return fallbackServices;
  const live=remote.map((s,i)=>{const local=fallbackServices.find(x=>x.slug===s.slug)||fallbackServices[i%fallbackServices.length];return {...local,...s,image:s.image||local?.image}}) as Service[];
  return padBy(live,fallbackServices,x=>x.slug);
}
function mergeBarbers(remote:any[]=[]):Barber[]{
  if(!remote.length)return fallbackBarbers;
  const live=remote.map((b,i)=>{const local=fallbackBarbers.find(x=>x.slug===b.slug)||fallbackBarbers.find(x=>x.chairNumber===b.chairNumber)||fallbackBarbers[i%fallbackBarbers.length];return {...local,...b,portrait:b.portrait||local?.portrait,specialties:Array.isArray(b.specialties)&&b.specialties.length?b.specialties:local?.specialties||[]}}) as Barber[];
  return padBy(live,fallbackBarbers,x=>x.slug);
}
function mergeLookbook(remote:any[]=[],barbers:Barber[],services:Service[]){
  if(!remote.length)return fallbackLooks;
  const live=remote.map((x,i)=>({id:String(x._id||`look-${i+1}`),image:x.image||fallbackLooks[i%fallbackLooks.length]?.image,title:x.title||fallbackLooks[i%fallbackLooks.length]?.title||"HOUSE LOOK",category:String(x.category||fallbackLooks[i%fallbackLooks.length]?.category||"TEXTURE").toUpperCase(),barber:x.barber&&typeof x.barber==="object"?x.barber:barbers[i%barbers.length],service:x.service&&typeof x.service==="object"?x.service:services[i%services.length],description:x.description||""}));
  return padBy(live,fallbackLooks as any[],x=>String((x as any).id));
}
function mergeJournal(remote:any[]=[]):JournalItem[]{
  if(!remote.length)return fallbackJournal;
  const live=remote.map((j,i)=>{const local=fallbackJournal.find(x=>x.slug===j.slug)||fallbackJournal[i%fallbackJournal.length];return {...local,...j,cover:j.cover||local?.cover,type:j.type||local?.type||"FIELD NOTE",excerpt:j.excerpt||local?.excerpt||""}}) as JournalItem[];
  return padBy(live,fallbackJournal,x=>x.slug);
}

export function PublicDataProvider({children}:{children:React.ReactNode}){
  const [state,setState]=useState<PublicData>(fallback);
  useEffect(()=>{let alive=true;api<any>("/public/bootstrap").then(d=>{if(!alive)return;const content=Object.fromEntries((d.content||[]).map((x:any)=>[x.key,x]));const services=mergeServices(d.services);const barbers=mergeBarbers(d.barbers);setState({services,barbers,reviews:d.reviews||[],journal:mergeJournal(d.journal),lookbook:mergeLookbook(d.lookbook,barbers,services),memberships:d.memberships||[],content,settings:d.settings||null,live:true})}).catch(()=>{});return()=>{alive=false}},[]);
  const value=useMemo(()=>state,[state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const usePublicData=()=>useContext(Ctx);
