// // FlashScreen.js
// import React, { useEffect, useState, useMemo } from 'react';
// import './FlashScreen.css'; // Create FlashScreen.css for styling

// const FlashScreen = () => {
//   const loadingMessages = useMemo(
//     () => [
//       'Loading the magic...',
//       'Gathering stardust...',
//       'Warping through time...',
//       'Initializing awesomeness...',
//       'Summoning unicorns...',
//       'Brewing a potion...',
//       'OMG Snehal its loading...',
//     ],
//     []
//   );

//   const [randomMessage, setRandomMessage] = useState('Loading...');

//   useEffect(() => {
//     // Randomly select a loading message
//     const randomIndex = Math.floor(Math.random() * loadingMessages.length);
//     setRandomMessage(loadingMessages[randomIndex]);
//   }, [loadingMessages]); // Include loadingMessages in the dependency array

//   return (
//     <div className="flash-screen">
//       {/* Display the random loading message */}
//       <h1>{randomMessage}</h1>
//       {/* You can add a loading spinner or any other content */}
//     </div>
//   );
// };

// export default FlashScreen;