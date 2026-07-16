// =====================================
// RIGO AI
// STUDIO THEME
// DESIGN SYSTEM V2
// =====================================

const StudioTheme =
Object.freeze({

  colors:{

    background:
    "#020817",

    backgroundSoft:
    "#06101f",

    surface:
    "#0b1628",

    surfaceRaised:
    "#101d31",

    surfaceHover:
    "#15243a",

    sidebar:
    "#07111f",

    workspace:
    "#020817",

    border:
    "rgba(148,163,184,.14)",

    borderStrong:
    "rgba(148,163,184,.22)",

    primary:
    "#22c55e",

    primarySoft:
    "rgba(34,197,94,.14)",

    primaryGlow:
    "rgba(34,197,94,.30)",

    blue:
    "#38bdf8",

    yellow:
    "#facc15",

    purple:
    "#c084fc",

    pink:
    "#f472b6",

    red:
    "#fb7185",

    cyan:
    "#22d3ee",

    text:
    "#f8fafc",

    textSecondary:
    "#cbd5e1",

    muted:
    "#94a3b8",

    subtle:
    "#64748b"

  },



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
    24

  },



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
    14

  },



  shadow:{

    small:
    "0 6px 18px rgba(0,0,0,.16)",

    medium:
    "0 12px 32px rgba(0,0,0,.22)",

    large:
    "0 20px 60px rgba(0,0,0,.34)",

    glow:
    "0 0 20px rgba(34,197,94,.12)"

  },



  typography:{

    family:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    title:
    26,

    heading:
    15,

    body:
    12,

    small:
    11,

    tiny:
    10

  },



  layout:{

    topbarHeight:
    64,

    sidebarColumnWidth:
    132,

    sidebarWidth:
    112,

    workspaceTabsHeight:
    36,

    statusbarHeight:
    28,

    workspacePadding:
    10,

    dashboardPadding:
    14,

    dashboardGap:
    10,

    metricCardHeight:
    84

  },



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

    --rigo-text:${StudioTheme.colors.text};
    --rigo-text-secondary:${StudioTheme.colors.textSecondary};
    --rigo-muted:${StudioTheme.colors.muted};
    --rigo-subtle:${StudioTheme.colors.subtle};

    --rigo-radius-xs:${StudioTheme.radius.xs}px;
    --rigo-radius-sm:${StudioTheme.radius.sm}px;
    --rigo-radius-md:${StudioTheme.radius.md}px;
    --rigo-radius-lg:${StudioTheme.radius.lg}px;
    --rigo-radius-xl:${StudioTheme.radius.xl}px;

    --rigo-shadow-small:${StudioTheme.shadow.small};
    --rigo-shadow-medium:${StudioTheme.shadow.medium};
    --rigo-shadow-large:${StudioTheme.shadow.large};
    --rigo-shadow-glow:${StudioTheme.shadow.glow};

    --rigo-font:${StudioTheme.typography.family};

    --rigo-topbar-height:${StudioTheme.layout.topbarHeight}px;
    --rigo-sidebar-column:${StudioTheme.layout.sidebarColumnWidth}px;
    --rigo-sidebar-width:${StudioTheme.layout.sidebarWidth}px;
    --rigo-workspace-tabs-height:${StudioTheme.layout.workspaceTabsHeight}px;
    --rigo-statusbar-height:${StudioTheme.layout.statusbarHeight}px;
    --rigo-workspace-padding:${StudioTheme.layout.workspacePadding}px;
    --rigo-dashboard-padding:${StudioTheme.layout.dashboardPadding}px;
    --rigo-dashboard-gap:${StudioTheme.layout.dashboardGap}px;
    --rigo-metric-card-height:${StudioTheme.layout.metricCardHeight}px;

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

  element.style.cssText +=
  createThemeVariables();

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
