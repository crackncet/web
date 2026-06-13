import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <main className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-background">
        
        {/* Background Clouds Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/clouds.png" 
            alt="Soft Clouds Background" 
            fill 
            sizes="100vw"
            className="object-cover object-bottom opacity-80 mix-blend-multiply dark:mix-blend-screen" 
            priority
          />
          {/* Gradients to seamlessly blend the image into the background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-6 -mt-16">
          
          {/* Giant 404 Text sinking into the clouds */}
          <div className="relative flex justify-center w-full">
            <h1 
              className="text-[12rem] md:text-[22rem] font-extrabold tracking-tighter text-primary/70 leading-none select-none"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)"
              }}
            >
              404
            </h1>
          </div>

          <div className="flex flex-col items-center text-center z-20 -mt-12 md:-mt-24">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Sorry, that page could not be found
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10">
              The requested page either doesn't exist or you don't have access to it.
            </p>
            <Link href="/">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                Go Back Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
