'use client';

import {motion, useScroll, useTransform} from 'framer-motion';

export default function ParallaxHero({title, subtitle, bgUrl}) {
  const {scrollY} = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 120]);

  return (
    <section className="relative h-[90vh] overflow-hidden bg-primary-900">
    {/* <section className="bg-blue-500"> */}
      <motion.img
        src={bgUrl}
        style={{y}}
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-neutral-50">
        <h1 className="mb-4 max-w-3xl text-4xl font-bold md:text-6xl">{title}</h1>
        <p className="max-w-xl text-lg md:text-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
