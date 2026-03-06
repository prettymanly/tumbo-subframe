"use client";

import React, { useState } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { Button } from "@/components/subframe/ui/components/Button";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Badge } from "@/components/subframe/ui/components/Badge";
import { TextField } from "@/components/subframe/ui/components/TextField";
import { Tabs } from "@/components/subframe/ui/components/Tabs";
import { Switch } from "@/components/subframe/ui/components/Switch";
import { Alert } from "@/components/subframe/ui/components/Alert";
import { Accordion } from "@/components/subframe/ui/components/Accordion";
import { ListingsSearch } from "@/components/subframe/ui/components/ListingsSearch";
import { LargeBadge } from "@/components/subframe/ui/components/LargeBadge";
import { FilterBadge } from "@/components/subframe/ui/components/FilterBadge";
import { Tags } from "@/components/subframe/ui/components/Tags";
import { Avatar } from "@/components/subframe/ui/components/Avatar";
import { FeatherSearch, FeatherFilter, FeatherEye, FeatherCode, FeatherSettings, FeatherPalette, FeatherBox, FeatherCheck } from "@subframe/core";
import { themeTokens } from "@/theme/tokens";

// Component usage tracking data
const componentUsage = {
  "Button": ["Home page hero", "Collections page filters", "Class detail actions", "Navigation"],
  "IconButton": ["Navigation bar", "Class cards bookmark", "Collection cards bookmark", "Action buttons"],
  "Badge": ["Class categories", "Collection status", "Status indicators", "Class detail tags"],
  "TextField": ["Home page search", "Collections search", "Forms", "Filters"],
  "ListingsSearch": ["Classes page search", "Browse classes"],
  "Accordion": ["FAQ section", "Class detail expandable content"],
  "Avatar": ["User profiles", "Navigation", "Class reviews"],
  "Alert": ["Error states", "Notifications"],
  "ModernPageLayout": ["All pages", "Classes", "Collections", "Class detail"],
  "LargeBadge": ["Class detail features", "Collection detail categories"],
  "FilterBadge": ["Class detail amenities", "Filter options"],
  "Tags": ["Collections page tags", "Class detail tags"],
  "Switch": ["Settings", "Filter toggles"],
  "Progress": ["Loading states", "Form progress"],
  "Checkbox": ["Forms", "Multi-select"],
  "RadioGroup": ["Forms", "Single select"],
  "Select": ["Dropdowns", "Form inputs"],
  "TextArea": ["Long form text", "Comments"],
  "Calendar": ["Date pickers", "Scheduling"],
  "Table": ["Data display", "Lists"],
  "Stepper": ["Multi-step forms", "Progress"]
};

// Component categories
const componentCategories = {
  "Foundation": ["Colors", "Typography", "Spacing", "Shadows"],
  "Layout": ["ModernPageLayout", "Grid", "Container"],
  "Navigation": ["TopbarWithTabs", "BoldNavbar", "SidebarWithSections", "Breadcrumbs"],
  "Actions": ["Button", "IconButton", "LinkButton"],
  "Inputs": ["TextField", "TextFieldUnstyled", "TextArea", "Checkbox", "RadioGroup", "Select", "Switch", "Slider", "Calendar", "ListingsSearch"],
  "Data Display": ["Table", "Avatar", "Badge", "LargeBadge", "FilterBadge", "Tags", "Progress", "Stepper", "AreaChart", "BarChart", "LineChart", "PieChart"],
  "Feedback": ["Alert", "Toast", "Loader", "SkeletonCircle", "SkeletonText"],
  "Overlay": ["Dialog", "FullscreenDialog", "Drawer", "DropdownMenu", "ContextMenu", "Tooltip"],
  "Content": ["Accordion", "Tabs", "ImageGallery", "TreeView"],
  "Chat": ["ChatHeader", "ChatList", "ChatChannelMessage", "ChatReceived", "ChatSent", "AiChatToolbar"]
};

interface ComponentShowcaseProps {
  name: string;
  category: string;
  component: React.ReactNode;
  props?: Record<string, unknown>;
  states?: string[];
  usage: string[];
  tokens: string[];
}

const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({ 
  name, 
  category, 
  component, 
  props = {}, 
  states = [], 
  usage, 
  tokens 
}) => {
  const [currentState, setCurrentState] = useState("default");
  const [showCode, setShowCode] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <div className="border border-solid border-neutral-200 rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-solid border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-3">
          <h3 className="text-heading-3 font-heading-3 text-default-font">{name}</h3>
          <Badge variant="secondary">{category}</Badge>
          {usage.length > 0 && (
            <Badge variant="success" className="text-xs">
              Used in {usage.length} places
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IconButton 
            size="small" 
            icon={<FeatherEye />} 
            onClick={() => setShowSpecs(!showSpecs)}
            variant={showSpecs ? "brand-primary" : "neutral-tertiary"}
          />
          <IconButton 
            size="small" 
            icon={<FeatherCode />} 
            onClick={() => setShowCode(!showCode)}
            variant={showCode ? "brand-primary" : "neutral-tertiary"}
          />
        </div>
      </div>

      <div className="flex">
        {/* Component Preview */}
        <div className="flex-1 p-6">
          {/* State Controls */}
          {states.length > 0 && (
            <div className="mb-4 flex gap-2">
              <span className="text-caption font-caption text-subtext-color">State:</span>
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => setCurrentState(state)}
                  className={`px-2 py-1 rounded text-xs ${
                    currentState === state 
                      ? "bg-brand-100 text-brand-800" 
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          )}
          
          {/* Live Component */}
          <div className="flex items-center justify-center min-h-[120px] bg-neutral-50 rounded border border-dashed border-neutral-300">
            {component}
          </div>
        </div>

        {/* Properties Panel (Figma-style) */}
        {showSpecs && (
          <div className="w-80 border-l border-solid border-neutral-200 bg-neutral-50 p-4">
            <h4 className="text-body-bold font-body-bold text-default-font mb-3">Properties</h4>
            
            {/* Usage */}
            <div className="mb-4">
              <div className="text-caption-bold font-caption-bold text-default-font mb-2">Usage</div>
              <div className="space-y-1">
                {usage.map((place, index) => (
                  <div key={index} className="text-caption font-caption text-subtext-color flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                    {place}
                  </div>
                ))}
              </div>
            </div>

            {/* Design Tokens */}
            <div className="mb-4">
              <div className="text-caption-bold font-caption-bold text-default-font mb-2">Design Tokens</div>
              <div className="space-y-1">
                {tokens.map((token, index) => (
                  <div key={index} className="text-caption font-caption text-neutral-700 bg-white px-2 py-1 rounded border">
                    {token}
                  </div>
                ))}
              </div>
            </div>

            {/* Props */}
            {Object.keys(props).length > 0 && (
              <div className="mb-4">
                <div className="text-caption-bold font-caption-bold text-default-font mb-2">Props</div>
                <div className="space-y-2">
                  {Object.entries(props).map(([key, value]) => (
                    <div key={key} className="text-caption font-caption">
                      <span className="text-neutral-700">{key}:</span>
                      <span className="text-brand-700 ml-1">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Preview */}
      {showCode && (
        <div className="border-t border-solid border-neutral-200 bg-neutral-900 p-4">
          <pre className="text-sm text-green-400 overflow-x-auto">
            <code>{`<${name}${Object.entries(props).map(([key, value]) => 
              ` ${key}="${value}"`
            ).join('')} />`}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default function DesignSystemPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showInUseOnly, setShowInUseOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all available components
  const allComponents = [
    "Button", "IconButton", "Badge", "TextField", "ListingsSearch", "Accordion", 
    "Avatar", "Alert", "LargeBadge", "FilterBadge", "Tags", "Switch", "Progress", 
    "Checkbox", "RadioGroup", "Select", "TextArea", "Calendar", "Table", "Stepper"
  ];

  // Filter components based on current filters
  const getFilteredComponents = () => {
    let filtered = allComponents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(component => 
        component.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      const categoryComponents = componentCategories[selectedCategory] || [];
      filtered = filtered.filter(component => 
        categoryComponents.includes(component)
      );
    }

    // Filter by usage (show only components in use)
    if (showInUseOnly) {
      filtered = filtered.filter(component => 
        componentUsage[component] && componentUsage[component].length > 0
      );
    }

    return filtered;
  };

  const filteredComponents = getFilteredComponents();

  // Helper functions to render components dynamically
  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "Button":
        return (
          <div className="flex gap-3">
            <Button variant="brand-primary">Primary</Button>
            <Button variant="brand-secondary">Secondary</Button>
            <Button variant="neutral-primary">Neutral</Button>
            <Button variant="destructive-primary">Destructive</Button>
          </div>
        );
      case "IconButton":
        return (
          <div className="flex gap-3">
            <IconButton icon={<FeatherSettings />} variant="brand-primary" />
            <IconButton icon={<FeatherFilter />} variant="neutral-secondary" />
            <IconButton icon={<FeatherSearch />} variant="neutral-tertiary" />
          </div>
        );
      case "Badge":
        return (
          <div className="flex gap-3">
            <Badge variant="brand">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        );
      case "TextField":
        return (
          <div className="w-full max-w-sm">
            <TextField
              label="Email address"
              placeholder="Enter your email"
              icon={<FeatherSearch />}
            >
              <TextField.Input />
            </TextField>
          </div>
        );
      case "ListingsSearch":
        return (
          <div className="w-full max-w-md">
            <ListingsSearch />
          </div>
        );
      case "Alert":
        return (
          <div className="w-full max-w-lg">
            <Alert
              variant="success"
              title="Success"
              description="Your changes have been saved successfully."
              icon={<FeatherCheck />}
            />
          </div>
        );
      case "Switch":
        return (
          <div className="flex items-center gap-4">
            <Switch checked={false} />
            <Switch checked={true} />
            <Switch checked={false} disabled />
          </div>
        );
      case "Avatar":
        return (
          <div className="flex items-center gap-3">
            <Avatar>A</Avatar>
            <Avatar size="large">B</Avatar>
            <Avatar size="small">C</Avatar>
          </div>
        );
      case "LargeBadge":
        return (
          <div className="flex gap-3">
            <LargeBadge>Featured</LargeBadge>
            <LargeBadge>Popular</LargeBadge>
          </div>
        );
      case "FilterBadge":
        return (
          <div className="flex gap-3">
            <FilterBadge label="Art" />
            <FilterBadge label="STEM" count="12" />
            <FilterBadge label="Music" selected />
          </div>
        );
      case "Tags":
        return (
          <div className="flex gap-2">
            <Tags variant="brand">Creative</Tags>
            <Tags variant="success">Educational</Tags>
            <Tags variant="warning">Fun</Tags>
          </div>
        );
      case "Accordion":
        return (
          <div className="w-full max-w-lg">
            <Accordion trigger={<div className="p-3">What is Tümbo?</div>}>
              <div className="p-3">
                Tümbo is an enrichment class directory for busy parents.
              </div>
            </Accordion>
          </div>
        );
      default:
        return <div className="p-4 text-center text-subtext-color">Component preview not available</div>;
    }
  };

  const getComponentProps = (componentName: string) => {
    switch (componentName) {
      case "Button":
        return { variant: "brand-primary", size: "medium" };
      case "IconButton":
        return { variant: "brand-primary", size: "medium" };
      case "Badge":
        return { variant: "brand" };
      case "TextField":
        return { placeholder: "Enter text...", variant: "default" };
      case "Alert":
        return { variant: "success", title: "Success" };
      case "Switch":
        return { checked: false };
      default:
        return {};
    }
  };

  const getComponentStates = (componentName: string) => {
    switch (componentName) {
      case "Button":
      case "IconButton":
        return ["default", "hover", "active", "disabled"];
      case "TextField":
        return ["default", "focused", "error", "disabled"];
      case "Switch":
        return ["unchecked", "checked", "disabled"];
      case "Alert":
        return ["success", "error", "warning", "info"];
      default:
        return ["default"];
    }
  };

  const getComponentTokens = (componentName: string) => {
    switch (componentName) {
      case "Button":
        return ["brand-primary", "neutral-100", "text-heading-3", "shadow-sm"];
      case "IconButton":
        return ["brand-primary", "neutral-700", "shadow-sm"];
      case "Badge":
        return ["brand-100", "brand-800", "text-caption", "radius-sm"];
      case "TextField":
        return ["neutral-100", "neutral-border", "text-body", "radius-md"];
      case "Alert":
        return ["success-50", "success-600", "text-body", "radius-md"];
      case "Switch":
        return ["brand-primary", "neutral-300", "radius-full"];
      default:
        return ["neutral-100", "text-body"];
    }
  };

  // Foundation tokens section
  const FoundationSection = () => (
    <div className="space-y-8">
      {/* Colors */}
      <div>
        <h3 className="text-heading-2 font-heading-2 text-default-font mb-4">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Colors */}
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-3">Brand</h4>
            <div className="space-y-2">
              {Object.entries(themeTokens.colors.brand).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border border-neutral-300"
                    style={{ backgroundColor: value }}
                  ></div>
                  <div>
                    <div className="text-caption-bold font-caption-bold text-default-font">brand-{key}</div>
                    <div className="text-caption font-caption text-subtext-color">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Colors */}
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-3">Neutral</h4>
            <div className="space-y-2">
              {Object.entries(themeTokens.colors.neutral).slice(0, 8).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border border-neutral-300"
                    style={{ backgroundColor: value }}
                  ></div>
                  <div>
                    <div className="text-caption-bold font-caption-bold text-default-font">neutral-{key}</div>
                    <div className="text-caption font-caption text-subtext-color">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-3">Semantic</h4>
            <div className="space-y-2">
              {Object.entries(themeTokens.colors.flat).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border border-neutral-300"
                    style={{ backgroundColor: value }}
                  ></div>
                  <div>
                    <div className="text-caption-bold font-caption-bold text-default-font">{key}</div>
                    <div className="text-caption font-caption text-subtext-color">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-heading-2 font-heading-2 text-default-font mb-4">Typography</h3>
        <div className="space-y-4">
          {Object.entries(themeTokens.fontFamily).map(([key, value]) => (
            <div key={key} className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption-bold font-caption-bold text-default-font">{key}</span>
                <span className="text-caption font-caption text-subtext-color">{value}</span>
              </div>
              <div 
                className={`text-${key} font-${key} text-default-font`}
                style={{ fontFamily: value }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className="text-heading-2 font-heading-2 text-default-font mb-4">Spacing & Radius</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-3">Border Radius</h4>
            <div className="space-y-3">
              {Object.entries(themeTokens.radii).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 bg-brand-100 border-2 border-brand-300"
                    style={{ borderRadius: value }}
                  ></div>
                  <div>
                    <div className="text-caption-bold font-caption-bold text-default-font">{key}</div>
                    <div className="text-caption font-caption text-subtext-color">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-body-bold font-body-bold text-default-font mb-3">Shadows</h4>
            <div className="space-y-3">
              {Object.entries(themeTokens.shadows).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 bg-white border border-neutral-200"
                    style={{ boxShadow: value }}
                  ></div>
                  <div>
                    <div className="text-caption-bold font-caption-bold text-default-font">{key}</div>
                    <div className="text-caption font-caption text-subtext-color text-xs">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8 px-6 py-8">
        {/* Header */}
        <div className="w-full max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-heading-1 font-heading-1 text-default-font mb-2">
                Tümbo Design System
              </h1>
              <p className="text-body font-body text-subtext-color">
                A comprehensive library of components, tokens, and guidelines for building Tümbo experiences.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">
                {Object.keys(componentCategories).reduce((acc, cat) => acc + componentCategories[cat].length, 0)} Components
              </Badge>
              <Badge variant="brand-secondary">
                {Object.keys(themeTokens.colors.flat).length + Object.keys(themeTokens.colors.brand).length} Tokens
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-8">
            <TextField
              icon={<FeatherSearch />}
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            >
              <TextField.Input />
            </TextField>

            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-md text-body font-body"
            >
              <option value="All">All Categories</option>
              {Object.keys(componentCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Switch 
                checked={showInUseOnly} 
                onCheckedChange={setShowInUseOnly}
              />
              <span className="text-caption font-caption text-default-font">
                Show only components in use
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="flex gap-4 border-b border-neutral-200">
              <button
                onClick={() => setSelectedCategory("Foundation")}
                className={`px-4 py-2 border-b-2 flex items-center gap-2 ${
                  selectedCategory === "Foundation" 
                    ? "border-brand-primary text-brand-700" 
                    : "border-transparent text-neutral-600 hover:text-neutral-800"
                }`}
              >
                <FeatherPalette className="w-4 h-4" />
                Foundation
              </button>
              <button
                onClick={() => setSelectedCategory("Components")}
                className={`px-4 py-2 border-b-2 flex items-center gap-2 ${
                  selectedCategory === "Foundation" 
                    ? "border-transparent text-neutral-600 hover:text-neutral-800" 
                    : "border-brand-primary text-brand-700"
                }`}
              >
                <FeatherBox className="w-4 h-4" />
                Components
              </button>
            </div>
          </div>

          {selectedCategory === "Foundation" && (
            <div className="mt-6">
              <FoundationSection />
            </div>
          )}

          {selectedCategory !== "Foundation" && (
            <div className="mt-6">
              <div className="space-y-8">
                {/* Component Count */}
                <div className="flex items-center justify-between">
                  <span className="text-body font-body text-subtext-color">
                    Showing {filteredComponents.length} of {allComponents.length} components
                  </span>
                  {filteredComponents.length === 0 && (
                    <span className="text-body font-body text-subtext-color">
                      No components match your filters. Try adjusting your search or category.
                    </span>
                  )}
                </div>

                {/* Dynamic Component Showcases */}
                <div className="space-y-6">
                  {filteredComponents.map((componentName) => {
                    const category = Object.keys(componentCategories).find(cat => 
                      componentCategories[cat].includes(componentName)
                    ) || "Other";
                    
                    return (
                      <ComponentShowcase
                        key={componentName}
                        name={componentName}
                        category={category}
                        component={renderComponent(componentName)}
                        props={getComponentProps(componentName)}
                        states={getComponentStates(componentName)}
                        usage={componentUsage[componentName] || []}
                        tokens={getComponentTokens(componentName)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModernPageLayout>
  );
}
