import {media} from "./media";
export const services=[
 {_id:"s1",slug:"signature-cut",name:"SIGNATURE CUT",shortName:"CUT",description:"Consult, shape, detail and finish. A controlled 45-minute reset with room to talk before the scissors move.",duration:45,price:32,category:"HAIR",image:media.detail},
 {_id:"s2",slug:"cut-beard",name:"CUT + BEARD",shortName:"BOTH",description:"One continuous appointment for balance above and below the jawline — cut, beard architecture and final finish.",duration:60,price:44,category:"BOTH",image:media.chair},
 {_id:"s3",slug:"beard-detail",name:"BEARD DETAIL",shortName:"BEARD",description:"Shape, line, soften and finish. Built for beards that need structure without looking overworked.",duration:30,price:24,category:"BEARD",image:media.tools},
 {_id:"s4",slug:"full-restyle",name:"FULL RESTYLE",shortName:"RESTYLE",description:"Extra consultation and cutting time for a bigger change, longer growth, or a silhouette that needs rebuilding.",duration:70,price:49,category:"HAIR",image:media.hero},
 {_id:"s5",slug:"scissor-work",name:"LONG / SCISSOR WORK",shortName:"LONG",description:"Movement, weight and shape for medium-to-long hair. Less clipper, more architecture.",duration:55,price:39,category:"HAIR",image:media.looks[4]}
];
export const barbers=[
 {_id:"b1",slug:"jack",name:"JACK HARPER",chairNumber:"01",bio:"Jack works in clean contrasts: tight edges, soft texture and fades that grow out without collapsing after week two.",specialties:["FADE","TEXTURE","BEARD"],portrait:media.portraits[0]},
 {_id:"b2",slug:"mason",name:"MASON REED",chairNumber:"02",bio:"Mason is the scissor-first barber. Classic shape, longer hair and restyles with a quieter finish and a strong silhouette.",specialties:["SCISSOR","CLASSIC","RESTYLE"],portrait:media.portraits[1]},
 {_id:"b3",slug:"elliot",name:"ELLIOT COLE",chairNumber:"03",bio:"Elliot is exact without making the result look rigid — short hair, beard balance and clean structure are his lane.",specialties:["SHORT HAIR","BEARD","DETAIL"],portrait:media.portraits[2]},
 {_id:"b4",slug:"noah",name:"NOAH VALE",chairNumber:"04",bio:"Noah builds low-maintenance shape into longer hair, loose texture and cuts designed to survive real mornings.",specialties:["LONG HAIR","TEXTURE","SCISSOR"],portrait:media.portraits[3]}
];
export const looks=media.looks.map((image,i)=>({id:`look-${i+1}`,image,title:["LOW TAPER / TEXTURE","SOFT CROP","CLASSIC SIDE","BEARD BALANCE","LONG LAYERS","SKIN FADE"][i],category:["FADES","TEXTURE","CLASSIC","BEARDS","LONG","FADES"][i],barber:barbers[i%4],service:services[i%5]}));
export const journal=[
 {slug:"three-week-rule",title:"THE 3-WEEK RULE",excerpt:"The point where a cut stops looking intentional — and what to do before it gets there.",type:"FIELD NOTE",cover:media.looks[1]},
 {slug:"ask-your-barber",title:"HOW TO ASK FOR WHAT YOU ACTUALLY WANT",excerpt:"Skip the haircut vocabulary test. Bring references, describe the problem, and let the consultation do its job.",type:"GUIDE",cover:media.tools},
 {slug:"growing-it-out",title:"GROWING IT OUT WITHOUT THE AWKWARD PART",excerpt:"You are not waiting for long hair. You are shaping every phase between here and there.",type:"BARBER ANSWER",cover:media.looks[4]},
 {slug:"quiet-chair",title:"WHY THE QUIET CHAIR MATTERS",excerpt:"A good appointment does not need to perform. Sometimes the luxury is simply having your time protected.",type:"HOUSE NOTE",cover:media.house}
];
