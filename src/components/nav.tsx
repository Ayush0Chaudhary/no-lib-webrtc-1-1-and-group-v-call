const Navbar = () => {
  return (
    <nav className='bg-white shadow-lg w-full'>
      <div className='container mx-auto px-4 py-2 md:flex md:items-center md:justify-between'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center flex-shrink-0 text-white mr-6'>
            {/* Replace the URL with your logo image */}
            <span className='font-semibold text-xl ml-2 text-black'>Fly-Back WebRTC Testing</span>
          </div>
        </div>
        {/* <div className='md:flex items-center'>
          <div className='md:ml-4'>Contact Us</div>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
