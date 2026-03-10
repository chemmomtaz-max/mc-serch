import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Linkedin, 
  Facebook,
  Instagram,
  Twitter,
  Send,
  MessageCircle,
  Filter,
  Loader2,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  Zap,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { generateLeads, Lead } from './services/leadService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COUNTRIES = [
  "Global",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Holy See", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
  "Middle East", "European Union", "Southeast Asia"
];

const LOGO_DATA_URL = `data:image/svg+xml;base64,${btoa(`
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M70 40C70 40 90 20 130 20C170 20 185 50 185 50C185 50 170 35 145 35C120 35 100 60 100 60L70 40Z" fill="#0000FF"/>
  <path d="M100 60C100 60 115 85 145 85C175 85 190 60 190 60C190 60 175 75 150 75C125 75 110 55 110 55L100 60Z" fill="#0000FF"/>
  <path d="M30 60L70 50L30 40L60 50L30 60Z" fill="black"/>
  <path d="M40 80L80 70L40 60L70 70L40 80Z" fill="black"/>
  <path d="M50 100L90 90L50 80L80 90L50 100Z" fill="black"/>
  <path d="M60 120L100 110L60 100L90 110L60 120Z" fill="black"/>
  <text x="75" y="170" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="black">MC</text>
</svg>
`)}`;

export default function App() {
  const [chemical, setChemical] = useState('');
  const [region, setRegion] = useState(COUNTRIES[0]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Lead['category'] | 'All'>('All');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemical || !region) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await generateLeads(chemical, region);
      setLeads(results);
      if (results.length === 0) {
        setError("هیچ لیدی برای این جستجو پیدا نشد. لطفاً عبارات خود را گسترده‌تر کنید.");
      }
    } catch (err: any) {
      console.error(err);
      const isQuotaError = err.message?.includes("سهمیه") || err.message?.includes("429");
      if (isQuotaError) {
        setError("سهمیه جستجوی لحظه‌ای شما تمام شده است. گوگل در نسخه رایگان محدودیت '۱ جستجو در دقیقه' دارد. لطفاً ۱ دقیقه صبر کرده و دوباره دکمه Explore را بزنید.");
      } else {
        setError(err.message || "خطایی در هنگام جستجو رخ داد. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads.map(lead => ({
      'Company Name': lead.companyName,
      'Website': lead.website,
      'Category': lead.category,
      'Phone': lead.phone,
      'Email': lead.email,
      'LinkedIn': lead.socialMedia,
      'Facebook': lead.facebook || '',
      'Instagram': lead.instagram || '',
      'Twitter': lead.twitter || '',
      'Telegram': lead.telegram || '',
      'WhatsApp': lead.whatsapp || '',
      'City': lead.city,
      'Reasoning': lead.reasoning
    })));

    // Add hyperlinks
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      // Website column (B)
      const websiteCell = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (worksheet[websiteCell]) {
        worksheet[websiteCell].l = { Target: worksheet[websiteCell].v };
      }
      // Email column (E)
      const emailCell = XLSX.utils.encode_cell({ r: R, c: 4 });
      if (worksheet[emailCell]) {
        worksheet[emailCell].l = { Target: `mailto:${worksheet[emailCell].v}` };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `ChemLeads_${chemical.replace(/\s+/g, '_')}_${region.replace(/\s+/g, '_')}.xlsx`);
  };

  const filteredLeads = filter === 'All' ? leads : leads.filter(l => l.category === filter);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-brand-black text-white sticky top-0 z-50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-brand-blue rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-brand-black border border-white/10 p-1.5 rounded-xl flex items-center justify-center overflow-hidden w-12 h-12">
                <img 
                  src={LOGO_DATA_URL} 
                  alt="MC LEAD Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight">
                MC <span className="text-brand-blue">LEAD</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand-blue animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Intelligence Engine</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium text-white/60">
              <a href="#" className="hover:text-brand-blue transition-colors">Dashboard</a>
              <a href="#" className="hover:text-brand-blue transition-colors">Analytics</a>
              <a href="#" className="hover:text-brand-blue transition-colors">History</a>
            </nav>
            <div className="h-8 w-px bg-white/10"></div>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
              Pro Account
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero / Search Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-50">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider mb-6"
              >
                <Zap className="w-3 h-3" />
                Global Lead Generation v3.0
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-display font-extrabold text-brand-black tracking-tight mb-6">
                Find your next <span className="text-brand-blue">Big Deal</span>
              </h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                Connect with manufacturers, buyers, and distributors worldwide. 
                Our AI-powered engine translates and searches across 50+ languages.
              </p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-2 rounded-2xl shadow-2xl shadow-brand-blue/5"
            >
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    type="text"
                    value={chemical}
                    onChange={(e) => setChemical(e.target.value)}
                    placeholder="Search industry, product, or URL..."
                    className="w-full bg-transparent border-none px-12 py-5 text-lg focus:ring-0 placeholder:text-zinc-400 font-medium"
                    required
                  />
                </div>
                <div className="h-10 w-px bg-zinc-200 self-center hidden md:block"></div>
                <div className="md:w-64 relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-brand-blue transition-colors" />
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-transparent border-none px-12 py-5 text-lg focus:ring-0 appearance-none cursor-pointer font-medium"
                    required
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="brand-gradient text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-brand-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Explore
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {leads.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-zinc-100 rounded-xl">
                      {['All', 'Buyer', 'Seller/Distributor', 'Manufacturer'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f as any)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            filter === f 
                              ? "bg-brand-black text-white shadow-sm" 
                              : "text-zinc-500 hover:text-zinc-900"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                  >
                    <Download className="w-4 h-4" />
                    Export Dataset
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredLeads.map((lead, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-2xl hover:shadow-brand-blue/5 hover:border-brand-blue/20 transition-all duration-500 overflow-hidden"
                    >
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-brand-blue/5 group-hover:border-brand-blue/10 transition-colors duration-500">
                              <Building2 className="w-7 h-7 text-zinc-400 group-hover:text-brand-blue transition-colors duration-500" />
                            </div>
                            <div>
                              <h3 className="text-xl font-display font-extrabold text-brand-black group-hover:text-brand-blue transition-colors duration-500">
                                {lead.companyName}
                                {lead.companyNameLocal && (
                                  <span className="block text-xs font-medium text-zinc-400 mt-1">{lead.companyNameLocal}</span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mt-1">
                                <MapPin className="w-3 h-3 text-brand-blue" />
                                {lead.city} {lead.cityLocal && `(${lead.cityLocal})`}, {lead.country}
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            lead.category.toLowerCase().includes('buyer') ? "bg-blue-50 text-blue-600 border-blue-100" :
                            lead.category.toLowerCase().includes('manufacturer') ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            "bg-brand-blue/5 text-brand-blue border-brand-blue/10"
                          )}>
                            {lead.category}
                          </div>
                        </div>

                        {lead.keyPersonnel && (
                          <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group-hover:bg-white group-hover:border-brand-blue/10 transition-all duration-500">
                            <div className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest mb-3">
                              <Users className="w-3.5 h-3.5" />
                              Strategic Personnel
                            </div>
                            <p className="text-sm text-zinc-600 leading-relaxed font-medium italic">
                              "{lead.keyPersonnel}"
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <div className="space-y-4">
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold text-zinc-500 hover:text-brand-blue transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors">
                                <Globe className="w-4 h-4" />
                              </div>
                              Official Site
                            </a>
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-3 text-sm font-bold text-zinc-500 hover:text-brand-blue transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors">
                                <Phone className="w-4 h-4" />
                              </div>
                              {lead.phone || 'Contact Request'}
                            </a>
                          </div>
                          <div className="space-y-4">
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 text-sm font-bold text-zinc-500 hover:text-brand-blue transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors">
                                <Mail className="w-4 h-4" />
                              </div>
                              Direct Email
                            </a>
                            <a href={lead.socialMedia} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-bold text-zinc-500 hover:text-brand-blue transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors">
                                <Linkedin className="w-4 h-4" />
                              </div>
                              Corporate Profile
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                          <div className="flex gap-2">
                            {[
                              { icon: Facebook, link: lead.facebook, color: 'hover:text-blue-600' },
                              { icon: Instagram, link: lead.instagram, color: 'hover:text-pink-600' },
                              { icon: Twitter, link: lead.twitter, color: 'hover:text-zinc-900' },
                              { icon: Send, link: lead.telegram, color: 'hover:text-sky-500' },
                              { icon: MessageCircle, link: lead.whatsapp, color: 'hover:text-emerald-600' }
                            ].map((social, i) => social.link && (
                              <a key={i} href={social.link.startsWith('http') ? social.link : '#'} target="_blank" rel="noopener noreferrer" className={cn("p-2.5 bg-zinc-50 rounded-xl text-zinc-400 transition-all hover:bg-white border border-transparent hover:border-zinc-200", social.color)}>
                                <social.icon className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                            Verified Lead
                            <ShieldCheck className="w-3 h-3 text-brand-blue" />
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-50">
                          <p className="text-[10px] text-zinc-400 leading-relaxed italic line-clamp-2">
                            {lead.reasoning}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {!isLoading && leads.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-brand-black mb-2">Ready to Search</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">Enter a query above to start generating high-quality leads.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-black text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden p-1">
                <img 
                  src={LOGO_DATA_URL} 
                  alt="MC LEAD Logo" 
                  className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-display font-extrabold">MC <span className="text-brand-blue">LEAD</span></span>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-white/40 text-sm">© 2026 MC Intelligence Engine. All rights reserved.</p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Developed by <span className="text-brand-blue/60">k.p</span></p>
            </div>
            <div className="flex gap-6 text-white/40 text-sm font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
