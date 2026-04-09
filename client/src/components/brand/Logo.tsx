import { useTheme } from '../../contexts/ThemeContext';
import logoDark from '../../assets/branding/logo-dark.svg';
import logoLight from '../../assets/branding/logo-light.svg';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const heights: Record<string, string> = {
  sm: '22px',
  md: '28px',
  lg: '38px',
};

export default function Logo({ variant = 'auto', size = 'md', className = '' }: LogoProps) {
  const { isDark } = useTheme();

  const src =
    variant === 'dark' ? logoDark :
    variant === 'light' ? logoLight :
    isDark ? logoDark : logoLight;

  return (
    <img
      src={src}
      alt="Selecta"
      height={heights[size]}
      style={{ height: heights[size], width: 'auto' }}
      className={`select-none ${className}`}
      draggable={false}
    />
  );
}
