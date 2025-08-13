// Lightweight client-side mock storage for quests & submissions.
// Stored in localStorage; safe fallback to in‑memory if unavailable.
export type Quest = {
	id: number;
	title: string;
	description: string;
	prize: string;         // display only
	deadline: number;      // ms
	creator?: string;      // wallet address (optional)
	createdAt: number;
	winners?: number[];    // submission ids
};

export type Submission = {
	id: number;
	link: string;
	notes?: string;
	submitter?: string;
	createdAt: number;
	winner?: boolean;
};

const QUEST_KEY = 'bq:quests';
const SUB_PREFIX = 'bq:subs:';

function ls() { try { return window.localStorage; } catch { return undefined; } }
function read<T>(k:string, fb:T):T { const store=ls(); if(!store) return fb; try { const raw=store.getItem(k); return raw? JSON.parse(raw): fb; } catch { return fb; } }
function write<T>(k:string, v:T){ const store=ls(); if(!store) return; store.setItem(k, JSON.stringify(v)); }

// Seed a couple quests for first-time UX
function ensureSeed() {
	const existing = read<Quest[]>(QUEST_KEY, []);
	if (existing.length === 0) {
		const now = Date.now();
		const seed: Quest[] = [
			{ id:1, title: 'Starter Integration Quest', description: 'Add wallet connect & show address. Submit repo link.', prize: '0.05 ETH', deadline: now + 1000*60*60*6, createdAt: now },
			{ id:2, title: 'UI Polish Sprint', description: 'Improve visual polish: spacing, semantic colors, micro‑interactions.', prize: '0.08 ETH', deadline: now + 1000*60*60*18, createdAt: now },
		];
		write(QUEST_KEY, seed);
	}
}

export function listQuests(): Quest[] { ensureSeed(); return read<Quest[]>(QUEST_KEY, []).sort((a,b)=>b.createdAt - a.createdAt); }
export function getQuest(id:number): Quest | undefined { return listQuests().find(q => q.id === id); }
export function createQuest(data: Omit<Quest,'id'|'createdAt'>): Quest { const qs=listQuests(); const id = qs.length ? Math.max(...qs.map(q=>q.id))+1 : 1; const q:Quest={ id, createdAt: Date.now(), ...data }; write(QUEST_KEY, [...qs, q]); return q; }

export function listSubmissions(questId:number): Submission[] { return read<Submission[]>(SUB_PREFIX+questId, []).sort((a,b)=>a.createdAt-b.createdAt); }
export function addSubmission(questId:number, data: Omit<Submission,'id'|'createdAt'|'winner'>): Submission { const subs = listSubmissions(questId); const id = subs.length ? subs[subs.length-1].id + 1 : 0; const s:Submission = { id, createdAt: Date.now(), ...data }; write(SUB_PREFIX+questId, [...subs, s]); return s; }
export function selectWinners(questId:number, winnerIds:number[]) { const qs=listQuests(); const qi = qs.findIndex(q=>q.id===questId); if(qi===-1) return; qs[qi].winners = winnerIds; write(QUEST_KEY, qs); const subs = listSubmissions(questId).map(s => ({...s, winner: winnerIds.includes(s.id)})); write(SUB_PREFIX+questId, subs); }

export function isDeadlinePassed(q:Quest){ return Date.now() > q.deadline; }

// Returns urgency level based on remaining time
export function deadlineUrgency(q: Quest): 'low' | 'medium' | 'high' | 'expired' {
	const now = Date.now();
	if (now >= q.deadline) return 'expired';
	const remaining = q.deadline - now; // ms
	const hours = remaining / 3600000;
	if (hours <= 1.5) return 'high';
	if (hours <= 6) return 'medium';
	return 'low';
}

