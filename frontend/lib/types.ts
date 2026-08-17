export type Service={_id:string;slug:string;name:string;shortName?:string;description:string;duration:number;price:number;category?:string;image?:string;active?:boolean};
export type Barber={_id:string;slug:string;name:string;chairNumber:string;bio:string;specialties:string[];portrait?:string;active?:boolean};
export type Review={_id?:string;name:string;quote:string;rating:number;service?:string};
export type JournalItem={_id?:string;slug:string;title:string;excerpt:string;type:string;cover?:string};
