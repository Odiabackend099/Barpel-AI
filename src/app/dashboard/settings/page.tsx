'use client';
export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// LeftSidebar removed (now in layout)
import { Settings, Users, Building2 } from 'lucide-react';
import { TeamMembersList } from './components/TeamMembersList';
import { OrgSettings } from './components/OrgSettings';


export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'organization' | 'team'>('organization');


  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-surgical-600" />
          <h1 className="text-3xl font-bold text-barpel-slate">Settings</h1>
        </div>
        <p className="text-barpel-slate/60">Configure your account, team, and integrations</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-surgical-200">
        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'organization'
            ? 'border-barpel-teal text-surgical-600'
            : 'border-transparent text-barpel-slate/60 hover:text-barpel-slate'
            }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organization
          </div>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'team'
            ? 'border-barpel-teal text-surgical-600'
            : 'border-transparent text-barpel-slate/60 hover:text-barpel-slate'
            }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </div>
        </button>
      </div>

      {activeTab === 'organization' ? (
        <OrgSettings />
      ) : (
        <TeamMembersList />
      )}
    </div>


  );
}
