"use client";

import React, { useState, useEffect } from "react";
import { BoloYoungConsole } from "../../components/BoloYoungConsole";
import { ORGANIZATIONS, OrganizationOption } from "../../components/LoginScreen";

export default function BoloYoungPopoutPage() {
  const [currentOrg, setCurrentOrg] = useState<OrganizationOption>(ORGANIZATIONS[0]);
  const [extractedAttire, setExtractedAttire] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedOrgId = sessionStorage.getItem("waypoint_c4i_org_id");
      if (savedOrgId) {
        const found = ORGANIZATIONS.find((o) => o.orgId === savedOrgId);
        if (found) setCurrentOrg(found);
      }
    } catch (e) {}
  }, []);

  return (
    <main className="console" style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <BoloYoungConsole
        currentOrg={currentOrg}
        isPopout={true}
        extractedAttire={extractedAttire}
        onAttireExtracted={setExtractedAttire}
      />
    </main>
  );
}
