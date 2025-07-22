// Modern Futuristic Theme Configuration for TechTrainer
// Use this throughout your site for consistent styling

export const theme = {
  // Color Palette
  colors: {
    primary: {
      cyan: {
        50: '#ecfeff',
        100: '#cffafe', 
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63',
      },
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff', 
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      amber: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      }
    },
    neutral: {
      slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      }
    }
  },

  // Gradients
  gradients: {
    primary: 'from-cyan-500 to-purple-600',
    primaryHover: 'from-cyan-400 to-purple-500',
    background: 'from-slate-900 via-purple-900 to-slate-900',
    accent: 'from-cyan-400 via-purple-400 to-pink-400',
    surface: 'from-slate-800/50 to-slate-700/30',
    glow: 'from-cyan-500/20 to-purple-500/20',
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm', 
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl',
      '8xl': 'text-8xl',
    }
  },

  // Spacing
  spacing: {
    section: 'py-32',
    container: 'container mx-auto px-4',
    cardPadding: 'p-8',
    buttonPadding: 'px-8 py-4',
  },

  // Animations
  animations: {
    fadeInUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8 }
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8 }
    },
    fadeInRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6 }
    },
    staggerChildren: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  },

  // Components
  components: {
    card: {
      base: 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm rounded-3xl border border-slate-600/30',
      hover: 'hover:border-cyan-400/50 transition-all duration-500',
      glow: 'hover:shadow-2xl hover:shadow-cyan-500/25'
    },
    button: {
      primary: 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105',
      secondary: 'border-2 border-slate-600 hover:border-cyan-400 text-white font-semibold rounded-full transition-all duration-300 hover:bg-cyan-400/10',
      ghost: 'text-slate-400 hover:text-cyan-400 transition-colors duration-300'
    },
    input: {
      base: 'bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300',
    },
    text: {
      heading: 'font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent',
      subheading: 'text-slate-300 font-light',
      body: 'text-slate-400',
      accent: 'text-cyan-400'
    }
  },

  // Effects
  effects: {
    glow: {
      cyan: 'shadow-2xl shadow-cyan-500/25',
      purple: 'shadow-2xl shadow-purple-500/25',
      amber: 'shadow-2xl shadow-amber-500/25'
    },
    blur: {
      backdrop: 'backdrop-blur-sm',
      heavy: 'blur-3xl'
    },
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    neon: 'border-cyan-400 shadow-lg shadow-cyan-400/50',
  },

  // Layout
  layout: {
    maxWidth: {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
    },
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
      auto: 'grid grid-cols-auto-fit gap-8',
    }
  }
};

// Utility functions for consistent styling
export const getGradientText = (gradient: keyof typeof theme.gradients) => 
  `bg-gradient-to-r ${theme.gradients[gradient]} bg-clip-text text-transparent`;

export const getCardStyle = (variant: 'default' | 'hover' | 'glow' = 'default') => {
  const base = theme.components.card.base;
  switch (variant) {
    case 'hover':
      return `${base} ${theme.components.card.hover}`;
    case 'glow':
      return `${base} ${theme.components.card.hover} ${theme.components.card.glow}`;
    default:
      return base;
  }
};

export const getButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') =>
  theme.components.button[variant];

// Animation presets
export const animations = {
  fadeInUp: (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay }
  }),
  
  fadeInLeft: (delay = 0) => ({
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, delay }
  }),
  
  fadeInRight: (delay = 0) => ({
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, delay }
  }),
  
  scaleIn: (delay = 0) => ({
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, delay }
  }),
  
  staggerParent: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerChild: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }
};

export default theme;
