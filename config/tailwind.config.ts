import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
	darkMode: ["class"],
	content: [
		"src/**/*.{ts,tsx}",
		"src/pages/**/*.{ts,tsx}",
		"src/components/**/*.{ts,tsx}",
		"src/app/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))',
					light: 'hsl(var(--secondary-light))',
					dark: 'hsl(var(--secondary-dark))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					hover: 'hsl(var(--destructive-hover))',
					light: 'hsl(var(--destructive-light))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					hover: 'hsl(var(--success-hover))',
					light: 'hsl(var(--success-light))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))',
					hover: 'hsl(var(--info-hover))',
					light: 'hsl(var(--info-light))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					light: 'hsl(var(--muted-light))',
					dark: 'hsl(var(--muted-dark))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))',
					light: 'hsl(var(--accent-light))',
					dark: 'hsl(var(--accent-dark))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					hover: 'hsl(var(--warning-hover))',
					light: 'hsl(var(--warning-light))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				'earthy-brown': 'hsl(var(--earthy-brown))',
				'moss-green': 'hsl(var(--moss-green))',
				'sage-green': 'hsl(var(--sage-green))',
				'forest-green': 'hsl(var(--forest-green))',
				'warm-beige': 'hsl(var(--warm-beige))',
				'deep-forest': 'hsl(var(--deep-forest))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
				'xs': 'var(--spacing-xs)',
				'sm': 'var(--spacing-sm)',
				'md': 'var(--spacing-md)',
				'lg': 'var(--spacing-lg)',
				'xl': 'var(--spacing-xl)',
				'2xl': 'var(--spacing-2xl)',
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'soft': 'var(--shadow-soft)',
				'strong': 'var(--shadow-strong)',
			},
                        animation: {
                                'accordion-down': 'accordion-down 0.2s ease-out',
                                'accordion-up': 'accordion-up 0.2s ease-out',
                                'fade-in': 'fade-in 0.3s ease-out',
                                'slide-up': 'slide-up 0.4s ease-out'
                        },
                        typography: {
                                DEFAULT: {
                                        css: {
                                                color: 'hsl(var(--foreground))',
                                                a: {
                                                        color: 'hsl(var(--primary))',
                                                        '&:hover': {
                                                                color: 'hsl(var(--primary-hover))'
                                                        }
                                                },
                                                'h1, h2, h3, h4': {
                                                        color: 'hsl(var(--foreground))'
                                                },
                                                strong: {
                                                        color: 'hsl(var(--foreground))'
                                                },
                                                blockquote: {
                                                        color: 'hsl(var(--foreground))',
                                                        borderLeftColor: 'hsl(var(--primary))'
                                                }
                                        }
                                }
                        }
                }
        },
        plugins: [typography],
} satisfies Config;


