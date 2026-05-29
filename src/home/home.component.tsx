import bgImage from "../assets/avani-gallery-overview.jpg";

const Home = () => {
  return (
    <>
      <div
        className="inset-0 m-auto w-[98.5vw] h-[36.5vw] bg-cover bg1-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          zIndex: -1, // Ensures it stays behind your content
        }}
      ></div>
    </>
  );
};

export default Home;
