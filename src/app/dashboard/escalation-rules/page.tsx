'use client';
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from 'react';
import { Phone, ArrowRight, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { authedBackendFetch } from '@/lib/authed-backend-fetch';

const fetcher = (url: string) => authedBackendFetch<any>(url);

interface TransferSettings {
    transfer_number: string | null;
    last_updated: string | null;
}

interface TransferHistoryItem {
    id: string;
    created_at: string;
    from_number: string;
    status: string;
    outcome: string | null;
}

const E164_REGEX = /^\+\d{7,15}$/;

function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function CallTransferPage() {
    const { user } = useAuth();
    const [phoneInput, setPhoneInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: settings, isLoading, mutate } = useSWR<TransferSettings>(
        user ? '/api/transfer-settings' : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    const { data: history } = useSWR<TransferHistoryItem[]>(
        user ? '/api/transfer-settings/history' : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    // Pre-fill input from saved settings (only once on load)
    useEffect(() => {
        if (settings?.transfer_number && !phoneInput) {
            setPhoneInput(settings.transfer_number);
        }
    }, [settings?.transfer_number]);

    const handleSave = useCallback(async () => {
        const val = phoneInput.trim();
        if (!val) {
            setErrorMsg('Please enter a phone number');
            return;
        }
        if (!E164_REGEX.test(val)) {
            setErrorMsg('Use E.164 format — start with + followed by your country code (e.g. +2348012345678)');
            return;
        }
        setErrorMsg('');
        setSaving(true);
        try {
            await authedBackendFetch('/api/transfer-settings', {
                method: 'PUT',
                body: JSON.stringify({ transfer_number: val }),
            });
            setSuccessMsg('Saved');
            mutate();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg(err?.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [phoneInput, mutate]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-[#102A33] tracking-tight">Call Transfer</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        When a caller asks to speak to a person, or your AI identifies a serious buyer,
                        it will transfer the call directly to your phone.
                    </p>
                </div>

                {/* Settings card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#102A33]">
                        <Phone size={15} className="text-[#37A195]" />
                        Transfer calls to
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <input
                                type="tel"
                                value={phoneInput}
                                onChange={e => { setPhoneInput(e.target.value); setErrorMsg(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                placeholder="+2348012345678"
                                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[#102A33] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#37A195]/40 focus:border-[#37A195] transition"
                                disabled={saving || isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            International format — start with + then your country code
                        </p>
                        {errorMsg && (
                            <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving || isLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#37A195] px-4 py-2 text-sm font-medium text-white hover:bg-[#2e8a7f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? (
                                <><Loader2 size={13} className="animate-spin" /> Saving…</>
                            ) : (
                                <><ArrowRight size={13} /> Save</>
                            )}
                        </button>

                        {successMsg && (
                            <span className="flex items-center gap-1 text-sm text-[#37A195]">
                                <CheckCircle2 size={13} />
                                {successMsg}
                            </span>
                        )}

                        {settings?.last_updated && !successMsg && (
                            <span className="text-xs text-gray-400">
                                Last saved {formatRelativeTime(settings.last_updated)}
                            </span>
                        )}
                    </div>
                </div>

                {/* How it works */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">How it works</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex gap-2">
                            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#37A195]/10 text-[#37A195] flex items-center justify-center text-[10px] font-bold">1</span>
                            Caller asks your AI: <em>"Can I speak to someone?"</em>
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#37A195]/10 text-[#37A195] flex items-center justify-center text-[10px] font-bold">2</span>
                            AI says: <em>"Of course, connecting you now…"</em>
                        </li>
                        <li className="flex gap-2">
                            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#37A195]/10 text-[#37A195] flex items-center justify-center text-[10px] font-bold">3</span>
                            Your phone rings with the warm lead already on the line.
                        </li>
                    </ul>
                </div>

                {/* Transfer history */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-[#102A33]">Recent transfers</span>
                    </div>

                    {!history || history.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-gray-400">
                            No transfers yet. Transfers appear here once your AI starts routing calls.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {history.map(item => (
                                <li key={item.id} className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <Phone size={13} className="text-[#37A195] shrink-0" />
                                        <div>
                                            <p className="text-sm text-[#102A33] font-medium">{item.from_number}</p>
                                            <p className="text-xs text-gray-400">{formatTime(item.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs rounded-full px-2 py-0.5 bg-[#37A195]/10 text-[#37A195] font-medium capitalize">
                                        {item.outcome === 'assistant-forwarded-call' ? 'Transferred' : item.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}
