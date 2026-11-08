import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { api } from './api'
import Header from './components/Header'
import Hero from './components/Hero'
import Estimator from './components/Estimator'
import Services from './components/Services'
import HowItWorks from './components/HowItWorks'
import BookingForm from './components/BookingForm'
import MyBookings from './components/MyBookings'
import Tracking from './components/Tracking'
import BeforeAfter from './components/BeforeAfter'
import Cleaners from './components/Cleaners'
import Pricing from './components/Pricing'
import Reviews from './components/Reviews'
import Areas from './components/Areas'
import Chat from './components/Chat'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import AdminLogin from './components/AdminLogin'
import { AiPlan, ContactForms } from './components/Features'

const T = {
  en: {
    book: 'Book Now',
    heroTitle: 'A cleaner home, without the hassle.',
    heroSub: 'Professional cleaning in Dubai, Abu Dhabi, Riyadh & Doha. Instant price, online booking, same-day slots and WhatsApp updates.',
    servicesHeading: 'Cleaning for every home, office & stay',
    bookingHeading: 'Book in 2 minutes',
    myBookingsHeading: 'Track, manage & rebook',
  },
  hi: {
    book: 'अभी बुक करें',
    heroTitle: 'साफ़ घर, बिना झंझट।',
    heroSub: 'दुबई, अबू धाबी, रियाद और दोहा में प्रोफ़ेशनल सफ़ाई। तुरंत कीमत, ऑनलाइन बुकिंग और WhatsApp अपडेट।',
    servicesHeading: 'हर घर, ऑफिस और ठहरने के लिए सफ़ाई',
    bookingHeading: '2 मिनट में बुक करें',
    myBookingsHeading: 'ट्रैक करें, मैनेज करें और फिर से बुक करें',
  },
  ur: {
    book: 'ابھی بک کریں',
    heroTitle: 'صاف گھر، بغیر کسی پریشانی کے۔',
    heroSub: 'دبئی، ابوظہبی، ریاض اور دوحہ میں پیشہ ورانہ صفائی۔ فوری قیمت، آن لائن بکنگ اور واٹس ایپ اپڈیٹس۔',
    servicesHeading: 'ہر گھر، دفتر اور قیام کے لیے صفائی',
    bookingHeading: '2 منٹ میں بک کریں',
    myBookingsHeading: 'ٹریک کریں، منظم کریں اور دوبارہ بک کریں',
  },
}

function Home({ t }) {
  const [services, setServices] = useState([])
  const [preset, setPreset] = useState(null)
  const [lastBooking, setLastBooking] = useState(null)
  useEffect(() => {
    api('/api/services').then((d) => setServices(d.services || [])).catch(() => setServices([
      { id: 'deep', name: 'Deep Cleaning', price: 249, unit: 'per home', desc: 'Top-to-bottom deep clean.', tag: 'Most Popular' },
      { id: 'regular', name: 'Regular Home Cleaning', price: 149, unit: 'per visit', desc: 'Weekly tidy-up.', tag: '' },
      { id: 'move', name: 'Move-In / Move-Out Cleaning', price: 299, unit: 'per home', desc: 'Landlord-approved checklist.', tag: 'Deposit-back' },
      { id: 'reno', name: 'Post-Renovation Cleaning', price: 349, unit: 'per home', desc: 'Dust and debris removal.', tag: '' },
      { id: 'airbnb', name: 'Airbnb / Short-Stay Turnover', price: 129, unit: 'per turnover', desc: 'Cleaning between guests.', tag: '' },
      { id: 'office', name: 'Office & Commercial Cleaning', price: 199, unit: 'per visit', desc: 'Offices and shops.', tag: 'Business' },
      { id: 'pet', name: 'Pet Cleaning', price: 179, unit: 'per visit', desc: 'Pet hair and odour removal.', tag: '' },
      { id: 'car', name: 'Car + Home Combo', price: 99, unit: 'add-on', desc: 'Add a car clean to any booking.', tag: 'Bundle' },
    ]))
  }, [])
  const onBook = (p) => {
    setPreset((prev) => ({ ...prev, ...p }))
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      <Hero t={t} />
      <Estimator services={services} onBook={onBook} />
      <Services services={services} onBook={onBook} t={t} />
      <HowItWorks />
      <BookingForm key={preset ? JSON.stringify(preset) : 'fresh'} services={services} preset={preset} onBooked={setLastBooking} t={t} />
      <MyBookings lastBooking={lastBooking} t={t} />
      <Tracking />
      <BeforeAfter />
      <AiPlan />
      <Cleaners />
      <Pricing />
      <Reviews />
      <Areas />
      <Chat />
      <ContactForms />
      <FAQ />
    </>
  )
}

export default function App() {
  const [lang, setLang] = useState('en')
  const [fabHidden, setFabHidden] = useState(false)
  const t = T[lang] || T.en

  // Floating Book Now hides whenever any input/select/textarea is focused
  useEffect(() => {
    const onFocus = (e) => setFabHidden(['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName))
    const onBlur = () => setFabHidden(false)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    return () => { document.removeEventListener('focusin', onFocus); document.removeEventListener('focusout', onBlur) }
  }, [])

  return (
    <>
      <Header lang={lang} setLang={setLang} t={t} />
      <main>
        <Routes>
          <Route path="/" element={<Home t={t} />} />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </main>
      <Footer />
      <a href="#booking" className={`btn fab ${fabHidden ? 'hidden' : ''}`} aria-hidden={fabHidden}>{t.book}</a>
    </>
  )
}
