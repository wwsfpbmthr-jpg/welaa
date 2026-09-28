'use client';
import {createContext,useContext} from 'react';
import {Space,AppData} from './data';
export const AppContext=createContext<{data:AppData;all:Space[];previewMode:boolean;ready:boolean;authReady:boolean;busy:boolean;act:(x:any)=>Promise<any>;refresh:()=>Promise<void>;auth:(register?:boolean)=>void;go:(p:string)=>void;favorite:(id:string)=>void;signOut:()=>Promise<void>}>(null!);
export const useApp=()=>useContext(AppContext);
