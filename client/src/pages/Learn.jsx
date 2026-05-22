import React from 'react';

const videos = [
  {
    id: 'uH3YvVd9mBw', // Example batting drill
    title: 'Master the Cover Drive | Batting Masterclass',
    expert: 'Sachin Tendulkar',
    category: 'Batting',
  },
  {
    id: 'o_B4n4m9f_8', // Example fast bowling drill
    title: 'Fast Bowling Action & Pace Generation',
    expert: 'Brett Lee',
    category: 'Bowling',
  },
  {
    id: 'lP_8W5W-l2g', // Example spin bowling drill
    title: 'Leg Spin Masterclass: Drift, Dip, and Turn',
    expert: 'Shane Warne',
    category: 'Bowling',
  },
  {
    id: 'Q5G2i6zXq7U', // Example fielding drill
    title: 'Elite Fielding Drills for the Inner Ring',
    expert: 'Jonty Rhodes',
    category: 'Fielding',
  },
  {
    id: 'R9eT9h1XbGw',
    title: 'Playing Fast Bowling: Backfoot Punch & Pull',
    expert: 'Ricky Ponting',
    category: 'Batting',
  },
  {
    id: 'M_6M4o1a3aM',
    title: 'Wicketkeeping Techniques & Footwork',
    expert: 'MS Dhoni',
    category: 'Fielding',
  }
];

const Learn = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Learn from Experts
        </h1>
        <p className="mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Improve your game with coaching masterclasses from cricket legends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div key={video.id} className="bg-white dark:bg-dark-light rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-w-16 aspect-h-9 w-full relative pt-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cricket-light/20 text-cricket dark:text-cricket-light">
                  {video.category}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {video.expert}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learn;
