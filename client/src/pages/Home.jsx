import React from 'react'
import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'
import Offers from '../components/Offers'
import Features from '../components/Features'
import Testimonials from '../components/Testimonials'

const Home = () => {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <Offers />
      <Features />
      <Testimonials />
    </div>
  )
}

export default Home