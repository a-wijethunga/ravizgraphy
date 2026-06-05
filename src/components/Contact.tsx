import { motion } from 'framer-motion'
import contactImg from '../assets/ravi.jpg'

const Contact = () => {
  return (
    <section id="contact" className="py-32 md:py-40 bg-sand-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          {/* Left Column: Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 relative h-[50vh] md:h-[65vh] min-h-[400px] overflow-hidden rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-500"
          >
            <img decoding="async" loading="lazy"
              src={contactImg.src}
              alt="Raviz Portrait"
              className="w-full h-full object-cover object-center transition-transform duration-[2000ms] hover:scale-105"
            />
          </motion.div>

          {/* Right Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 flex flex-col justify-between self-stretch py-2"
          >
            <div>
              {/* Heading */}
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-slate-400 mb-4 block">
                Inquiries
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-slate-800 tracking-wide uppercase mb-16">
                Get In Touch
              </h2>

              {/* Information Rows */}
              <div className="space-y-10">
                {/* Phone */}
                <div className="group">
                  <span className="block text-xs font-sans tracking-[0.2em] uppercase text-slate-400 mb-2">
                    Phone Number
                  </span>
                  <a
                    href="tel:+94763056168"
                    className="inline-block text-xl md:text-2xl font-display text-slate-800 group-hover:italic transition-all duration-300"
                  >
                    +94 76 305 6168
                  </a>
                </div>

                {/* Email */}
                <div className="group">
                  <span className="block text-xs font-sans tracking-[0.2em] uppercase text-slate-400 mb-2">
                    Email
                  </span>
                  <a
                    href="mailto:ravizthecrash@gmail.com"
                    className="inline-block text-xl md:text-2xl font-display text-slate-800 group-hover:italic transition-all duration-300"
                  >
                    ravizthecrash@gmail.com
                  </a>
                </div>

                {/* Address */}
                <div>
                  <span className="block text-xs font-sans tracking-[0.2em] uppercase text-slate-400 mb-2">
                    Mailing Address
                  </span>
                  <p className="text-slate-600 font-light text-sm md:text-base leading-relaxed max-w-sm">
                    Chamika Stores,<br />
                    Yahalawatta, Maliduwa,<br />
                    Akuressa
                  </p>
                </div>

                {/* Socials */}
                <div>
                  <span className="block text-xs font-sans tracking-[0.2em] uppercase text-slate-400 mb-3">
                    Social
                  </span>
                  <div className="flex items-center gap-4 text-slate-600">
                    <a
                      href="https://facebook.com/ravizgraphy"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 -ml-2 rounded-full hover:bg-slate-200/40 hover:text-slate-900 transition-all duration-300"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/ravizgraphy"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-full hover:bg-slate-200/40 hover:text-slate-900 transition-all duration-300"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </a>
                    <span className="text-sm font-light text-slate-500 tracking-wider">
                      @ravizgraphy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Collab Status: WhatsApp Button */}
            <div className="mt-16 pt-8 border-t border-slate-200/70">
              <a
                href="https://wa.me/94763056168"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-slate-300 bg-transparent text-slate-600 text-xs tracking-widest uppercase hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all duration-500 font-sans font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Open for Collabs</span>
              </a>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact
