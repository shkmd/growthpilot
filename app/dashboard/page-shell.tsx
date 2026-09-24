'use client';
import type {ReactNode} from 'react';
import {Sidebar} from './sidebar';
import '../suite.css';
import './dashboard.css';
import './pages.css';
export function PageShell({active,projectId,children}:{active:string,projectId?:string,children:ReactNode}){return <div className="suite db-workspace"><Sidebar active={active} onNavigate={id=>{const q=new URLSearchParams();if(projectId)q.set('projectId',projectId);if(id!=='analytics')q.set('section',id);window.location.assign((id==='analytics'?'/analytics':'/')+'?'+q.toString())}}/><div className="db-page-content">{children}</div></div>}
