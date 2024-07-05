// BrowserEnforcementProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface BrowserVersions {
  chrome: number;
  firefox: number;
  safari: number;
  edge: number;
}

const defaultVersions: BrowserVersions = {
  chrome: 88,
  firefox: 85,
  safari: 14,
  edge: 88
};

const BrowserEnforcementContext = createContext<BrowserVersions>(defaultVersions);

interface BrowserEnforcementProviderProps {
  children: ReactNode;
  versions?: Partial<BrowserVersions>;
  errorComponent?: React.ComponentType<{ detectedBrowser: string; requiredVersion: number }>;
}

const detectBrowser = (): [string, number] => {
  const ua = navigator.userAgent;
  let browserName = "unknown";
  let fullVersion = "unknown";

  if (ua.indexOf("Chrome") > -1) {
    browserName = "chrome";
    fullVersion = ua.substring(ua.indexOf("Chrome") + 7);
  } else if (ua.indexOf("Firefox") > -1) {
    browserName = "firefox";
    fullVersion = ua.substring(ua.indexOf("Firefox") + 8);
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "safari";
    fullVersion = ua.substring(ua.indexOf("Safari") + 7);
  } else if (ua.indexOf("Edge") > -1) {
    browserName = "edge";
    fullVersion = ua.substring(ua.indexOf("Edge") + 4);
  }

  const majorVersion = parseInt(fullVersion, 10);
  return [browserName, isNaN(majorVersion) ? 0 : majorVersion];
};

// Cache the browser detection
const [cachedBrowser, cachedVersion] = detectBrowser();

const DefaultErrorComponent: React.FC<{ detectedBrowser: string; requiredVersion: number }> = 
  ({ detectedBrowser, requiredVersion }) => (
    <div style={{ padding: '20px', backgroundColor: '#ffcccc', border: '1px solid #ff0000' }}>
      <h2>Browser Version Not Supported</h2>
      <p>Your {detectedBrowser} version does not meet the minimum requirement (v{requiredVersion}).</p>
      <p>Please update your browser to use this application.</p>
    </div>
  );

export const BrowserEnforcementProvider = ({ 
  children, 
  versions, 
  errorComponent: ErrorComponent = DefaultErrorComponent 
}: BrowserEnforcementProviderProps) => {
  const configuredVersions = { ...defaultVersions, ...versions };
  
  const minVersion = configuredVersions[cachedBrowser as keyof BrowserVersions];
  const isBrowserSupported = !minVersion || cachedVersion >= minVersion;

  if (!isBrowserSupported) {
    return <ErrorComponent detectedBrowser={cachedBrowser} requiredVersion={minVersion} />;
  }

  return (
    <BrowserEnforcementContext.Provider value={configuredVersions}>
      {children}
    </BrowserEnforcementContext.Provider>
  );
};

export const useBrowserEnforcement = () => useContext(BrowserEnforcementContext);