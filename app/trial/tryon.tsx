import { BrandName } from 'components/brand';
import { InferenceParams, Thumbnails } from 'lib/constants';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import Webcam from 'react-webcam';
import LoadingScreen, { GuidelinesLoader } from '~/screens/Loading';
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
      } finally {
        setPageLoading(false);
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
      }
    }
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode((prevMode) =>
      prevMode === 'user' ? { exact: 'environment' } : 'user'
    );
  }, []);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setViewMode(isCameraOn ? 'model' : 'You');
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
    // const trialProduct = products.find(
    //   (prod) => parseInt(prod.product_id) === activeProduct?.id
    // );
    setCapturedImage(null);
    setSelectedThumbnailIndex(index);
    setMainImage(Thumbnails[index]);
    // modelChange(index, trialProduct);
  };

  const handleProductChange = (siteproduct: SiteProduct) => {
    // const trialProduct = products.find(
    //   (prod) => parseInt(prod.product_id) === siteproduct.id
    // );
    setActiveProduct(siteproduct);
    // modelChange(selectedThumbnailIndex, trialProduct);
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

  if (pageLoading) {
    return <LoadingScreen />;
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
          {/* // camera capture and main Image setup with loading */}
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
              <div className='absolute bottom-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4'>
                <button
                  title='Capture Image'
                  onClick={captureImage}
                  className='bg-white/90 text-black p-4 rounded-full hover:bg-white'
                >
                  <Camera size={24} />
                </button>
                <button
                  title='Switch Camera'
                  onClick={switchCamera}
                  className='bg-white/90 text-black p-4 rounded-full hover:bg-white'
                >
                  <SwitchCamera size={24} />
                </button>
              </div>
            </>
          ) : loading ? (
            <div className='h-full w-full flex items-center justify-center relative -backdrop-brightness-50'>
              <img
                src={mainImage}
                alt='Virtual Try-on View'
                className='h-full w-full object-center aspect-auto blur-lg'
              />
              <GuidelinesLoader />
            </div>
          ) : (
            <img
              src={mainImage}
              alt='Virtual Try-on View'
              className='h-full w-full aspect-auto object-center  md:py-0'
            />
          )}

          {/* // bottom thumbnails */}
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
                disabled={isCameraOn}
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
              <h4 className='font-medium my-4 text-xl text-white'>
                Upload Photo Guidelines
              </h4>
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
