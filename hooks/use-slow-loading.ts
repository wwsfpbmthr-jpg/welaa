'use client';
import {useEffect,useState} from 'react';

// Delay only the indicator. The operation itself never waits for this timer.
export function useSlowLoading(pending:boolean,delay=300){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    if(!pending)return;
    const timer=window.setTimeout(()=>setVisible(true),delay);
    return ()=>{window.clearTimeout(timer);setVisible(false)};
  },[pending,delay]);
  return pending&&visible;
}
