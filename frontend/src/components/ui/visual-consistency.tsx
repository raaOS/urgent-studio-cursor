'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Theme Context untuk konsistensi visual
interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  setBorderRadius: (radius: 'none' | 'sm' | 'md' | 'lg' | 'xl') => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [accentColor, setAccentColor] = useState<string>('#000000');
  const [borderRadius, setBorderRadius] = useState<'none' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  // Force light theme immediately on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    
    // Clear any dark theme from localStorage
    localStorage.removeItem('theme');
    localStorage.setItem('theme', 'light');
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    const savedAccentColor = localStorage.getItem('accentColor');
    const savedBorderRadius = localStorage.getItem('borderRadius') as 'none' | 'sm' | 'md' | 'lg' | 'xl' | null;
    const savedAnimationSpeed = localStorage.getItem('animationSpeed') as 'slow' | 'normal' | 'fast' | null;

    // Force light theme as default, ignore saved dark theme
    if (savedTheme && savedTheme !== 'dark') {
      setTheme(savedTheme);
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
    
    if (savedAccentColor) setAccentColor(savedAccentColor);
    if (savedBorderRadius) setBorderRadius(savedBorderRadius);
    if (savedAnimationSpeed) setAnimationSpeed(savedAnimationSpeed);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('borderRadius', borderRadius);
    localStorage.setItem('animationSpeed', animationSpeed);
  }, [theme, accentColor, borderRadius, animationSpeed]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Force light theme - remove dark class completely
    root.classList.remove('dark');
    
    // Only apply dark if explicitly set to dark (which we prevent in loading)
    if (theme === 'dark') {
      root.classList.add('dark');
    }

    // Apply accent color
    root.style.setProperty('--accent-color', accentColor);

    // Apply border radius
    const radiusMap = {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    };
    root.style.setProperty('--border-radius', radiusMap[borderRadius]);

    // Apply animation speed
    const speedMap = {
      slow: '0.5s',
      normal: '0.3s',
      fast: '0.15s'
    };
    root.style.setProperty('--animation-duration', speedMap[animationSpeed]);
  }, [theme, accentColor, borderRadius, animationSpeed]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      accentColor,
      setAccentColor,
      borderRadius,
      setBorderRadius,
      animationSpeed,
      setAnimationSpeed
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Consistent Typography Components
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'destructive';
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  className,
  variant = 'body',
  weight = 'normal',
  align = 'left',
  color = 'primary'
}) => {
  const variantClasses = {
    h1: 'text-2xl md:text-3xl lg:text-4xl leading-tight', // 28px -> 32px -> 36px
    h2: 'text-xl md:text-2xl lg:text-3xl leading-tight',  // 24px -> 28px -> 32px
    h3: 'text-lg md:text-xl lg:text-2xl leading-snug',    // 20px -> 24px -> 28px
    h4: 'text-base md:text-lg lg:text-xl leading-snug',   // 18px -> 20px -> 24px
    h5: 'text-sm md:text-base lg:text-lg leading-normal', // 16px -> 18px -> 20px
    h6: 'text-xs md:text-sm lg:text-base leading-normal', // 14px -> 16px -> 18px
    body: 'text-sm md:text-base leading-relaxed',         // 14px -> 16px (tetap)
    caption: 'text-xs md:text-sm leading-normal',         // 12px -> 14px (tetap)
    overline: 'text-xs uppercase tracking-wider leading-normal' // 12px (tetap)
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const colorClasses = {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground/70',
    accent: 'text-accent-foreground',
    destructive: 'text-destructive'
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return (
    <Component
      className={cn(
        variantClasses[variant],
        weightClasses[weight],
        alignClasses[align],
        colorClasses[color],
        'transition-colors duration-200',
        className
      )}
    >
      {children}
    </Component>
  );
};

// Consistent Spacing System
interface SpacingProps {
  children: React.ReactNode;
  className?: string;
  p?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  px?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  py?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  pt?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  pb?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  pl?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  pr?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  m?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  mx?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  my?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  mt?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  mb?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  ml?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  mr?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
}

export const Spacing: React.FC<SpacingProps> = ({
  children,
  className,
  p, px, py, pt, pb, pl, pr,
  m, mx, my, mt, mb, ml, mr
}) => {
  const spacingClasses = cn(
    p !== undefined && `p-${p}`,
    px !== undefined && `px-${px}`,
    py !== undefined && `py-${py}`,
    pt !== undefined && `pt-${pt}`,
    pb !== undefined && `pb-${pb}`,
    pl !== undefined && `pl-${pl}`,
    pr !== undefined && `pr-${pr}`,
    m !== undefined && `m-${m}`,
    mx !== undefined && `mx-${mx}`,
    my !== undefined && `my-${my}`,
    mt !== undefined && `mt-${mt}`,
    mb !== undefined && `mb-${mb}`,
    ml !== undefined && `ml-${ml}`,
    mr !== undefined && `mr-${mr}`,
    className
  );

  return <div className={spacingClasses}>{children}</div>;
};

// Consistent Grid System
interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
}

export const Grid: React.FC<GridProps> = ({
  children,
  className,
  cols = 1,
  gap = 4,
  responsive
}) => {
  const gridClasses = cn(
    'grid',
    `grid-cols-${cols}`,
    `gap-${gap}`,
    responsive?.sm && `sm:grid-cols-${responsive.sm}`,
    responsive?.md && `md:grid-cols-${responsive.md}`,
    responsive?.lg && `lg:grid-cols-${responsive.lg}`,
    responsive?.xl && `xl:grid-cols-${responsive.xl}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
};

// Consistent Container
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  size = 'lg',
  center = true
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={cn(
        'w-full px-4',
        sizeClasses[size],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

// Consistent Card Component
interface ConsistentCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'neo';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const ConsistentCard: React.FC<ConsistentCardProps> = ({
  children,
  className,
  variant = 'neo',
  padding = 'md',
  hover = true,
  clickable = false,
  onClick
}) => {
  const variantClasses = {
    default: 'bg-background border border-border',
    outlined: 'bg-background border-2 border-foreground',
    elevated: 'bg-background shadow-lg border border-border',
    neo: 'bg-background border-2 border-foreground shadow-neo'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const motionProps = {
    ...(hover && { whileHover: { scale: 1.02 } }),
    ...(clickable && { whileTap: { scale: 0.98 } })
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// Consistent Button Variants
interface ConsistentButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'neo';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ConsistentButton: React.FC<ConsistentButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button'
}) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    outline: 'border-2 border-foreground bg-background hover:bg-muted shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    ghost: 'hover:bg-muted hover:text-accent-foreground border-transparent hover:border-foreground shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
    neo: 'bg-background border-2 border-foreground shadow-neo hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  return (
    <motion.button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-foreground',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {loading && (
        <motion.div
          className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
};

// Color Palette Display
export const ColorPalette: React.FC = () => {
  const colors = [
    { name: 'Primary', class: 'bg-primary', text: 'text-primary-foreground' },
    { name: 'Secondary', class: 'bg-secondary', text: 'text-secondary-foreground' },
    { name: 'Accent', class: 'bg-accent', text: 'text-accent-foreground' },
    { name: 'Muted', class: 'bg-muted', text: 'text-muted-foreground' },
    { name: 'Background', class: 'bg-background border-2 border-foreground', text: 'text-foreground' },
    { name: 'Destructive', class: 'bg-destructive', text: 'text-destructive-foreground' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {colors.map((color) => (
        <div
          key={color.name}
          className={cn(
            'p-4 rounded-lg text-center',
            color.class,
            color.text
          )}
        >
          <div className="font-medium">{color.name}</div>
          <div className="text-sm opacity-75">{color.class}</div>
        </div>
      ))}
    </div>
  );
};

// Design System Status
export const DesignSystemStatus: React.FC = () => {
  const components = [
    { name: 'Typography', status: 'Complete', coverage: 100 },
    { name: 'Colors', status: 'Complete', coverage: 100 },
    { name: 'Spacing', status: 'Complete', coverage: 100 },
    { name: 'Components', status: 'Complete', coverage: 95 },
    { name: 'Icons', status: 'Complete', coverage: 90 },
    { name: 'Animations', status: 'Complete', coverage: 85 }
  ];

  return (
    <div className="space-y-4">
      <Typography variant="h3" weight="bold">Design System Status</Typography>
      <div className="space-y-3">
        {components.map((component) => (
          <div key={component.name} className="flex items-center justify-between p-3 border-2 border-foreground rounded-lg">
            <div>
              <div className="font-medium">{component.name}</div>
              <div className="text-sm text-muted-foreground">{component.status}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{component.coverage}%</div>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${component.coverage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};