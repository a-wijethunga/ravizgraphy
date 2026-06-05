import { motion } from 'framer-motion'

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-20 bg-sand-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center justify-center space-y-12"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8 text-sm tracking-widest text-slate-500 uppercase">
            <a href="#" className="hover:text-slate-800 transition-colors duration-300">Instagram</a>
            <span className="hidden sm:block text-slate-300">/</span>
            <a href="#" className="hover:text-slate-800 transition-colors duration-300">Pinterest</a>
            <span className="hidden sm:block text-slate-300">/</span>
            <a href="#" className="hover:text-slate-800 transition-colors duration-300">Journal</a>
          </div>

          <h2 className="text-3xl font-display text-slate-800 tracking-wide">RAVIZGRAPHY</h2>
          
          <div className="flex flex-col items-center gap-4 text-xs tracking-widest text-slate-400 uppercase">
            <span>© {new Date().getFullYear()} Ravizgraphy. All Rights Reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-600 transition-colors duration-300">Privacy</a>
              <a href="#" className="hover:text-slate-600 transition-colors duration-300">Terms</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
