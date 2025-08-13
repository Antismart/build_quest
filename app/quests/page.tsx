"use client";
import Link from 'next/link';
import { listQuests, isDeadlinePassed, deadlineUrgency, Quest } from '@/lib/mockStore';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { Card } from '@/app/components/Card';

export default function QuestsIndex(){
	const [quests, setQuests] = useState<Quest[] | null>(null);
	const [announce, setAnnounce] = useState('Loading quests…');
	const { pushToast } = useToast();
	const [mountKey, setMountKey] = useState(0);
	useEffect(()=>{
		const load = () => {
			const data = listQuests();
			setQuests(data);
			setAnnounce(`${data.length} quest${data.length!==1?'s':''} loaded`);
			pushToast(`${data.length} quest${data.length!==1?'s':''} loaded`, 'success');
		};
		const t = setTimeout(load, 200);
		return () => clearTimeout(t);
	},[pushToast]);

	// Restart ring animations when page becomes visible again
	useEffect(()=>{
		const handler = () => { if (document.visibilityState === 'visible') { setMountKey(k => k+1); } };
		document.addEventListener('visibilitychange', handler);
		return () => document.removeEventListener('visibilitychange', handler);
	},[]);
	return (
		<div className="w-full max-w-md mx-auto px-4 py-5 space-y-5">
			<header className="flex items-center justify-between gap-2">
				<h1 className="text-base font-semibold tracking-tight flex items-center gap-2">Quests
					<span className="relative group inline-flex">
						<button aria-label="Urgency legend" className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--app-accent-light)]/60 text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]">?
						</button>
						<span role="tooltip" className="pointer-events-none opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 w-52 text-[10px] p-2 rounded-md bg-[#1c2030] border border-white/10 shadow-lg">
							<strong className="font-semibold">Urgency:</strong><br />
							<span>OK &mdash; ample time</span><br />
							<span>&bull;&bull; &mdash; medium (&lt;6h)</span><br />
							<span>! &mdash; high (&lt;1.5h)</span><br />
							<span>X &mdash; closed</span>
						</span>
					</span>
				</h1>
				<Link href="/" className="text-[10px] text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]">Home</Link>
			</header>
			<div aria-live="polite" className="sr-only">{announce}</div>
			{quests === null && (
				<ul className="space-y-4" aria-label="Loading quests">
					{Array.from({length:3}).map((_,i)=>(
						<li key={i} className="card card-muted animate-pulse relative overflow-hidden">
							<div className="h-4 w-40 bg-white/10 rounded mb-3" />
							<div className="space-y-2 mb-4">
								<div className="h-3 w-full bg-white/7 rounded" />
								<div className="h-3 w-5/6 bg-white/6 rounded" />
								<div className="h-3 w-2/3 bg-white/5 rounded" />
							</div>
							<div className="flex justify-between items-center text-[10px]">
								<div className="h-3 w-14 bg-white/10 rounded" />
								<div className="h-6 w-14 bg-white/10 rounded" />
							</div>
						</li>
					))}
				</ul>
			)}
			{quests && (
				<ul key={mountKey} className="space-y-4">
					{quests.map((q, idx) => {
						const closed = isDeadlinePassed(q);
						const urgency = deadlineUrgency(q);
						const strokeDash = 2 * Math.PI * 11; // r=11
						const total = q.deadline - q.createdAt;
						const remaining = Math.max(0, q.deadline - Date.now());
						const ratio = Math.min(1, Math.max(0, remaining / total));
						const currentOffset = strokeDash * (1 - ratio);
						const ringColor = closed ? '#fb7185' : urgency === 'high' ? '#fb7185' : urgency === 'medium' ? '#fbbf24' : '#34d399';
						return (
							<li key={q.id} style={{ animationDelay: `${idx*40}ms` }} className="opacity-0 translate-y-2 will-change-transform animate-[fadeSlide_.55s_ease_forwards]">
								<Card className="card-hover card-muted flex flex-col gap-2" muted hover>
									<div className="flex justify-between items-start gap-3">
										<h2 className="text-sm font-medium leading-tight line-clamp-2 pr-2">{q.title}</h2>
										<span className="urgency-ring">
											<svg viewBox="0 0 26 26" aria-hidden="true" style={{ ['--start' as any]: currentOffset, ['--end' as any]: strokeDash, ['--duration' as any]: `${remaining/1000}s` }}>
												<circle cx="13" cy="13" r="11" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
												<circle className="ring-anim" cx="13" cy="13" r="11" stroke={ringColor} strokeWidth="2.4" strokeLinecap="round" fill="none" strokeDasharray={strokeDash} />
											</svg>
											<span className="urgency-badge" style={{ background: closed ? 'rgba(251,113,133,0.15)' : 'rgba(255,255,255,0.07)', color: ringColor }}>
												{closed ? 'X' : urgency === 'high' ? '!' : urgency === 'medium' ? '••' : 'OK'}
												<span className="sr-only">{closed ? 'Closed' : urgency === 'high' ? 'High urgency' : urgency === 'medium' ? 'Medium urgency' : 'Low urgency'}</span>
											</span>
										</span>
									</div>
									<div className="card-divider" />
									<p className="text-[11px] text-[var(--app-foreground-muted)] leading-relaxed line-clamp-4">{q.description}</p>
									<div className="flex justify-between items-center text-[10px] pt-1">
										<span className="font-medium text-[var(--app-accent)]">{q.prize}</span>
										<Link href={`/quests/${q.id}`} className="px-2 py-1 rounded-md bg-[var(--app-accent-light)]/60 hover:bg-[var(--app-accent-light)] text-[10px] font-medium transition">Open</Link>
									</div>
								</Card>
							</li>
						);
					})}
				</ul>
			)}
			{quests && quests.length === 0 && (
				<p className="text-[11px] text-[var(--app-foreground-muted)] italic">No quests yet.</p>
			)}
		</div>
	);
}
