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

export interface TabContainerProps {
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

export function TabContainer({ defaultValue, children }: TabContainerProps) {
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
      className={`${className ?? ""} ${isSelected ? "border-b-2  px-8 py-4 text-sm font-semibold text-gray-800 transition hover:text-gray-900" : "border-b-2 border-transparent px-8 py-4 text-sm font-semibold text-gray-400 transition hover:text-gray-900"}`}
      onClick={() => setSelectedTab(value)}
    >
      {children || value}
    </button>
  );
}

export function TabPanels({ children }: TabPanelsProps) {
  return <div className="py-8 px-4">{children}</div>;
}

export function Panel({ value, children }: PanelProps) {
  const { selectedTab } = useTabs();

  if (selectedTab != value) return null;
  return <>{children}</>;
}
