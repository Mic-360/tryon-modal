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
import { InferenceParams, Products, Thumbnails } from 'lib/constants';
import Webcam from 'react-webcam';
import LoadingScreen from '~/screens/Loading';
import { useSearchParams } from 'react-router';
import imageCompression from 'browser-image-compression';

const VirtualTryOn = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [searchParams] = useSearchParams();

  console.log(searchParams.get('productId'));
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     const response = await fetch(
  //       `https://api.example.com/products/${searchParams.get('businessId')}`
  //     );
  //     const data = await response.json(); // src of all images, id, type, link to the product
  //     // setProducts(data);
  //     console.log(data);
  //   };
  //   fetchProducts();
  // }, [searchParams]);

  const originalProduct = () => {
    if (searchParams.get('productId')) {
      const product = Products.find(
        (product) =>
          product.id === parseInt(searchParams.get('productId') as string)
      );
      return product;
    }
  };

  const categories = Array.from(
    new Set(Products.map((product) => product.category))
  );

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'You' | 'model'>('model');
  const [showSimilar, setShowSimilar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    originalProduct()?.category || ''
  );
  const [activeProduct, setActiveProduct] = useState(originalProduct());
  const [mainImage, setMainImage] = useState('/model-base.webp');

  const [isCameraOn, setIsCameraOn] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        compressIfNeeded(imageSrc).then((compressedImage) => {
          setMainImage(compressedImage);
          setViewMode('model');
          setIsCameraOn(false);
        });
      }

      async function compressIfNeeded(base64: string) {
        const data = atob(base64.split(',')[1]);
        const mime = base64.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const buf = new ArrayBuffer(data.length);
        const arr = new Uint8Array(buf);

        for (let i = 0; i < data.length; i++) {
          arr[i] = data.charCodeAt(i);
        }

        const original = new File([buf], 'temp', { type: mime });
        if (original.size > 5 * 1024 * 1024) {
          const compressed = await imageCompression(original, {
            maxSizeMB: 5,
            maxWidthOrHeight: 2560,
            useWebWorker: true,
          });
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressed);
          });
        }
        return base64;
      }
    }
  }, [mainImage]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setViewMode(isCameraOn ? 'model' : 'You');
  };

  const modelChange = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const modelImage =
        'https://newblog.alua.com/wp-content/uploads/2024/01/1.jpg';

      if (!modelImage) {
        throw new Error('Product image is undefined');
      }

      const modelBlob = await fetch(modelImage, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        cache: 'no-cache',
      }).then((res) => {
        return res.blob();
      });

      const modelBase64 = await blobToBase64(modelBlob);

      const productImage = activeProduct?.image;
      console.log(productImage, 'active');

      if (!productImage) {
        throw new Error('Product image is undefined');
      }

      const productBlob = await fetch(productImage, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        cache: 'no-cache',
      }).then((res) => {
        return res.blob();
      });

      const productBase64 = await blobToBase64(productBlob);
      console.log(productBase64);

      const sourceImage = await sendImageToServer(
        productBase64,
        modelBase64,
        selectedCategory
      );

      setMainImage(sourceImage);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const sendImageToServer = async (
    product: string,
    model: string,
    category: string
  ) => {
    const { num_inference_steps, seed, guidance_scale } = InferenceParams;

    const response = await fetch(
      `https://twinverses.in/api/v1/business/tryon`,
      {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'abcde',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          product: product,
          model: model,
          category: category,
          num_inference_steps: num_inference_steps,
          seed: seed,
          guidance_scale: guidance_scale,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return `data:image/png;base64,${data['result'].slice(2, -1)}`;
  };

  const handleThumbnailClick = (index: number) => {
    const clickedThumbnail = Thumbnails[index];
    setMainImage(clickedThumbnail);
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

  useEffect(() => {
    setTimeout(() => {
      setPageLoading(false);
    }, 2000);
  }, []);

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
                  className='w-full appearance-none border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-900'
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
                {Products.map(
                  (product) =>
                    selectedCategory === product.category && (
                      <div
                        key={product.id}
                        className='bg-white dark:bg-black shadow-md shadow-gray-500 rounded-lg overflow-hidden'
                        onClick={() => {
                          setActiveProduct(product);
                          modelChange();
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className='w-full aspect-square object-cover'
                        />
                        <div className='p-4 bg-transparent'>
                          <h4 className='text-sm text-center mb-3'>
                            {product.name}
                          </h4>
                          <button className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm'>
                            Product details
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                      </div>
                    )
                )}
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
                  className='h-16 w-16 rounded-lg overflow-hidden border-2 border-white cursor-pointer'
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
            src={originalProduct()?.image}
            alt='Product'
            className='w-full h-full object-cover'
          />
        </div>

        <h2 className='text-center font-medium text-sm'>
          {originalProduct()?.name}
        </h2>

        <button
          className='flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md py-2'
          onClick={() => window.open(`${Products[0].link}`, '_blank')}
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
          <h4 className='font-medium my-4 text-xl'>Upload Photo Guidelines</h4>
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
