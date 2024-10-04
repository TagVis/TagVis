export const ErrorPage = () => {
  return (
    <>
      <div className="flex justify-center items-center">
        <section className="bg-white mt-[120px] my-[50px]">
          <div
            className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6"
            data-aos="fade-up"
          >
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="mb-4 text-7xl tracking-tight font-extrabold md:text-8xl lg:text-[200px] text-red-600">
                404
              </h1>
              <p className="mb-4 text-3xl tracking-tight font-bold text-black md:text-4xl lg:text-6xl">
                That page doesnt exist.
              </p>
              <a
                href="/"
                className="inline-flex text-white bg-purple-500 hover:bg-purple-800 font-medium rounded-lg lg:text-2xl px-5 py-2.5 text-center my-4"
              >
                Back to Mainpage
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
