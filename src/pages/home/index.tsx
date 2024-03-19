import Navbar from '@/components/nav';
import { HoverEffect } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { projects } from '@/lib/const';
import React from 'react';



const Homepage = () => {
  return (
    <div className='bg-black min-h-screen p-8'>
      <div className='container mx-auto'>
        <Navbar />
        <Separator />
        <div className='max-w-5xl mx-auto px-8'>
          <HoverEffect items={projects} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;