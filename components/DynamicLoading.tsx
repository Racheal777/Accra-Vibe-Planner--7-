import React, { useState, useEffect } from 'react';
import { TrotroAnimation, CarAnimation, OkadaAnimation, BusAnimation, WalkingPersonAnimation } from './LoadingAnimations';
import { Logo } from './Logo';

const animationScenarios = [
  {
    vehicle: 'Trotro',
    animation: <TrotroAnimation />,
  },
  {
    vehicle: 'Ride-share',
    animation: <CarAnimation />,
  },
  {
    vehicle: 'Okada',
    animation: <OkadaAnimation />,
  },
  {
    vehicle: 'Bus',
    animation: <BusAnimation />,
  },
  {
    vehicle: 'Walk',
    animation: <WalkingPersonAnimation />,
  },
];

const loadingTexts = [
  "Halt! The planner has detected a massive roadblock: a Saturday wedding reception is blocking the entire street.  Recalculating the plan to bypass all the aso-ebi and jollof queues. Just a moment, please!",

  "Panic mode! The device we use to plan has 2% battery.   Finding the nearest charging port now!   Once fully charged (and the music is sorted), your low-battery-friendly plan will appear.",

  'Ama: "Are we on time?" Kofi: "Ah, don\'t worry, Chale.   We are running on Ghana Man Time (GMT).   The plan will be ready exactly when it feels ready. Enjoy the wait!"',

  "The Vibe Planner is currently on a video call with your mother.  We are justifying your decision to go out and ensuring you eat properly. Once we get her blessing, the plan is live!",


  "Loading paused! The planner is in a heated debate over who has the better team: Kotoko or Hearts of Oak.  Once a winner is declared (or everyone gives up), your plan resumes.",

  "Small moment, Chale. Need to check my tyre pressure. We are flying this plan through the tight spots, so safety first! Prepare for an express delivery!",

  "The planner has reviewed your Vibe and is asking a crucial question:   'Are you sure you don't just want to order pizza and watch Netflix?'  We support either choice! Generating both possibilities now!",

  "Driver: 'Ah, this GPS! I know the route more than you! Just relax, Madam/Oga.  The system is calculating the shortest cut past the Mall traffic.   We will drop your Vibe plan soonest!'",

  "Chaley, where are you? Planner's Response: Oh, I'm in a car, just turning onto Oxford Street...   (Disclaimer: We haven't even taken our bath yet.  The plan is still loading!)",

  "You chose Trotro and you're in a hurry?  Hmm... Looks like somebody is new to Accra, Chale! Your plan is loading, but maybe call a Bolt next time?   Just kidding! (Mostly.)",


  "Ei, the algorithm just saw your budget and shouted ‘Charle, this be small!’ Negotiating with the vibes to stretch that cedi. Loading…......",

  "Planner just entered Labadi traffic at 6 PM. Driver says ‘no worry, we go fly top.’ Plan will land when we escape this go-slow!",
  "Your vibe is too hot, the planner had to pause and fan itself with a pure water. Cooling down… almost ready!",
  "Loading interrupted: the system is arguing with MTN over 1GB bundle. ‘Ei, why the data finish so fast?’ Plan resumes after top-up!",

  "Planner dey do ‘by-force’ small chops survey: kelewele or plantain chips? Democracy in progress, results loading…",

  "The vibe police just pulled us over: ‘License for this level of enjoyment?’ Paying  with laughter… plan cleared for takeoff!",

  // New relatable comedy lines inspired by Ghanaian Twitter vibes, including funny political takes
  "Loading glitch! The planner just tweeted 'Tweaa!' at a politician blocking the vibe route. Now it's viral—waiting for the 'Am I your coequal?!' comeback before we proceed, chale!",
  "Ei, planner dey argue like Parliament over galamsey fines. 'No mercury in the vibes!' Recalculating eco-friendly paths past the polluted spots. Hold on!",


  "Hold tight, the system just quoted 'Sika mpɛ dedɛ' while crunching your budget. Money no like noise, but your plan will shout value! Almost there.",

  "Ei, the vibe AI just saw the cybersecurity bill and whispered, 'Offensive comment? Jail?' Keeping it chill and non-political. Plan loading quietly...",

  "Your plan's stuck in Dumsor mode—power outage from budget cuts! Finding a generator spot. No worry, the vibes will light up soon!",
  "Haha, planner just challenged a ghost name in the NSA fraud list. 'You no dey exist!' Verifying real spots only. Authentic plan incoming!"
];


const DynamicLoading = () => {
  const [animation, setAnimation] = useState(() => animationScenarios[0].animation);
  const [currentText, setCurrentText] = useState('');
  const [isTextFading, setIsTextFading] = useState(false);

  useEffect(() => {
    // Select a random animation when the component mounts
    const randomAnimationIndex = Math.floor(Math.random() * animationScenarios.length);
    setAnimation(animationScenarios[randomAnimationIndex].animation);

    // Set an initial random text
    const randomTextIndex = Math.floor(Math.random() * loadingTexts.length);
    setCurrentText(loadingTexts[randomTextIndex]);

    // Change the text every 4.5 seconds for a lively feel
    const intervalId = setInterval(() => {
      setIsTextFading(true); // Start fade out

      setTimeout(() => {
        setCurrentText(prevText => {
          let newText;
          // Ensure the new text is different from the current one
          do {
            const newIndex = Math.floor(Math.random() * loadingTexts.length);
            newText = loadingTexts[newIndex];
          } while (loadingTexts.length > 1 && newText === prevText);
          return newText;
        });
        setIsTextFading(false); // Start fade in
      }, 500); // Corresponds to the transition duration
    }, 8500);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative z-10 w-full flex flex-col items-center justify-center">
      <div className="mb-6">
        <Logo
          variant="mark"
          size={56}
          className="animate-pulse"
          style={{ color: 'var(--accent-primary)' }}
        />
      </div>
      <div className="w-full h-36 overflow-x-hidden relative">
        {animation}
      </div>
      <div className="mt-8 text-center max-w-2xl mx-auto min-h-[120px] flex items-center justify-center p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-soft)] shadow-sm">
        <p className={`text-[var(--accent-primary)] font-medium text-lg md:text-xl leading-relaxed transition-opacity duration-500 ${isTextFading ? 'opacity-0' : 'opacity-100'}`}>
          {currentText}
        </p>
      </div>
    </div>
  );
};

export default DynamicLoading;