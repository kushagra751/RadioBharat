import React, { useState, useEffect } from "react";
import axios from "axios";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./custom-audio-player.css"; // Import custom styles

const RadioList = () => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [trendingStations, setTrendingStations] = useState([]);

  const fallbackImage = "https://th.bing.com/th/id/OIP.Z_7A1q5v_VswgbQ0X4WW1AAAAA?w=257&h=180&c=7&r=0&o=5&pid=1.7";

  useEffect(() => {
    const trendingStationNames = [
      "Radio Mirchi Hindi", "Radio SD 90.8 FM", "Bollywood Gaane Purane",
      "Bollywood 2000", "Radio City 91.1 FM", "Radio BollyFm",
      "Radio Maharani", "Radio City Hindi", "Ishq Fm", "Fnf.Fm Hindi",
      "Radio Aashiqanaa", "Hindi Retro", "MY CLUB REMIX", "Radio Udaan",
      "Suno Sharda - 90.8FM", "Goldy Evergreen", "Bollyhitsradio",
      "Chillax FM", "Bollywood Punjabi Radio", "Mirchi Love",
      "Sudarshan News", "Bollywood 2010", "Hindi Gold Radio", "Sandesh Radio"
    ];

    axios
      .get("https://de1.api.radio-browser.info/json/stations/bycountry/india?limit=1200")
      .then((response) => {
        let stationData = response.data.filter(station => station.url_resolved);
        setStations(stationData);
        setFilteredStations(stationData);
        setTrendingStations(stationData.filter(station => trendingStationNames.includes(station.name)));
      })
      .catch((error) => console.error("Error fetching stations:", error));
  }, []);

  useEffect(() => {
    let filtered = stations;
    if (searchQuery) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(station =>
        station.tags.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    setFilteredStations(filtered);
  }, [searchQuery, selectedCategory, stations]);

  const toggleFavorite = (station) => {
    setFavorites((prevFavorites) => {
      const isFav = prevFavorites.some((fav) => fav.stationuuid === station.stationuuid);
      return isFav ? prevFavorites.filter((fav) => fav.stationuuid !== station.stationuuid) : [...prevFavorites, station];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 pb-24">
      {/* GitHub Profile Link */}
      <div className="text-center mb-4">
        <p className="text-gray-400">
          Developed by{" "}
          <a
            href="https://github.com/kushagra751"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Kushagra (GitHub)
          </a>
        </p>
      </div>

      <h1 className="text-4xl font-bold text-center mb-6">📻 Indian Live Radio</h1>
      
      <div className="flex justify-center gap-6 mb-6">
        <button className="bg-blue-600 px-4 py-2 rounded-lg" onClick={() => setFilteredStations(stations)}>
          🌎 Explore
        </button>
        <button className="bg-blue-600 px-4 py-2 rounded-lg" onClick={() => setFilteredStations(favorites)}>
          ❤ Favorites
        </button>
        <button className="bg-blue-600 px-4 py-2 rounded-lg" onClick={() => setFilteredStations(trendingStations)}>
          🔥 Trending
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search stations..."
          className="p-2 rounded-lg text-black w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="p-2 rounded-lg text-black"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">🎵 All Categories</option>
          {[...new Set(stations.flatMap(station => station.tags.split(",")).filter(tag => tag.trim() !== ""))].slice(0, 15)
            .map((category) => (
              <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredStations.length > 0 ? (
          filteredStations.map((station) => (
            <div key={station.stationuuid} className="bg-gray-800 p-4 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
              <img src={station.favicon || fallbackImage} alt="Station Logo" className="w-full h-24 object-contain rounded-lg" />
              <h2 className="text-lg font-semibold mt-3 text-center">{station.name}</h2>
              <p className="text-sm text-gray-400 text-center">{station.tags || "Unknown Genre"}</p>
              <div className="flex justify-between mt-4">
                <button onClick={() => setCurrentStation(station)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                  🎶 Play
                </button>
                <button onClick={() => toggleFavorite(station)} 
                  className={`${favorites.some(fav => fav.stationuuid === station.stationuuid) ? "bg-red-500" : "bg-gray-500"} py-2 px-4 rounded-lg`}>
                  ❤
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No stations found.</p>
        )}
      </div>

      {currentStation && (
        <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 flex items-center shadow-lg">
          <img src={currentStation.favicon || fallbackImage} alt="Station Logo" className="w-16 h-16 rounded-lg mr-4" />
          <div>
            <h2 className="text-lg font-semibold">{currentStation.name}</h2>
            <p className="text-sm text-gray-400">{currentStation.tags || "Unknown Genre"}</p>
          </div>
          <AudioPlayer
            src={currentStation.url_resolved}
            autoPlay
            showJumpControls={false}
            className="custom-audio-player"
          />
        </div>
      )}
    </div>
  ); 
};

export default RadioList;
