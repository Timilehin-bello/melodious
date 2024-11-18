"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";

export function PopularArtistCarousel() {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const popularArtists: any[] = [
    {
      imageUrl: "/images/artist.svg",
      artistName: "Chris Singer",
      shortDescription: "Award Winning musician",
    },
    {
      imageUrl: "/images/album_cover1.svg",
      artistName: "Chris Singer 2",
      shortDescription: "Award Winning musician2",
    },
    {
      imageUrl: "/images/album_cover2.svg",
      artistName: "Chris Singer 3",
      shortDescription: "Award Winning musician3",
    },
    // {
    //   imageUrl: "/images/album_cover1.svg",
    //   artistName: "Chris Singer 2",
    //   shortDescription: "Grammy Award",
    // },
    // {
    //   imageUrl: "/images/album_cover2.svg",
    //   artistName: "3 Chris Singer",
    //   shortDescription: "Soft life award",
    // },
  ];

  React.useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(popularArtists.length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState); // Clean up on unmount
    };
  }, [carouselApi]);

  return (
    <div className="flex flex-col">
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-xs"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setCarouselApi}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {popularArtists.map((_, index) => (
            <CarouselItem key={index} className="cursor-pointer">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square p-0 items-center justify-center">
                    {/* <span className="text-4xl font-semibold">{index + 1}</span> */}
                    {/* <div className="relative w-full h-full rounded-md"> */}
                    <div className="relative w-full h-full">
                      <Image
                        src={_.imageUrl}
                        alt={_.artistName}
                        fill
                        objectFit="cover"
                        objectPosition="center"
                        className="object-cover p-1 rounded-md"
                      />

                      <div className="absolute bottom-0 flex flex-col justify-center items-center backdrop-blur-0 bg-gray-900/25 p-4 w-full text-gray-200 h-20">
                        <h3 className="font-bold">{_.artistName}</h3>
                        <p className="font-semibold">{_.shortDescription}</p>
                      </div>
                      {/* </div> */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* <CarouselPrevious />
      <CarouselNext /> */}
        {/* Navigation Dots */}
        <div className="flex items-center justify-center">
          <div className="flex justify-center space-x-2 z-20">
            {Array.from({ length: totalItems }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  currentIndex === index ? "bg-[#910a43]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </Carousel>
    </div>
  );
}
