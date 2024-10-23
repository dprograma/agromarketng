import Image from "next/image";
import { Container } from "@/components/Container";
import heroImg from "../public/assets/img/agromarket-hero.png";

export const Hero = () => {
  return (
    <>
      <Container className="flex flex-wrap ">
        <div className="flex items-center w-full lg:w-full">
          <div className="max-w-2xl mb-8">
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-full">
          <div style={{ width: '100%' }}>
            <Image
              src={heroImg}
              height={400}
              className={"object-cover"}
              alt="Hero Illustration"
              loading="eager"
              placeholder="blur"
              priority
            />
          </div>
        </div>
      </Container>
    </>
  );
}


export default Hero;
