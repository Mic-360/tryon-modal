import { motion } from 'motion/react';
import { BrandName } from 'components/brand';
import { fadeInVariants, guidelines } from 'lib/constants';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {

  return (
    <div className='h-screen w-screen flex flex-col items-center justify-center text-white bg-white dark:bg-black dark:text-black'>
      <div role='status'>
        <svg
          aria-hidden='true'
          className='w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-purple-400'
          viewBox='0 0 100 101'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
            fill='currentColor'
          />
          <path
            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
            fill='currentFill'
          />
        </svg>
        <span className='sr-only'>Loading...</span>
      </div>
      <motion.p
        variants={fadeInVariants}
        initial='initial'
        animate='animate'
        className='my-8 text-lg font-semibold tracking-wider text-black dark:text-white'
      >
        Loading your Virtual Try-on Experience
      </motion.p>

      <motion.div
        variants={fadeInVariants}
        initial='initial'
        animate='animate'
        className='flex items-center gap-x-2 text-md text-gray-300 dark:text-gray-400'
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


export function GuidelinesLoader() {
  return (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm flex items-center justify-center z-10 p-4 overflow-y-auto w-full'>
      <div className='bg-white rounded-2xl p-3 sm:p-4 md:p-6 w-full max-w-[800px] mx-auto my-4'>
        {/* Header */}
        <div className='flex items-center justify-center gap-2 mb-4'>
          <Loader2 className='h-5 w-5 animate-spin text-purple-500' />
          <h2 className='text-base sm:text-lg font-semibold text-gray-900'>
            Loading your Virtual Try-on Experience
          </h2>
        </div>

        {/* Main content container */}
        <div className='relative flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4'>
          {/* Left column guidelines */}
          <div className='hidden md:flex flex-col gap-2 flex-1'>
            {guidelines.slice(3, 4).map((guideline, index) => (
              <div
                key={index}
                className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105'
              >
                <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                  {guideline.title}
                </h3>
                <p className='text-xs text-gray-600'>{guideline.text}</p>
              </div>
            ))}
          </div>

          {/* Center column with image and top/bottom guidelines */}
          <div className='flex flex-col items-center gap-2 max-w-[250px]'>
            {/* Top guidelines */}
            <div className='w-full'>
              {guidelines.slice(0, 1).map((guideline, index) => (
                <div
                  key={index}
                  className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105'
                >
                  <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                    {guideline.title}
                  </h3>
                  <p className='text-xs text-gray-600'>{guideline.text}</p>
                </div>
              ))}
            </div>

            {/* Reference Image */}
            <div className='relative w-full aspect-[3/4] max-h-[300px]'>
              <img
                src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/model-one-4evVkkbgyfnHdOKzcD8BPJLoU2hR3p.png'
                alt='Reference photo showing ideal pose and lighting'
                className='w-full h-full object-cover rounded-lg shadow-lg'
              />
            </div>

            {/* Bottom guidelines */}
            <div className='w-full'>
              {guidelines.slice(2, 3).map((guideline, index) => (
                <div
                  key={index}
                  className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105'
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
          <div className='hidden md:flex flex-col gap-2 flex-1'>
            {guidelines.slice(1, 2).map((guideline, index) => (
              <div
                key={index}
                className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105'
              >
                <h3 className='font-semibold text-purple-600 mb-1 text-sm'>
                  {guideline.title}
                </h3>
                <p className='text-xs text-gray-600'>{guideline.text}</p>
              </div>
            ))}
          </div>

          {/* Mobile-only guidelines (shown in a column) */}
          <div className='flex flex-col gap-2 md:hidden w-full'>
            {guidelines
              .slice(1, 2)
              .concat(guidelines.slice(3, 4))
              .map((guideline, index) => (
                <div
                  key={index}
                  className='bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100'
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
        <div className='text-center text-xs text-gray-500 mt-4'>
          <span className='font-medium'>Pro tip:</span> A white or light-colored
          background is recommended for better segmentation
        </div>
      </div>
    </div>
  );
}
