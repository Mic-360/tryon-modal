import { motion } from 'motion/react';
import { BrandName } from 'components/brand';
import { fadeInVariants, guidelines } from 'lib/constants';
import { Loader2, X, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const LoadingScreen = ({
  setPageLoading,
}: {
  setPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center text-white bg-white dark:bg-black dark:text-black'>
      <GuidelinesLoader setPageLoading={setPageLoading} />
      <motion.div
        variants={fadeInVariants}
        initial='initial'
        animate='animate'
        className='flex items-center gap-x-2 text-md text-gray-300 dark:text-gray-400 absolute bottom-8'
      >
        <img
          src='/logo.png'
          alt='logo'
          className='h-6 w-8'
        />
        <p>
          powered by <BrandName />
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

export function GuidelinesLoader({
  setPageLoading,
}: {
  setPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 p-4 overflow-y-auto w-full'>
      <div className='relative bg-white/20 rounded-2xl p-3 sm:p-4 md:p-6 w-full max-w-[800px] mx-auto my-4'>
        <motion.button
          onClick={() => setPageLoading(false)}
          className='absolute -top-2 -right-2  text-gray-900 bg-purple-400 p-2 rounded-full'
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <XIcon className='h-6 w-6' />
        </motion.button>

        {/* Header */}
        <div className='flex items-center text-center justify-center gap-2 mb-4 max-w-md mx-auto'>
          <h2 className='text-base sm:text-lg font-semibold text-gray-100'>
            Your Tryon is ready kindly read the guidelines to get a better
            experience
          </h2>
        </div>

        {/* Main content container */}
        <div className='relative flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4'>
          {/* Left column guidelines */}
          <div className='max-w-[300px] flex flex-col gap-2 flex-1'>
            {guidelines.slice(3, 4).map((guideline, index) => (
              <div
                key={index}
                className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-105'
              >
                <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                  {guideline.title}
                </h3>
                <p className='text-xs text-gray-600'>{guideline.text}</p>
              </div>
            ))}
          </div>

          {/* Center column with image and top/bottom guidelines */}
          <div className='flex flex-col items-center gap-2 max-w-[300px]'>
            {/* Top guidelines */}
            <div className='w-full'>
              {guidelines.slice(0, 1).map((guideline, index) => (
                <div
                  key={index}
                  className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-105'
                >
                  <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                    {guideline.title}
                  </h3>
                  <p className='text-xs text-gray-600'>{guideline.text}</p>
                </div>
              ))}
            </div>

            {/* Reference Image */}
            <div className='relative aspect-[3/4] max-h-[400px]'>
              <img
                src='/model-one.png'
                alt='Reference photo showing ideal pose and lighting'
                className='w-full h-full object-center rounded-lg shadow-xl'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl' />
              <p className='absolute bottom-4 left-4 right-4 text-white text-sm text-center'>
                Follow these guidelines for the best tryon experience
              </p>
            </div>

            {/* Bottom guidelines */}
            <div className='w-full'>
              {guidelines.slice(2, 3).map((guideline, index) => (
                <div
                  key={index}
                  className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-105'
                >
                  <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                    {guideline.title}
                  </h3>
                  <p className='text-xs text-gray-600'>{guideline.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column guidelines */}
          <div className='flex flex-col gap-2 flex-1 max-w-[300px]'>
            {guidelines.slice(1, 2).map((guideline, index) => (
              <div
                key={index}
                className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-105'
              >
                <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                  {guideline.title}
                </h3>
                <p className='text-xs text-gray-600'>{guideline.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tip */}
        <div className='text-center text-xs text-gray-100 mt-4'>
          <span className='font-medium text-purple-500'>Pro tip:</span> A white or light-colored
          background is recommended for better segmentation
        </div>
      </div>
    </div>
  );
}
