import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const images = [
    {
        src: '/images/jo1.jpg',
        title: 'Cérémonie d’ouverture',
        subtitle: 'Un spectacle unique sur la Seine',
    },
    {
        src: '/images/jo2.jpg',
        title: 'Les épreuves phares',
        subtitle: 'Natation, athlétisme, gymnastique...',
    },
    {
        src: '/images/jo3.jpg',
        title: 'Billetterie en ligne',
        subtitle: 'Réservez dès maintenant vos places',
    },
];

const Carousel = () => {
    return (
        <div className="w-full max-w-5xl mx-auto rounded overflow-hidden shadow-xl">
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                spaceBetween={0}
                effect="fade"
                centeredSlides
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation
                className="relative"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full h-[600px] overflow-hidden group">
                            <div className="w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105">
                                <img
                                    src={image.src}
                                    alt={image.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white text-center px-4">
                                <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">{image.title}</h2>
                                <p className="text-lg drop-shadow-md">{image.subtitle}</p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carousel;
