import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowUpRight,
  Save,
  ChevronDown,
  Camera,
  X,
  LoaderCircle,
} from 'lucide-react';
import { BrandName } from 'components/brand';
import { InferenceParams, Thumbnails } from 'lib/constants';
import Webcam from 'react-webcam';
import LoadingScreen from '~/screens/Loading';
import { useSearchParams } from 'react-router';
import type { Product } from '../../lib/types';
import { compressImageIfNeeded, blobToBase64 } from '../../lib/utils';
import { fetchProducts, sendImageToServer } from '../../lib/api';

const VirtualTryOn = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'You' | 'model'>('model');
  const [showSimilar, setShowSimilar] = useState(false);
  const [mainImage, setMainImage] = useState('/model-base.jpg');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<
    number | null
  >(null);

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const initializeProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        const productId = searchParams.get('productId');
        if (productId) {
          const chosenProduct = fetchedProducts.find(
            (product) => product.product_id === productId
          );
          if (chosenProduct) {
            setActiveProduct(chosenProduct);
            setSelectedCategory(chosenProduct.product_category);
          }
        } else if (fetchedProducts.length > 0) {
          setActiveProduct(fetchedProducts[0]);
          setSelectedCategory(fetchedProducts[0].product_category);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setPageLoading(false);
      }
    };

    initializeProducts();
  }, [searchParams]);

  const categories = Array.from(
    new Set(products.map((product) => product.product_category))
  );

  const videoConstraints = {
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
      }
    }
  }, []);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setViewMode(isCameraOn ? 'model' : 'You');
  };

  const modelChange = async () => {
    if (loading || !activeProduct) return;
    setLoading(true);

    try {
      let modelBase64: string;
      if (capturedImage) {
        modelBase64 = capturedImage;
      } else if (selectedThumbnailIndex !== null) {
        const thumbnailBlob = await fetch(Thumbnails[selectedThumbnailIndex], {
          headers: { 'Access-Control-Allow-Origin': '*' },
          cache: 'no-cache',
        }).then((res) => res.blob());
        modelBase64 = await blobToBase64(thumbnailBlob);
      } else {
        const modelImage =
          '/model-one.jpg';
        const modelBlob = await fetch(modelImage, {
          headers: { 'Access-Control-Allow-Origin': '*' },
          cache: 'no-cache',
        }).then((res) => res.blob());
        modelBase64 = await blobToBase64(modelBlob);
      }

      const productBlob = await fetch(activeProduct.product_image, {
        headers: { 'Access-Control-Allow-Origin': '*' },
        cache: 'no-cache',
      }).then((res) => res.blob());
      const productBase64 = await blobToBase64(productBlob);

      const sourceImage = await sendImageToServer(
        productBase64,
        modelBase64,
        selectedCategory,
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
    setSelectedThumbnailIndex(index);
    setCapturedImage(null);
    setMainImage(Thumbnails[index]);
    modelChange();
  };

  const handleProductChange = (product: Product) => {
    setActiveProduct(product);
    modelChange();
  };

  const handleSave = useCallback(() => {
    const link = document.createElement('a');
    link.href = mainImage;
    link.download = 'twinverse-twintry-tryon.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [mainImage]);

  if (pageLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      <AnimatePresence>
        {showSimilar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className='w-80 dark:bg-black p-6 border-r overflow-hidden flex flex-col'
          >
            <div className='mb-6'>
              <label className='block text-xl mb-2'>Category</label>
              <div className='relative'>
                <select
                  title='Category'
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className='w-full appearance-none border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-900 capitalize'
                >
                  {categories.map((category) => (
                    <option
                      key={category}
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
                {products
                  .filter(
                    (product) => product.product_category === selectedCategory
                  )
                  .map((product) => (
                    <div
                      key={product.product_id}
                      className='bg-white dark:bg-black shadow-md shadow-gray-500 rounded-lg overflow-hidden cursor-pointer'
                      onClick={() => handleProductChange(product)}
                    >
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className='w-full aspect-square object-cover'
                      />
                      <div className='p-4 bg-transparent'>
                        <h4 className='text-sm text-center mb-3'>
                          {product.product_name}
                        </h4>
                        <button className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm'>
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
        <div className='absolute top-4 left-4 z-10'>
          <img
            src='/logo.png'
            alt='Twinverse Logo'
            className='h-20 p-4'
          />
        </div>

        {!showSimilar && (
          <motion.div
            className='absolute top-4 right-4 z-10 bg-black/80 rounded-full p-1 flex gap-1'
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
              onClick={() => setViewMode('model')}
            >
              Model
            </button>
          </motion.div>
        )}

        <div className='h-full w-full relative'>
          {isCameraOn ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat='image/jpeg'
                videoConstraints={videoConstraints}
                className='h-full w-full object-cover'
              />
              <button
                title='Capture Image'
                onClick={captureImage}
                className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 text-black p-4 rounded-full hover:bg-white'
              >
                <Camera size={24} />
              </button>
            </>
          ) : loading ? (
            <div className='h-full w-full flex items-center justify-center relative'>
              <img
                src={mainImage}
                alt='Virtual Try-on View'
                className='h-full w-full object-cover blur-lg'
              />
              <div className='absolute top-50 left-50 items-center justify-center flex flex-col gap-2'>
                <LoaderCircle
                  size={64}
                  className='animate-spin'
                />
                <p className='text-black dark:text-white text-xl font-medium'>
                  Please Wait ...
                </p>
              </div>
            </div>
          ) : (
            <img
              src={mainImage}
              alt='Virtual Try-on View'
              className='h-full w-full object-cover'
            />
          )}

          {!showSimilar && (
            <button
              onClick={handleSave}
              className='absolute bottom-4 right-4 flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-lg'
            >
              <Save size={20} />
              Save
            </button>
          )}

          <div className='absolute bottom-4 left-4 flex gap-2'>
            {!showSimilar &&
              Thumbnails.map((thumbnail, index) => (
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
                    className='h-full w-full object-cover'
                  />
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      <motion.div
        className='w-80 bg-black p-6 flex flex-col gap-4'
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <button
          className='bg-purple-500 text-white text-center py-2 rounded-md'
          onClick={() => modelChange()}
        >
          Try On You
        </button>

        <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
          <img
            src={activeProduct?.product_image}
            alt='Product'
            className='w-full h-full object-cover'
          />
        </div>

        <h2 className='text-center font-medium text-sm text-white'>
          {activeProduct?.product_name}
        </h2>

        <button
          className='flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md py-2 text-white'
          onClick={() =>
            activeProduct && window.open(activeProduct.product_page, '_blank')
          }
        >
          Buy Now
          <ArrowUpRight size={18} />
        </button>

        <button
          className='w-full border border-purple-500 text-white py-2 rounded-md'
          onClick={() => setShowSimilar(!showSimilar)}
        >
          {showSimilar ? 'Hide Similar Products' : 'Show Similar Products'}
        </button>

        <div className='mt-auto'>
          <h4 className='font-medium my-4 text-xl text-white'>
            Upload Photo Guidelines
          </h4>
          <ul className='text-sm text-gray-400 space-y-1'>
            <li>🗃️ File Size: Less than 15 MB.</li>
            <li>🧍 Photo Type: Standing photo with only one person.</li>
            <li>🌟 Background: Keep it clean and free of distractions.</li>
          </ul>
        </div>

        <div className='text-center text-sm text-gray-400 flex items-center justify-center gap-2'>
          <p>powered by</p> <BrandName />
        </div>
      </motion.div>
    </div>
  );
};

export default VirtualTryOn;
