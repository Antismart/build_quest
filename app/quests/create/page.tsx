"use client";
import { useState } from 'react';
import { createQuest } from '@/lib/mockStore';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function CreateQuest(){
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [prize, setPrize] = useState('0.05 ETH');
	const [durationHrs, setDurationHrs] = useState(12);
	const router = useRouter();
	const { address } = useAccount();

	function handleSubmit(e:React.FormEvent){
		e.preventDefault();
		const deadline = Date.now() + durationHrs * 60 * 60 * 1000;
		const q = createQuest({ title, description, prize, deadline, creator: address });
		router.push(`/quests/${q.id}`);
	}

	return (
		<div className="w-full max-w-md mx-auto px-4 py-5 space-y-5">
			<header className="flex items-center justify-between">
				<h1 className="text-base font-semibold">New Quest</h1>
				<button onClick={()=>router.back()} className="text-[10px] text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]">Back</button>
			</header>
			<form onSubmit={handleSubmit} className="space-y-5 card">
				<div className="space-y-2">
					<label className="block text-[10px] uppercase tracking-wide text-[var(--app-foreground-muted)]">Title</label>
					<input value={title} onChange={e=>setTitle(e.target.value)} required className="w-full px-3 py-2 rounded-md bg-[#1c2030] text-xs outline-none focus:ring-1 ring-[var(--app-accent)] border border-[#293044]" placeholder="Concise quest title" />
				</div>
				<div className="space-y-2">
					<label className="block text-[10px] uppercase tracking-wide text-[var(--app-foreground-muted)]">Description</label>
					<textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={5} className="w-full px-3 py-2 rounded-md bg-[#1c2030] text-xs resize-none outline-none focus:ring-1 ring-[var(--app-accent)] border border-[#293044]" placeholder="What do builders need to deliver?" />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="block text-[10px] uppercase tracking-wide text-[var(--app-foreground-muted)]">Prize</label>
						<input value={prize} onChange={e=>setPrize(e.target.value)} className="w-full px-3 py-2 rounded-md bg-[#1c2030] text-xs outline-none focus:ring-1 ring-[var(--app-accent)] border border-[#293044]" />
					</div>
					<div className="space-y-2">
						<label className="block text-[10px] uppercase tracking-wide text-[var(--app-foreground-muted)]">Duration (hrs)</label>
						<input type="number" min={1} max={168} value={durationHrs} onChange={e=>setDurationHrs(Number(e.target.value))} className="w-full px-3 py-2 rounded-md bg-[#1c2030] text-xs outline-none focus:ring-1 ring-[var(--app-accent)] border border-[#293044]" />
					</div>
				</div>
				<div className="flex justify-end">
					<button type="submit" className="px-4 py-2 rounded-md text-xs font-medium bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] active:bg-[var(--app-accent-active)] text-white">Create</button>
				</div>
			</form>
		</div>
	);
}
