import { createContext, ReactNode, useContext, useState } from "react";

interface TabsContextType {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tab components must be used within a <Tabs /> provider");
  }

  return context;
}

export interface TabProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export interface TabListProps {
  defaultValue: string;
  children: ReactNode;
}
export interface TabPanelsProps {
  children: ReactNode;
}

export interface PanelProps {
  value: string;
  children: ReactNode;
}

export function TabList({ defaultValue, children }: TabListProps) {
  const [selectedTab, setSelectedTab] = useState<string>(defaultValue);
  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function Tab({ value, disabled, className, children }: TabProps) {
  const { selectedTab, setSelectedTab } = useTabs();
  const isSelected = selectedTab === value;
  return (
    <button
      type="button"
      disabled={disabled}
      role="tab"
      aria-selected={isSelected}
      className={`${className ?? ""} ${isSelected ? "border-primary-500 text-primary-600" : ""}`}
      onClick={() => setSelectedTab(value)}
    >
      {children || value}
    </button>
  );
}

export function TabPanels({ children }: TabPanelsProps) {
  return <div>{children}</div>;
}

export function Panel({ value, children }: PanelProps) {
  const { selectedTab } = useTabs();

  if (selectedTab != value) return null;
  return <div>{children}</div>;
}
