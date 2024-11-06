import { useState, useEffect, useRef } from "react";

const LazyImage = ({ src, alt, className, ...props }: { src: string; alt: string; className?: string }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const handleImageLoad = () => {
            if (imgRef.current) {
                imgRef.current.src = src;
                imgRef.current.classList.remove("opacity-0");
                imgRef.current.classList.add("duration-500", "opacity-100");
                delete imgRef.current.dataset.lazy;

                setTimeout(() => {
                    imgRef.current?.classList.remove("duration-500");
                }, 500);
            }
            setIsLoaded(true);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isLoaded) {
                        const img = new Image();
                        img.src = src;
                        img.onload = handleImageLoad;
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) observer.unobserve(imgRef.current);
        };
    }, [src, isLoaded]);

    useEffect(() => {
        setIsLoaded(false);
    }, [src, alt, className]);

    return (
        <>
            <img ref={imgRef} alt={alt} className={`opacity-0 ${className}`} data-lazy={src} {...props} />
            <noscript>
                <img src={src} alt={alt} loading="lazy" {...props} className={className} />
            </noscript>
        </>
    );
};

export default LazyImage;
