'use client';
import { useEffect, useRef, useState } from 'react';

function parse(text:string,min?:number){
 const normalized=text.normalize('NFKC').replace(/−/g,'-').trim();
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized))return null;
 const value=Number(normalized);return Number.isFinite(value)&&(min===undefined||value>=min)?value:null;
}

/** The browser owns the editing buffer so React never rewrites an active IME session. */
export default function NumberInput({value,onValue,onInvalid,min,disabled=false}:{value:number|string;onValue:(value:string)=>void;onInvalid?:()=>void;min?:number;disabled?:boolean}){
 const text=Number.isFinite(Number(value))&&value!==''?String(value):'';
 const input=useRef<HTMLInputElement>(null),focused=useRef(false),composing=useRef(false),selectOnUp=useRef(false),last=useRef<number|null>(parse(text,min)),frame=useRef<number|null>(null);
 const [invalid,setInvalid]=useState(false);
 useEffect(()=>{if(!focused.current&&!composing.current&&input.current){input.current.value=text;last.current=parse(text,min);setInvalid(false);}},[text,min]);
 useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);},[]);
 function commit(raw:string){const number=parse(raw,min);setInvalid(number===null);if(number===null){if(onInvalid&&last.current!==null){last.current=null;onInvalid();}return;}if(last.current!==number){last.current=number;onValue(String(number));}}
 function select(el:HTMLInputElement){el.select();}
 return <input ref={input} type="text" inputMode="decimal" autoComplete="off" autoCorrect="off" spellCheck={false} disabled={disabled} defaultValue={text} aria-invalid={invalid||undefined}
  onPointerDown={e=>{selectOnUp.current=document.activeElement!==e.currentTarget;}}
  onFocus={e=>{focused.current=true;const el=e.currentTarget,initial=el.value;select(el);frame.current=requestAnimationFrame(()=>{if(document.activeElement===el&&!composing.current&&el.value===initial)select(el);});}}
  onPointerUp={e=>{if(selectOnUp.current&&!composing.current)select(e.currentTarget);selectOnUp.current=false;}}
  onCompositionStart={()=>{composing.current=true;}}
  onCompositionEnd={e=>{composing.current=false;commit(e.currentTarget.value);}}
  onChange={e=>{if(!composing.current&&!(e.nativeEvent as InputEvent).isComposing)commit(e.currentTarget.value);}}
  onBlur={e=>{focused.current=false;selectOnUp.current=false;if(composing.current)return;const number=parse(e.currentTarget.value,min);commit(e.currentTarget.value);if(number!==null)e.currentTarget.value=String(number);else if(!onInvalid){e.currentTarget.value=text;last.current=parse(text,min);setInvalid(false);}}}
 />;
}
