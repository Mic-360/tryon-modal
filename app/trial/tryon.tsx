import { BrandName } from 'components/brand';
import { fadeInVariants, InferenceParams, Thumbnails } from 'lib/constants';
import {
  ArrowUpRight,
  Camera,
  ChevronDown,
  Cross,
  Menu,
  Save,
  SwitchCamera,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import Webcam from 'react-webcam';
import LoadingScreen from '~/screens/Loading';
import {
  fetchProducts,
  fetchSiteProductImages,
  sendImageToServer,
} from '../../lib/api';
import type { Product, SiteProduct } from '../../lib/types';
import { blobToBase64, compressImageIfNeeded } from '../../lib/utils';

const VirtualTryOn = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [siteProducts, setSiteProducts] = useState<SiteProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeProduct, setActiveProduct] = useState<SiteProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'You' | 'model' | 'Upload'>('model');
  const [showSimilar, setShowSimilar] = useState(false);
  const [view, setView] = useState(true);
  const [mainImage, setMainImage] = useState('/model-base.jpg');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<
    number | null
  >(0);

  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<
    'user' | { exact: 'environment' }
  >('user');

  // New state variables for the timer
  const [timer, setTimer] = useState<number | null>(null);
  const [selectedTimerValue, setSelectedTimerValue] = useState<number | null>(
    null
  );

  useEffect(() => {
    const initializeProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();

        setProducts(fetchedProducts);

        const productId = searchParams.get('productId');

        const nudeSiteProducts = await fetchSiteProductImages(fetchedProducts);

        setSiteProducts(nudeSiteProducts);

        if (productId) {
          const chosenProduct = nudeSiteProducts.find(
            (product: SiteProduct) => product.id == parseInt(productId)
          );
          if (chosenProduct) {
            setActiveProduct(chosenProduct);
            setSelectedCategory(chosenProduct.product_type);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    initializeProducts();
  }, [searchParams]);

  const categories = Array.from(
    new Set(siteProducts.map((nudeProd: SiteProduct) => nudeProd.product_type))
  );

  const videoConstraints: {
    width: number;
    height: number;
    facingMode: string | { exact: string };
  } = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const captureImage = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const compressedImage = await compressImageIfNeeded(imageSrc);
        setCapturedImage(compressedImage);
        setMainImage(compressedImage);
        setViewMode('model');
        setIsCameraOn(false);
        setSelectedThumbnailIndex(null);
        setTimer(null); // Reset timer after capturing
        setSelectedTimerValue(null);
      }
    }
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode((prevMode) =>
      prevMode === 'user' ? { exact: 'environment' } : 'user'
    );
  }, []);

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
    setViewMode(isCameraOn ? 'model' : 'You');
    setTimer(null); // Reset timer when toggling camera
    setSelectedTimerValue(null);
  };

  const modelChange = async (
    index: number | null,
    currentProduct: Product | undefined
  ) => {
    if (loading) return;
    setLoading(true);

    try {
      let modelBase64: string = '';

      if (capturedImage) {
        modelBase64 = capturedImage;
      } else {
        const thumbnailBlob = await fetch(Thumbnails[index || 0]).then((res) =>
          res.blob()
        );
        modelBase64 = await blobToBase64(thumbnailBlob);
      }

      const productBlob = await fetch(currentProduct?.product_image || '', {
        cache: 'no-cache',
      }).then((res) => res.blob());

      const productBase64 = await blobToBase64(productBlob);

      const sourceImage = await sendImageToServer(
        productBase64,
        modelBase64,
        currentProduct?.product_type || 'upper',
        InferenceParams
      );

      setMainImage(sourceImage);
    } catch (error) {
      console.error('Error during model change:', error);
      alert('An error occurred while processing the image.');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCapturedImage(null);
    setSelectedThumbnailIndex(index);
    setMainImage(Thumbnails[index]);
  };

  const handleProductChange = (siteproduct: SiteProduct) => {
    setActiveProduct(siteproduct);
    setShowSimilar(false);
    setView(true);
  };

  const handleTryOn = () => {
    const trialProduct = products.find(
      (prod) => parseInt(prod.product_id) === activeProduct?.id
    );
    if (selectedThumbnailIndex) {
      modelChange(selectedThumbnailIndex, trialProduct);
    } else {
      modelChange(null, trialProduct);
    }
  };
  const handleSave = useCallback(() => {
    const link = document.createElement('a');
    link.href = mainImage;
    link.download = 'twinverse-twintry-tryon.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [mainImage]);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressedImage = await compressImageIfNeeded(base64String);
        setCapturedImage(compressedImage);
        setMainImage(compressedImage);
        setViewMode('model');
        setIsCameraOn(false);
        setSelectedThumbnailIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to start the timer
  const startTimer = (seconds: number) => {
    setSelectedTimerValue(seconds);
    setTimer(seconds);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (timer && timer > 0 && isCameraOn && facingMode === 'user') {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => (prevTimer ? prevTimer - 1 : null));
      }, 1000);
    } else if (timer === 0 && isCameraOn && facingMode === 'user') {
      captureImage();
      setTimer(null);
      setSelectedTimerValue(null);
    }

    return () => clearInterval(intervalId);
  }, [timer, isCameraOn, captureImage, facingMode]);

  if (pageLoading) {
    return <LoadingScreen setPageLoading={setPageLoading} />;
  }

  return (
    <div className='flex h-full bg-gray-50'>
      {/* //left sidebar */}
      <AnimatePresence>
        {showSimilar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className='h-full absolute sm:static top-0 left-0 z-20 w-64 md:w-80 dark:bg-black p-6 border-r overflow-hidden flex flex-col'
          >
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <label className='block text-xl mb-2'>Category</label>{' '}
                <Cross
                  size={20}
                  onClick={() => {
                    setShowSimilar(false);
                    setView(true);
                  }}
                  className='rotate-45'
                />
              </div>
              <div className='relative'>
                <select
                  title='Category'
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className='w-full appearance-none border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-900 capitalize'
                >
                  {categories.map((category, idx) => (
                    <option
                      key={idx}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'
                  size={16}
                />
              </div>
            </div>

            <div className='flex-1 overflow-y-auto'>
              <h3 className='font-medium mb-4'>Products Recommended</h3>
              <div className='space-y-6'>
                {siteProducts
                  .filter(
                    (siteProds: SiteProduct) =>
                      siteProds.product_type === selectedCategory
                  )
                  .map((siteProds: SiteProduct, idx: number) => (
                    <div
                      key={idx}
                      className='bg-white dark:bg-black shadow-md shadow-gray-500 rounded-lg overflow-hidden cursor-pointer'
                      onClick={() => handleProductChange(siteProds)}
                    >
                      <img
                        src={siteProds.images[0].src}
                        alt={siteProds.title}
                        className='w-full aspect-square object-center'
                      />
                      <div className='p-4 bg-transparent'>
                        <h4 className='text-sm text-center mb-3'>
                          {siteProds.title}
                        </h4>
                        <button
                          className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm'
                          onClick={() =>
                            window.open(
                              `https://shopatnude.com/collections/all-products/products/${siteProds.handle}`,
                              '_blank'
                            )
                          }
                        >
                          Product details
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex-1 relative'>
        {/* // top buttons upload model and you  */}
        {!showSimilar && (
          <motion.div
            className='absolute top-8 left-1/2 transform -translate-x-1/2 z-10 bg-black/80 rounded-full p-1 flex gap-1'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                isCameraOn ? 'bg-white text-black' : 'text-white'
              }`}
              onClick={toggleCamera}
            >
              {isCameraOn ? <X size={15} /> : <Camera size={15} />}
              {isCameraOn ? 'Stop' : 'You'}
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                viewMode === 'model' ? 'bg-white text-black' : 'text-white'
              }`}
              onClick={() => {
                setViewMode('model');
                setIsCameraOn(false);
              }}
            >
              Model
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                viewMode === 'Upload' ? 'bg-white text-black' : 'text-white'
              }`}
              onClick={() => {
                setViewMode('Upload');
                document.getElementById('upload-input')?.click();
              }}
            >
              Upload
            </button>
            <input
              type='file'
              id='upload-input'
              accept='image/*'
              style={{ display: 'none' }}
              title='Upload your image'
              onChange={uploadImage}
            />
          </motion.div>
        )}

        {/* // menu button for right sidebar  */}
        {!view && (
          <button
            className='absolute top-8 right-4 bg-black/80 text-white p-1 px-2 rounded-full z-10'
            onClick={() => {
              setShowSimilar(false);
              setView(true);
            }}
          >
            <span className='flex items-center gap-2 px-2'>
              <Menu size={14} /> Menu
            </span>
          </button>
        )}

        <div className='h-full w-full relative'>
          {isCameraOn ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat='image/jpeg'
                videoConstraints={{ ...videoConstraints, facingMode }}
                className='h-full w-full object-cover'
                mirrored
              />
              {/* timer buttons */}
              <div className='absolute bottom-1/4 right-0 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2'>
                {[5, 10, 15].map((seconds) => (
                  <button
                    key={seconds}
                    title={`Set timer for ${seconds} seconds`}
                    onClick={() => startTimer(seconds)}
                    className={` bg-black/80 text-white p-4 rounded-full hover:bg-white hover:text-black ${
                      selectedTimerValue === seconds ? 'bg-purple-400' : ''
                    }`}
                  >
                    {seconds}
                  </button>
                ))}
              </div>

              {/* // timer  */}
              {timer !== null && timer >= 0 && (
                <motion.div
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold'
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 2.5 }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {timer}
                </motion.div>
              )}

              {/* // camera buttons */}
              <div className='absolute bottom-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4'>
                <div className='flex gap-4'>
                  <button
                    title='Capture Image'
                    onClick={captureImage}
                    className='bg-black/80 text-white p-4 rounded-full hover:bg-white hover:text-black'
                    disabled={timer !== null && timer > 0}
                  >
                    <Camera size={24} />
                  </button>
                  <button
                    title='Switch Camera'
                    onClick={switchCamera}
                    className='bg-black/80 text-white p-4 rounded-full hover:bg-white hover:text-black'
                  >
                    <SwitchCamera size={24} />
                  </button>
                </div>
              </div>
            </>
          ) : loading ? (
            <div className='h-full w-full flex items-center justify-center relative -backdrop-brightness-50'>
              <img
                src={mainImage}
                alt='Virtual Try-on View'
                className='h-full w-full object-center aspect-auto blur-xl brightness-50'
              />
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4'>
                <div
                  role='status'
                  className='relative'
                >
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
                  <img
                    src='/logo.png'
                    alt='logo'
                    className='h-6 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                  />
                </div>

                <motion.div
                  variants={fadeInVariants}
                  initial='initial'
                  animate='animate'
                  className='flex  text-md text-gray-100 text-center'
                >
                  <p>Loading Your Tryon Image Please Wait ...</p>
                </motion.div>
              </div>
            </div>
          ) : (
            <img
              src={mainImage}
              alt='Virtual Try-on View'
              className='h-full w-full aspect-auto object-center  md:py-0'
            />
          )}

          {/* // bottom thumbnails */}
          {viewMode === 'model' && !isCameraOn && (
            <div className='absolute bottom-4 left-4 flex gap-2'>
              {Thumbnails.map((thumbnail, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                    selectedThumbnailIndex === index
                      ? 'border-purple-500'
                      : 'border-white'
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={thumbnail}
                    alt={`View ${index + 1}`}
                    className='h-full w-full aspect-auto object-center'
                  />
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'model' && !isCameraOn && (
            <div className='absolute bottom-6 right-4'>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={
                  'rounded-lg overflow-hidden cursor-pointer flex justify-center'
                }
              >
                <button
                  className='bg-purple-500 text-white text-center py-2 px-4 shadow-lg transform transition-transform hover:scale-95 hover:shadow-xl rounded-lg flex items-center justify-center gap-x-2 text-xl font-medium border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-200'
                  onClick={() => handleTryOn()}
                >
                  Try On{' '}
                  <img
                    src='/logo.png'
                    alt='logo'
                    className='h-6 w-8 p-1 inline-block'
                  />
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* // right sidebar  */}
      <AnimatePresence>
        {view && (
          <motion.div
            className='h-full absolute sm:static top-0 right-0 z-20 w-64 md:w-80 bg-black p-6 flex flex-col gap-4'
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <div className='flex gap-x-4 justify-between'>
              <button
                onClick={handleSave}
                className='flex items-center justify-center gap-2 w-full border border-gray-300 text-lg rounded-md py-2 text-white'
              >
                <Save size={14} />
                Save
              </button>
              <button
                className='bg-red-500 w-1/3 sm:hidden text-white text-center p-1 rounded-md'
                onClick={() => setView(false)}
              >
                Close
              </button>
            </div>

            <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
              <img
                src={activeProduct?.images[0].src}
                alt='Product'
                className='w-full aspect-square object-center'
              />
            </div>

            <h2 className='text-center font-medium text-sm text-white'>
              {activeProduct?.title}
            </h2>

            <button
              className='flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md py-2 text-white'
              onClick={() =>
                activeProduct &&
                window.open(
                  `https://shopatnude.com/collections/all-products/products/${activeProduct.handle}`,
                  '_blank'
                )
              }
            >
              Buy Now
              <ArrowUpRight size={18} />
            </button>

            <button
              className='w-full border border-purple-500 text-white py-2 rounded-md'
              onClick={() => {
                setView(false);
                setShowSimilar(!showSimilar);
              }}
            >
              {showSimilar ? 'Hide Similar Products' : 'Show Similar Products'}
            </button>

            <div className='mt-auto'>
              <p className='font-medium my-4 text-start text-xl text-white'>
                Upload Photo Guidelines
              </p>
              <ul className='text-sm text-gray-400 space-y-1'>
                <li>🗃️ File Size: Less than 15 MB.</li>
                <li>🧍 Photo Type: Standing photo with only one person.</li>
                <li>🌟 Background: Keep it clean and free of distractions.</li>
                <li>⚠️ Photo Issues: Try to avoid Green clothes.</li>
              </ul>
            </div>

            <div className='text-center text-sm text-gray-400 flex items-center justify-center gap-x-2'>
              <img
                src='/logo.png'
                alt='logo'
                className='h-6 w-8'
              />
              <p>
                powered by <BrandName />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualTryOn;
