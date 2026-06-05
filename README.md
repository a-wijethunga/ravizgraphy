# Cinematic Photography & Videography Portfolio

A modern, immersive portfolio website designed for creative photography and videography professionals. Built with React, TypeScript, Tailwind CSS, Framer Motion, and GSAP for cinematic animations and smooth interactions.

## ✨ Features

### Visual Design
- **Dark Cinematic Aesthetic**: Deep blacks, soft gradients, and subtle grain effects
- **Premium Minimal Design**: High-end look inspired by luxury production studios and creative agencies
- **Responsive Layouts**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Professional transitions, fade-in effects, and parallax scrolling

### Core Components

#### Navigation
- Transparent navbar with scroll detection
- Smooth fullscreen mobile menu overlay
- Animated menu transitions and indicators

#### Hero Section
- Fullscreen hero with cinematic background
- 3D parallax effect on mouse movement
- Bold typography with text gradients
- Animated floating elements and scroll indicator

#### Portfolio Grid
- Responsive grid (1→2→3 columns)
- Hover effects with zoom and overlays
- Smooth category badges and descriptions
- Glass-morphism card styling
- 6 featured projects with smooth animations

#### Services & Process
- Parallax scrolling with GSAP ScrollTrigger
- Service cards with hover animations
- Statistics counter section
- Step-by-step process timeline
- Call-to-action buttons

#### Footer
- Comprehensive footer sections
- Newsletter subscription
- Social media links
- Back-to-top button

## 🛠 Tech Stack

- **React 18+**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Tailwind CSS v3**: Utility-first styling
- **Framer Motion**: Component animations
- **GSAP**: Advanced scroll animations
- **Three.js**: 3D graphics (ready to use)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.tsx       # Top navbar with mobile menu
│   ├── Hero.tsx            # Hero section with parallax
│   ├── PortfolioGrid.tsx   # Portfolio grid showcase
│   ├── ParallaxSection.tsx # Services and process
│   └── Footer.tsx          # Footer
├── App.tsx                  # Main component
├── App.css                  # Component styles
├── index.css               # Global styles
└── main.tsx                # Entry point

tailwind.config.ts          # Tailwind configuration
vite.config.ts             # Vite build configuration
```

## 🎨 Customization

### Update Portfolio Projects
Edit the `projects` array in `PortfolioGrid.tsx`:
```tsx
const projects: Project[] = [
  {
    id: 1,
    title: 'Your Project Title',
    category: 'Photography',
    description: 'Project description',
    image: 'your-image-url',
    color: 'from-blue-600 to-purple-600',
  },
  // ... more projects
]
```

### Customize Colors
Update `tailwind.config.ts`:
```ts
colors: {
  dark: {
    950: '#030712',
    900: '#111827',
    // ... customize colors
  }
}
```

### Modify Content
- **Navigation links**: Edit `Navigation.tsx` `menuItems`
- **Hero text**: Edit `Hero.tsx` heading and description
- **Services**: Edit `services` array in `ParallaxSection.tsx`
- **Footer links**: Edit `Footer.tsx` sections

### Animation Customization
- **Framer Motion**: Adjust `animate`, `transition` props in components
- **GSAP**: Modify `gsap.fromTo()` calls in `ParallaxSection.tsx`
- **Tailwind animations**: Update in `tailwind.config.ts` keyframes

## 🚀 Performance

Build output:
- HTML: 0.70 kB (gzip: 0.36 kB)
- CSS: 24.11 kB (gzip: 5.56 kB)
- JavaScript (vendor): 181.38 kB (gzip: 57.51 kB)
- JavaScript (animations): 251.79 kB (gzip: 88.95 kB)

### Optimizations
- Code splitting by vendor/animation/three.js
- Lazy loading support
- Minification with terser
- Gzip compression

### Performance Tips
1. **Images**: Use WebP format, optimize sizes, lazy load
2. **Video**: Compress for web, use correct formats
3. **Animations**: Use `will-change` CSS property
4. **Bundle**: Monitor size, consider dynamic imports

## 🔧 Adding Features

### Add 3D Effects
```tsx
import * as THREE from 'three'
// Create THREE.js scene in new component
```

### Add Blog/Case Studies
- Create new route component
- Add markdown support
- Create case study cards

### Add Contact Form
- Integrate Formspree or EmailJS
- Add form validation
- Create success notifications

### Add Project Detail Pages
- Install `react-router-dom`
- Create detail page components
- Add navigation between items

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 15+
- iOS Safari 15+
- Chrome Mobile

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Traditional Hosting
1. Run: `npm run build`
2. Upload `dist/` folder
3. Configure server for SPA routing

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [GSAP Docs](https://gsap.com)
- [Vite Guide](https://vitejs.dev)

## 📝 Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🎯 Next Steps

1. Replace placeholder images with your portfolio images
2. Update project data with your actual work
3. Customize colors and branding
4. Add your contact information
5. Deploy to your preferred hosting platform

## 📄 License

Open source and available for personal and commercial use.

---

**Ready to showcase your creative work?** Get started by customizing the content and deploying this portfolio today!
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
