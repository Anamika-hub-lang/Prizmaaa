import { Link } from 'react-router-dom'
import { Globe, Mail, Share2 } from 'lucide-react'
import { BrandLogo, BRAND_NAME } from '../brand/BrandLogo'

export function FooterLight() {
  return (
    <footer className="bg-educture-cream border-t border-orange-100/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        <div>
          <BrandLogo to="/" size="md" className="mb-3" />
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            A student hub to connect with peers and seniors, share experiences, discover opportunities, and grow together.
          </p>
        </div>
        <div>
          <p className="font-bold text-xs uppercase mb-3 tracking-wider text-gray-800">Explore</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/classes" className="hover:text-educture-orange">Online classes</Link></li>
            <li><Link to="/counselling" className="hover:text-educture-orange">Career counselling</Link></li>
            <li><Link to="/about" className="hover:text-educture-orange">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-xs uppercase mb-3 tracking-wider text-gray-800">Company</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="/about" className="hover:text-educture-orange">About Us</Link></li>
            <li><Link to="/about#contact" className="hover:text-educture-orange">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-xs uppercase mb-3 tracking-wider text-gray-800">Account</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li><Link to="/sign-in" className="hover:text-educture-orange">Sign in</Link></li>
            <li><Link to="/student" className="hover:text-educture-orange">Student space</Link></li>
            <li><Link to="/teacher" className="hover:text-educture-orange">Mentor on {BRAND_NAME}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-orange-100 px-4 py-4 flex flex-wrap justify-between gap-4 max-w-7xl mx-auto text-xs text-gray-500">
        <span>© 2024 {BRAND_NAME}. Your journey. Your people.</span>
        <div className="flex gap-2">
          {[Share2, Globe, Mail].map((Icon, i) => (
            <span key={i} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white">
              <Icon className="w-4 h-4" />
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

export function FooterDark() {
  return <FooterLight />
}
