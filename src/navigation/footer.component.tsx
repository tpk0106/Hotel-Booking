const formatDate = () => new Date().toLocaleDateString();
const Footer = () => {
  return (
    <>
      <div className="flex flex-col w-full mt-2">
        <div className="flex flex-col w-full">
          <div className="flex justify-around w-[60%] m-auto md:tracking-[0.4em]">
            Hotel Book Pro
          </div>
          <div className="flex justify-around">
            {formatDate()} All rights reserved &copy; (Developed by Sampath &
            Kapila)
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
