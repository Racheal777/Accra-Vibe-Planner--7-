import { GoogleGenAI } from '@google/genai';
import type { HangoutParams, Vibe, Location } from '../types';
import { AI } from '../config/appConfig';

const geminiApiKey = process.env.API_KEY;

if (!geminiApiKey) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey! });
const model = AI.model;

const commonInstructions = `
  ROLE: You are "The Accra Vibe Planner", an expert local guide for Accra, Ghana.
  GOAL: Generate creative, fun, and achievable hangout plans tailored to user preferences.
  TONE: Energetic, fun, witty, and like a knowledgeable local. Use local flavor and slang where appropriate.
  CONSTRAINTS:
  - Be Comprehensive: Your suggestions should be diverse. Include popular mainstream spots but also unique, timely events you find through your search.
  - Quality: CRITICAL: Suggest only highly-rated places known for good customer service, with a Google Maps rating of 3.9 stars or higher. If a suitable place with a rating this high cannot be found, you can make an exception, but it must be clearly justified in the description.
  - EXCLUSIONS: Do NOT suggest the "Legon Botanical Gardens" as it is currently reported as closed for general visits.
  - Format: The output must be structured exactly as requested below. Do not use asterisks or markdown bold/italics. Use simple text and lists.
`;

export async function generatePlanOptions(params: HangoutParams): Promise<string> {
    const { vibe, timeWindow, budget, audience, location, proximity, timing, dateMeal, specificDateTime, groupSize, travelPreference, mustHaves, planningMode } = params;

    const vibeExplanation: Record<Vibe, string> = {
      'Relax & Unwind': "This means the user wants a low-key, calm experience. Think quiet cafes, library visits, spa days, or just a cheap and chill hangout.",
      'Food & Nightlife': "The user is looking for great food or a fun night out. Suggest top-rated restaurants, cool bars with live music, brunch spots, etc. Use Google Search to find the best options.",
      'Rich Kids Sports': "The user wants to engage in sophisticated or less common sports. Suggest places for activities like tennis, badminton, pilates, swimming, golf, horse riding, or yoga. Look for sports clubs, specialized studios, or high-end recreational facilities.",
      'Active & Adventure': "Suggest something energetic like go-karting, paintball, hiking, beach sports, tennis,  or dance classes. places like university of ghana sports complex",
      'Movies & Plays': "The user wants to see a movie or a live performance. Find current movie listings at popular cinemas. For live performances, plays, comedy shows, and other ticketed events, consult https://egotickets.com/events/happening-in-ghana and especially https://rovermanproductions.com/ for high-quality stage plays by Uncle Ebo Whyte. This requires timely, event-based information.",
      'Romantic Date': "This is for a romantic date. Prioritize places with a cozy, intimate ambiance, excellent customer service, and a great atmosphere for conversation. The user has specified if it's for breakfast, lunch, or dinner.",
      'Picnic & Parks': "The user wants a picnic. Suggest specific, neat, and quiet parks or beaches suitable for a picnic. This option needs extra details.",
      '': "No vibe selected."
    };
  
    let proximityInstruction = '';
    if (proximity === 'close') {
        proximityInstruction = "Crucial Constraint: The suggestions MUST be very close (e.g., within a 5-10 minute drive) to the user's coordinates. Prioritize proximity above all else for this request.";
    }
    
    let timingInstruction = '';
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
  
    if (timing === 'Right Now!') {
      timingInstruction = `Crucial Context: The user wants to go "Right Now!". The current time is approximately ${formattedTime}. Please factor this in. Suggest places that are likely open and accessible at this moment. Also, consider the typical traffic patterns in Accra for this specific time and day. CRITICAL CONSTRAINT: Do NOT suggest any venue that is likely to be closed at this time. Use your web search to verify opening hours.`;
    } else if (timing === 'Later Today' && specificDateTime) {
        timingInstruction = `Crucial Context: The user wants to go "Later Today" at approximately ${specificDateTime}. Suggest places that will be open and appropriate for that time. Verify opening hours.`;
    } else if (timing === 'Sometime This Week' && specificDateTime) {
        try {
          const date = new Date(specificDateTime);
          const formattedDateTime = date.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });
          timingInstruction = `Crucial Context: The user wants to go on ${formattedDateTime}. The plan should include forward-looking advice relevant to this specific day and time. For instance, the "Pro-Tip" should contain information relevant to planning ahead, such as "It's best to book a table for weekend evenings" or "Check their Instagram page for live music schedules before you go." Verify opening hours for this specific day and time.`;
        } catch (e) {
           timingInstruction = `Crucial Context: The user wants to go 'Sometime This Week' around this time: ${specificDateTime}. Factor this into your suggestions.`;
        }
    } else if (timing === 'Sometime This Week') {
        timingInstruction = `Crucial Context: The user wants to go 'Sometime This Week'. The plan should include forward-looking advice. For instance, the "Pro-Tip" should contain information relevant to planning ahead, such as "It's best to book a table for weekend evenings" or "Check their Instagram page for live music schedules before you go."`;
    }
    
    const dateMealInstruction = vibe === 'Romantic Date' && dateMeal ? `- Date Meal: It's for ${dateMeal}.` : '';
  
    const picnicInstructions = vibe === 'Picnic & Parks' 
      ? `11. A "Picnic Essentials" section with a bulleted list of items to bring and suggested activities (maximum of 4 bullet points).`
      : '';
    
    const picnicFormat = vibe === 'Picnic & Parks'
      ? `Picnic Essentials:
  - [Bulleted list item 1 for essentials]
  - [Bulleted list item 2 for essentials]
  - [Bulleted list item 3 for essentials]
  - [Bulleted list item 4 for essentials]`
      : '';
      
    const when = specificDateTime
      ? `${timing} (Specifically: ${specificDateTime})`
      : timing;
      
    let audienceInstruction = `- Who's going: ${audience}`;
    if (audience === 'Solo Mission') {
      audienceInstruction += "\nThis is a solo trip. Suggest places that are welcoming to individuals, safe, and where a person can comfortably enjoy themselves alone. Think cafes with good seating, counter-service restaurants, museums, or activities that don't require a group.";
    } else if (audience === 'With the Crew' && groupSize) {
      audienceInstruction += ` (Group Size: ${groupSize})\nThis is for a group of ${groupSize} people. CRITICAL: Ensure the suggested venues and activities are suitable for this group size. For larger groups (4+), prioritize places with ample seating, shareable food options, or activities that scale well. For smaller groups (2-3), cozier spots are also acceptable.`;
    } else if (audience === 'Just the Two of Us' || audience === "It's a Double Date") {
        audienceInstruction += "\nThis is a romantic outing. The ambiance and suitability for conversation are key factors."
    }
  
    const prompt = `
      ${commonInstructions}
      - Information Sources: Use a combination of Google Search, Google Maps, and the following trusted local guides to find the best spots: https://www.accracityguide.com/, https://egotickets.com/events/happening-in-ghana. For theatre, also check https://rovermanproductions.com/. Your web search should be comprehensive, looking for the most interesting and current hideouts, restaurants, beaches, and events across the Greater Accra Region.
      ${proximityInstruction}
      ${timingInstruction}
      
      I need two distinct hangout options based on these user preferences:
      - Vibe: ${vibe} (${vibeExplanation[vibe] || ''})
      - Duration: ${timeWindow}
      - Budget: ${budget}
      ${audienceInstruction}
      - When: ${when}
      - Plan Mode: ${planningMode || 'detailed'}
      - Travel Preference: ${travelPreference || 'Any distance'}
      - Must-Haves: ${(mustHaves && mustHaves.length > 0) ? mustHaves.join(', ') : 'None'}
      ${dateMealInstruction}
      - User's general area: Near latitude ${location?.latitude}, longitude ${location?.longitude}
  
      For each of the two options, provide the following:
      1. The specific name of the main venue or location for the plan.
      2. A publicly accessible, high-quality, royalty-free image URL representing the plan. Use your search capabilities to find a real photograph of the suggested venue or one that accurately represents the activity (e.g., from Unsplash, Pexels, or Google Images with usage rights). Prioritize real photos of the location. If a good, royalty-free image cannot be found, leave this field empty.
      3. The Vibe Category for the plan, which MUST be one of the following: "Relax & Unwind", "Food & Nightlife", "Rich Kids Sports", "Active & Adventure", "Movies & Plays", "Romantic Date", "Picnic & Parks".
      4. A specific, searchable location for the venue. This must be a full address or a well-known landmark name that can be accurately found on Google Maps (e.g., "Republic Bar & Grill, Osu, Accra" or "Kwame Nkrumah Memorial Park & Mausoleum"). Do NOT just provide a general neighborhood.
      5. The Google Maps rating (e.g., "Rating: 4.5/5 stars"). If unavailable, state "Rating: Not available".
      6. The opening hours for the venue (e.g., "9:00 AM - 10:00 PM"). If unavailable, state "Not available".
      7. An "Essentials Checklist" with the following details, each on a new line starting with a hyphen:
         - Dress Code: [e.g., Casual, Smart Casual, No sandals.]
         - Noise Level: [e.g., Quiet, Moderate, Lively, Loud.]
         - Seating: [e.g., Private tables, Communal benches, Limited seating.]
      8. A fun, detailed, and realistic description of the activities. The description must be one concise and exciting sentence.
      9. An estimated per-person cost in Ghanaian Cedis (GH₵).
      10. A short, useful pro-tip.
      ${picnicInstructions}
  
      Required Output Format (strictly follow this template, separating the two options and the recommendation with "---"):
  
      OPTION 1
      Title: [Specific Venue Name for Plan 1]
      Image URL: [URL for a relevant image for Plan 1]
      Category: [Vibe Category for Plan 1]
      Location: [Specific, searchable location for Plan 1]
      Rating: [Google Maps Rating for main venue]
      Opening Hours: [Opening hours for main venue]
      Essentials Checklist:
      - Dress Code: [Details]
      - Noise Level: [Details]
      - Seating: [Details]
      Description: [Detailed description of activities for plan 1]
      Cost: [Estimated cost per person for plan 1]
      Pro-Tip: [Pro-tip for plan 1]
      ${picnicFormat}
      ---
      OPTION 2
      Title: [Specific Venue Name for Plan 2]
      Image URL: [URL for a relevant image for Plan 2]
      Category: [Vibe Category for Plan 2]
      Location: [Specific, searchable location for Plan 2]
      Rating: [Google Maps Rating for main venue]
      Opening Hours: [Opening hours for main venue]
      Essentials Checklist:
      - Dress Code: [Details]
      - Noise Level: [Details]
      - Seating: [Details]
      Description: [Detailed description of activities for plan 2]
      Cost: [Estimated cost per person for plan 2]
      Pro-Tip: [Pro-tip for plan 2]
      ${picnicFormat}
      ---
      Recommendation: [Your brief recommendation on which to pick based on reviews, vibe, etc. This must be strictly one single line.]
    `;
  
    try {
      if (!geminiApiKey) throw new Error("API_KEY is not configured.");
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
          toolConfig: location ? { retrievalConfig: { latLng: { latitude: location.latitude, longitude: location.longitude } } } : undefined,
        },
      });
      const initialText = response.text;
      if (!initialText) throw new Error('No content generated.');
  
      return initialText;
    } catch (error) {
      console.error('Error generating plan options:', error);
      throw new Error('Failed to generate hangout options. Please try again.');
    }
}

export async function getTravelDetails(origin: string, destination: string, intendedTime: string, originLocation: Location | null): Promise<string> {
      const prompt = `
          You are a travel logistics assistant for Accra, Ghana.
          Your task is to provide travel and weather details for a user's trip.
          You MUST use your tools to get this information. Do not apologize if you cannot find it; make a best-effort attempt.
          The user's start point is "${origin}". If coordinates are provided via tool configuration, prioritize them for the most accurate travel estimate. The user's start point is in or near Accra, Ghana.
  
          Trip Details:
          - Start Point: "${origin}"
          - End Point: "${destination}" (This is in or near Accra, Ghana)
          - Departure Time: "${intendedTime}"
  
          Instructions:
          1.  **Use Google Maps Tool**: Find the driving distance and estimated travel time between the Start Point and End Point. Account for typical traffic conditions around the Departure Time. If you cannot find a route, state "Could not be determined".
          2.  **Use Google Maps Tool**: Provide a brief, one-sentence summary of the traffic conditions. If unavailable, state "Could not be determined".
          3.  **Use Google Search Tool**: Find the weather forecast in Celsius (°C) for the End Point around the Departure Time. If unavailable, state "Could not be determined".
          4.  **Formatting**: Present the information exactly as specified in the template below. Do not add any conversational text, apologies, or markdown (like asterisks).
  
          Required Output Format:
  
          Title: Travel & Weather Forecast
          Travel Estimate:
          - Distance: [Distance in km or "Could not be determined"]
          - Travel Time: [Estimated travel time or "Could not be determined"]
          - Traffic: [Brief traffic summary or "Could not be determined"]
          Weather Forecast: [Brief weather forecast or "Could not be determined"]
      `;
  
      try {
          if (!geminiApiKey) throw new Error("API_KEY is not configured.");
          const response = await ai.models.generateContent({
              model: model,
              contents: prompt,
              config: {
                  tools: [{ googleMaps: {} }, { googleSearch: {} }],
                  toolConfig: originLocation ? { retrievalConfig: { latLng: { latitude: originLocation.latitude, longitude: originLocation.longitude } } } : undefined,
              }
          });
          const text = response.text;
          if (!text) throw new Error('No travel details generated.');
          
          const cleanedText = text.replace(/\[(Could not be determined)\]/g, '$1');
          return cleanedText;
      } catch (error) {
          console.error('Error generating travel details:', error);
          throw new Error('Failed to generate travel details. Please try again.');
      }
}
