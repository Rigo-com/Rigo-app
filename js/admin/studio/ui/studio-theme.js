// =====================================
// RIGO AI
// STUDIO THEME
// DESIGN SYSTEM V2
// =====================================

const StudioTheme =
Object.freeze({



  // ===================================
  // COLORS
  // ===================================

  colors:{

    background:
    "#020817",

    backgroundSoft:
    "#050d19",

    surface:
    "#0a1525",

    surfaceRaised:
    "#0d1a2d",

    surfaceHover:
    "#112139",

    sidebar:
    "#07111f",

    workspace:
    "#020817",

    border:
    "rgba(94,126,163,.20)",

    borderStrong:
    "rgba(112,148,190,.28)",

    primary:
    "#00e69d",

    primarySoft:
    "rgba(0,230,157,.10)",

    primaryGlow:
    "rgba(0,230,157,.30)",

    blue:
    "#009cff",

    yellow:
    "#ffd000",

    purple:
    "#913cff",

    pink:
    "#ff2382",

    red:
    "#ff4166",

    cyan:
    "#00c8ff",

    lime:
    "#8bdc3b",

    text:
    "#f8fafc",

    textSecondary:
    "#d2d9e4",

    muted:
    "#9ba9bb",

    subtle:
    "#66778e"

  },



  // ===================================
  // SPACING
  // ===================================

  spacing:{

    xxs:
    2,

    xs:
    4,

    sm:
    8,

    md:
    12,

    lg:
    16,

    xl:
    20,

    xxl:
    24,

    xxxl:
    28

  },



  // ===================================
  // RADIUS
  // ===================================

  radius:{

    xs:
    6,

    sm:
    8,

    md:
    10,

    lg:
    12,

    xl:
    14,

    panel:
    13

  },



  // ===================================
  // SHADOWS
  // ===================================

  shadow:{

    small:
    "0 4px 14px rgba(0,0,0,.16)",

    medium:
    "0 10px 28px rgba(0,0,0,.22)",

    large:
    "0 20px 54px rgba(0,0,0,.34)",

    glow:
    "0 0 18px rgba(0,230,157,.11)",

    inset:
    "inset 0 1px 0 rgba(255,255,255,.025)"

  },



  // ===================================
  // TYPOGRAPHY
  // ===================================

  typography:{

    family:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    brand:
    21,

    title:
    32,

    heading:
    17,

    body:
    13,

    small:
    12,

    tiny:
    11,

    titleWeight:
    800,

    headingWeight:
    800,

    bodyWeight:
    500

  },



  // ===================================
  // LAYOUT
  // ===================================

  layout:{

    topbarHeight:
    64,

    sidebarColumnWidth:
    132,

    sidebarWidth:
    116,

    workspaceTabsHeight:
    0,

    statusbarHeight:
    0,

    workspacePadding:
    10,

    dashboardPadding:
    20,

    dashboardGap:
    14,

    metricCardHeight:
    108,

    dashboardHeaderHeight:
    128,

    dashboardPanelsHeight:
    272,

    dashboardDebugHeight:
    156,

    desktopMinWidth:
    981,

    mobileBreakpoint:
    680

  },



  // ===================================
  // TRANSITIONS
  // ===================================

  transition:{

    fast:
    "120ms ease",

    normal:
    "180ms ease",

    slow:
    "260ms ease"

  }

});



// =====================================
// CSS VARIABLES
// =====================================

function createThemeVariables(){

  return `
    --rigo-background:${StudioTheme.colors.background};
    --rigo-background-soft:${StudioTheme.colors.backgroundSoft};
    --rigo-surface:${StudioTheme.colors.surface};
    --rigo-surface-raised:${StudioTheme.colors.surfaceRaised};
    --rigo-surface-hover:${StudioTheme.colors.surfaceHover};
    --rigo-sidebar:${StudioTheme.colors.sidebar};
    --rigo-workspace:${StudioTheme.colors.workspace};

    --rigo-border:${StudioTheme.colors.border};
    --rigo-border-strong:${StudioTheme.colors.borderStrong};

    --rigo-primary:${StudioTheme.colors.primary};
    --rigo-primary-soft:${StudioTheme.colors.primarySoft};
    --rigo-primary-glow:${StudioTheme.colors.primaryGlow};

    --rigo-blue:${StudioTheme.colors.blue};
    --rigo-yellow:${StudioTheme.colors.yellow};
    --rigo-purple:${StudioTheme.colors.purple};
    --rigo-pink:${StudioTheme.colors.pink};
    --rigo-red:${StudioTheme.colors.red};
    --rigo-cyan:${StudioTheme.colors.cyan};
    --rigo-lime:${StudioTheme.colors.lime};

    --rigo-text:${StudioTheme.colors.text};
    --rigo-text-secondary:${StudioTheme.colors.textSecondary};
    --rigo-muted:${StudioTheme.colors.muted};
    --rigo-subtle:${StudioTheme.colors.subtle};

    --rigo-space-xxs:${StudioTheme.spacing.xxs}px;
    --rigo-space-xs:${StudioTheme.spacing.xs}px;
    --rigo-space-sm:${StudioTheme.spacing.sm}px;
    --rigo-space-md:${StudioTheme.spacing.md}px;
    --rigo-space-lg:${StudioTheme.spacing.lg}px;
    --rigo-space-xl:${StudioTheme.spacing.xl}px;
    --rigo-space-xxl:${StudioTheme.spacing.xxl}px;
    --rigo-space-xxxl:${StudioTheme.spacing.xxxl}px;

    --rigo-radius-xs:${StudioTheme.radius.xs}px;
    --rigo-radius-sm:${StudioTheme.radius.sm}px;
    --rigo-radius-md:${StudioTheme.radius.md}px;
    --rigo-radius-lg:${StudioTheme.radius.lg}px;
    --rigo-radius-xl:${StudioTheme.radius.xl}px;
    --rigo-radius-panel:${StudioTheme.radius.panel}px;

    --rigo-shadow-small:${StudioTheme.shadow.small};
    --rigo-shadow-medium:${StudioTheme.shadow.medium};
    --rigo-shadow-large:${StudioTheme.shadow.large};
    --rigo-shadow-glow:${StudioTheme.shadow.glow};
    --rigo-shadow-inset:${StudioTheme.shadow.inset};

    --rigo-font:${StudioTheme.typography.family};

    --rigo-font-brand:${StudioTheme.typography.brand}px;
    --rigo-font-title:${StudioTheme.typography.title}px;
    --rigo-font-heading:${StudioTheme.typography.heading}px;
    --rigo-font-body:${StudioTheme.typography.body}px;
    --rigo-font-small:${StudioTheme.typography.small}px;
    --rigo-font-tiny:${StudioTheme.typography.tiny}px;

    --rigo-font-title-weight:${StudioTheme.typography.titleWeight};
    --rigo-font-heading-weight:${StudioTheme.typography.headingWeight};
    --rigo-font-body-weight:${StudioTheme.typography.bodyWeight};

    --rigo-topbar-height:${StudioTheme.layout.topbarHeight}px;
    --rigo-sidebar-column:${StudioTheme.layout.sidebarColumnWidth}px;
    --rigo-sidebar-width:${StudioTheme.layout.sidebarWidth}px;

    --rigo-workspace-tabs-height:${StudioTheme.layout.workspaceTabsHeight}px;
    --rigo-statusbar-height:${StudioTheme.layout.statusbarHeight}px;

    --rigo-workspace-padding:${StudioTheme.layout.workspacePadding}px;
    --rigo-dashboard-padding:${StudioTheme.layout.dashboardPadding}px;
    --rigo-dashboard-gap:${StudioTheme.layout.dashboardGap}px;

    --rigo-metric-card-height:${StudioTheme.layout.metricCardHeight}px;
    --rigo-dashboard-header-height:${StudioTheme.layout.dashboardHeaderHeight}px;
    --rigo-dashboard-panels-height:${StudioTheme.layout.dashboardPanelsHeight}px;
    --rigo-dashboard-debug-height:${StudioTheme.layout.dashboardDebugHeight}px;

    --rigo-transition-fast:${StudioTheme.transition.fast};
    --rigo-transition-normal:${StudioTheme.transition.normal};
    --rigo-transition-slow:${StudioTheme.transition.slow};
  `;

}



// =====================================
// APPLY THEME
// =====================================

function applyStudioTheme(
  element
){

  if(
    !element
  ){

    return false;

  }

  const variables =
  createThemeVariables();

  element.style.cssText =
  `${element.style.cssText || ""}${variables}`;

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  StudioTheme,

  createThemeVariables,

  applyStudioTheme

};

export default
StudioTheme;
