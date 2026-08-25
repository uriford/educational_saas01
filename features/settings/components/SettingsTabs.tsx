"use client";

import { useState } from "react";

import {
  Building2,
  User,
  Globe,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

import OrganizationSettingsForm from "./OrganizationSettingsForm";
import PreferencesSettingsForm from "./PreferencesSettingsForm";
import ProfileSettingsForm from "./ProfileSettingsForm";
import BranchSettings from "./BranchSettings";
import BranchManagement from "@/features/branches/components/BranchManagement";
import AccountSecurity from "./AccountSecurity";

import type {
  OrganizationSettingsFormValues,
  ProfileSettingsFormValues,
} from "../types";

type Props = {
  organization: OrganizationSettingsFormValues;
  profile: ProfileSettingsFormValues;
  branch: {
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isHeadquarters: boolean;
    status: string;
  } | null;
  branchSecurity: {
    passwordConfigured: boolean;
    isHeadquartersAdmin: boolean;
  };
  allBranches: {
    id: string;
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isHeadquarters: boolean;
    status: string;
    createdAt: Date;
  }[];
  security: {
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
    lastLoginAt: Date | null;
  };
};

const tabs = [
  {
    id: "organization",
    label: "Organization",
    icon: Building2,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: Globe,
  },
  {
    id: "branch",
    label: "Branch",
    icon: GitBranch,
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
  },
];

export default function SettingsTabs({
  organization,
  profile,
  branch,
  branchSecurity,
  allBranches,
  security,
}: Props) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") {
      return "organization";
    }

    return (
      window.sessionStorage.getItem("settings-active-tab") ??
      "organization"
    );
  });

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    window.sessionStorage.setItem(
      "settings-active-tab",
      tabId,
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="flex gap-1 overflow-x-auto lg:flex-col">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-muted"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {activeTab === "organization" && (
          <OrganizationSettingsForm
            initialData={organization}
          />
        )}

        {activeTab === "profile" && (
          <ProfileSettingsForm
            initialData={profile}
          />
        )}

        {activeTab === "preferences" && (
          <PreferencesSettingsForm
            initialData={{
              timezone: organization.timezone,
              language: organization.language,
              currency: organization.currency,
              attendanceEnabled: organization.attendanceEnabled,
            }}
          />
        )}

        {activeTab === "branch" &&
          (security.role === "ORGANIZATION_ADMIN" ? (
            <BranchManagement
              branch={branch}
              allBranches={allBranches}
              isHeadquartersAdmin={
                branchSecurity.isHeadquartersAdmin
              }
              passwordConfigured={
                branchSecurity.passwordConfigured
              }
            />
          ) : (
            <BranchSettings branch={branch} />
          ))}

        {activeTab === "security" && (
          <AccountSecurity user={security} />
        )}
      </div>
    </div>
  );
}