import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { getCardStyle, getButtonStyle, getGradientText, animations } from '../../styles/theme';

// Futuristic Card Component
interface FuturisticCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'glow';
  delay?: number;
  hoverScale?: boolean;
}

export const FuturisticCard: React.FC<FuturisticCardProps> = ({ 
  children, 
  className = '', 
  variant = 'hover',
  delay = 0,
  hoverScale = true 
}) => {
  return (
    <motion.div
      className={`${getCardStyle(variant)} ${className}`}
      {...animations.fadeInUp(delay)}
      whileHover={hoverScale ? { scale: 1.02 } : undefined}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

// Gradient Text Component
interface GradientTextProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'accent' | 'primaryHover';
  className?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  gradient = 'accent',
  className = '' 
}) => {
  return (
    <span className={`${getGradientText(gradient)} ${className}`}>
      {children}
    </span>
  );
};

// Futuristic Button Component
interface FuturisticButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const FuturisticButton: React.FC<FuturisticButtonProps> = ({ 
  children, 
  variant = 'primary',
  className = '',
  onClick,
  icon: Icon,
  iconPosition = 'right',
  disabled = false,
  type = 'button'
}) => {
  return (
    <motion.button
      type={type}
      className={`${getButtonStyle(variant)} ${className} flex items-center justify-center group`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-5 h-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
      )}
    </motion.button>
  );
};

// Feature Card with Icon
interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats?: string;
  gradient?: string;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  stats,
  gradient = 'from-cyan-500 to-blue-600',
  delay = 0 
}) => {
  return (
    <FuturisticCard delay={delay} variant="glow">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-slate-700/50 rounded-2xl mr-4">
            <Icon className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">{title}</h3>
            {stats && <span className="text-cyan-400 font-semibold text-sm">{stats}</span>}
          </div>
        </div>
        <p className="text-slate-300 text-lg leading-relaxed">{description}</p>
      </div>
    </FuturisticCard>
  );
};

// Animated Section Header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleGradient?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  className = '',
  titleGradient = true 
}) => {
  return (
    <motion.div 
      className={`text-center mb-16 ${className}`}
      {...animations.fadeInUp()}
      viewport={{ once: true }}
    >
      <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${titleGradient ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent' : 'text-white'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

// Stat Card
interface StatCardProps {
  number: string;
  label: string;
  icon: LucideIcon;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ number, label, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      className="text-center"
      {...animations.scaleIn(delay)}
      viewport={{ once: true }}
    >
      <div className="text-cyan-400 mb-4 flex justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-slate-400 font-medium">{label}</div>
    </motion.div>
  );
};

// Glowing Background Elements
export const GlowingOrb: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'cyan' | 'purple' | 'pink';
  position?: string;
  delay?: number;
}> = ({ 
  size = 'md', 
  color = 'cyan', 
  position = 'top-20 left-20',
  delay = 0 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-72 h-72',
    lg: 'w-96 h-96',
    xl: 'w-[32rem] h-[32rem]'
  };

  const colorClasses = {
    cyan: 'bg-cyan-500/20',
    purple: 'bg-purple-500/20',
    pink: 'bg-pink-500/20'
  };

  return (
    <motion.div 
      className={`absolute ${position} ${sizeClasses[size]} ${colorClasses[color]} rounded-full blur-3xl`}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        delay 
      }}
    />
  );
};

// Loading Spinner
export const FuturisticSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-slate-600 border-t-cyan-400 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Toast Notification
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
}

export const FuturisticToast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose 
}) => {
  const typeStyles = {
    success: 'from-green-500/20 to-emerald-500/20 border-green-400',
    error: 'from-red-500/20 to-pink-500/20 border-red-400',
    info: 'from-cyan-500/20 to-blue-500/20 border-cyan-400',
    warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-400'
  };

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 bg-gradient-to-r ${typeStyles[type]} backdrop-blur-sm border rounded-xl p-4 max-w-md`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-white">{message}</p>
        <button 
          onClick={onClose}
          className="ml-4 text-slate-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};
